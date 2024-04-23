package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func serveHTTP() {
	gin.SetMode(gin.ReleaseMode)

	svc := gin.Default()
	svc.Use(CORSMiddleware())

	svc.StaticFile("/", "/dist/index.html")
	svc.NoRoute(func(c *gin.Context) {
		c.File("/dist/index.html")
	})
	svc.Static("/dist", "/dist")

	svc.GET("/v1/ws/rtr", HandleRtrWS)

	svc.GET("/v1/matrix", HandleMatrix)

	svc.POST("/v1/salvos", HandleSalvoPost)

	svc.GET("/v1/config", HandleConfig)
	svc.POST("/v1/config/router", HandleConfigRouterSave)
	svc.POST("/v1/config/source/:id", HandleSourcePOST)
	svc.POST("/v1/config/destination/:id", HandleDestinationPOST)
	svc.POST("/v1/config/probe/:id", HandleProbePOST)
	// svc.DELETE("/v1/config/probe/:id", HandleProbeDELETE)

	if Config.Probe.Enabled {
		svc.GET("/v1/ws/probe/:id", func(ctx *gin.Context) {
			id := ctx.Param("id")
			index, err := strconv.Atoi(id)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"code": http.StatusBadRequest, "message": "invalid probe id", "error": err.Error()})
				log.Printf("[probe-viewer] unable to handle stream: %s", err)
				return
			}

			if index > len(ProbeHandlers) || index < 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"code": http.StatusBadRequest, "message": "invalid probe id"})
				log.Printf("[probe-viewer] unable to handle stream: %s", err)
				return
			}

			ProbeHandlers[index].ServeWS(ctx)
		})

		svc.POST("/v1/probe/stream/:id", HandleHTTPProbeStream)
	}

	err := svc.Run(fmt.Sprintf(":%d", Config.Server.HTTPPort))
	if err != nil {
		log.Fatalln("unable to start http server", err)
	}
}

func HandleMatrix(c *gin.Context) {
	c.JSON(http.StatusOK, &router.Matrix)
}

func HandleConfig(c *gin.Context) {
	c.JSON(http.StatusOK, Config)
}

func HandleConfigRouterSave(c *gin.Context) {
	var newRouterConfig RouterConfig
	err := c.BindJSON(&newRouterConfig)
	if err != nil {
		log.Printf("unable to bind config to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	Config.Router = newRouterConfig
	Config.Save()
	log.Printf("saved new router config")

	log.Printf("closing existing router connection")
	router.Conn.Close()

	router = nil

	log.Printf("connecting new router connection")
	ConnectRouter()

	time.Sleep(1 * time.Second)

	c.Status(http.StatusOK)
}

func HandleSourcePOST(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("unable to read source ID: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	var update SourceUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	router.UpdateSourceLabel(id, update.Label)
}

func HandleDestinationPOST(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("unable to read destination ID: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	var update DestinationUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	router.UpdateDestinationLabel(id, update.Label)
}

func HandleSalvoPost(c *gin.Context) {
	var salvo Salvo
	err := c.BindJSON(&salvo)
	if err != nil {
		log.Printf("unable to bind salvo to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	log.Printf("saving salvo: %+v", salvo)

	for i, existingSalvo := range Config.Salvos {
		if existingSalvo.Label == salvo.Label {
			log.Printf("updating existing salvo")
			Config.Salvos[i] = salvo
			c.Status(http.StatusOK)
			Config.Save()

			return
		}
	}

	Config.Salvos = append(Config.Salvos, salvo)
	log.Printf("added new salvo")
	Config.Save()

	c.Status(http.StatusOK)
}

func HandleProbePOST(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("unable to read probe channel ID: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	var update ProbeChannel
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	Config.Probe.Channels[id-1] = update

	c.JSON(http.StatusOK, Config.Probe.Channels[id-1])
}

func HandleRtrWS(c *gin.Context) {
	w := c.Writer
	r := c.Request

	// Process the upgrade request
	socket, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": http.StatusBadRequest, "message": "failed to upgrade ws connection", "error": err})

		return
	}

	connection := WebsocketConnection{
		Socket: socket,
		Mux:    new(sync.Mutex),
	}

	MatrixWSConnectionsMutex.Lock()
	MatrixWSConnections[connection] = uuid.Must(uuid.NewRandom())
	MatrixWSConnectionsMutex.Unlock()

	defer connection.Socket.Close()

	go func() {
		time.Sleep(500 * time.Millisecond)
		SendProbeStats()
	}()

	for {
		_, messageBytes, err := connection.Socket.ReadMessage()
		if err != nil {
			log.Printf("WSErr %s", err)
			MatrixWSConnectionsMutex.Lock()
			delete(MatrixWSConnections, connection)
			MatrixWSConnectionsMutex.Unlock()

			return
		}

		var message MatrixWSMessage
		unmarshalErr := json.Unmarshal(messageBytes, &message)
		if unmarshalErr != nil {
			log.Printf("unable to unmarshal Matrix WS Message %s", unmarshalErr)

			break
		}

		switch message.Type {
		case "route_request":
			var request RouteRequest
			unmarshalErr := json.Unmarshal(message.Data, &request)
			if unmarshalErr != nil {
				log.Printf("unable to unmarshal Route Request %s", unmarshalErr)
			}

			log.Printf("routing %d to %d", request.Source, request.Destination)

			router.Route(uint16(request.Destination), uint16(request.Source))
		}
	}
}

func HandleHTTPProbeStream(c *gin.Context) {
	id := c.Param("id")
	index, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": http.StatusBadRequest, "message": "invalid probe id", "error": err.Error()})
		log.Printf("[probe] unable to handle stream: %s", err)
		return
	}

	log.Printf("stream for probe %d connected from %s", index, c.RemoteIP())

	ProbeStats[index].ActiveSource = true
	SendProbeStats()

	for {
		data, err := io.ReadAll(io.LimitReader(c.Request.Body, 1024))
		if err != nil || len(data) == 0 {
			break
		}

		ProbeHandlers[index].BroadcastData(&data)
	}

	ProbeStats[index].ActiveSource = false
	SendProbeStats()

	log.Printf("stream for probe %d disconnected from %s", index, c.RemoteIP())
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
