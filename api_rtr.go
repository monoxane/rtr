package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

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
