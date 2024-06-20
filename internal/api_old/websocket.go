package api

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/monoxane/rtr/internal/probe"
	"github.com/monoxane/rtr/internal/router"
)

type WebsocketConnection struct {
	Mux    *sync.Mutex
	Socket *websocket.Conn
}

type websocketMessage struct {
	Type messageType     `json:"type"`
	Data json.RawMessage `json:"data"`
}

type messageType string

var (
	RouteRequest      messageType = "route_request"
	ProbeStats        messageType = "probe_stats"
	DestinationUpdate messageType = "destination_update"
	SourceUpdate      messageType = "source_update"
)

var (
	MatrixWSConnections      = make(map[WebsocketConnection]uuid.UUID)
	MatrixWSConnectionsMutex sync.Mutex
	Upgrader                 = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
)

func WriteToAllClients(message websocketMessage) {
	MatrixWSConnectionsMutex.Lock()
	for conn := range MatrixWSConnections {
		conn.Socket.WriteJSON(message)
	}
	MatrixWSConnectionsMutex.Unlock()
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

	// go func() {
	// 	time.Sleep(500 * time.Millisecond)
	// 	SendProbeStats()
	// }()

	for {
		_, messageBytes, err := connection.Socket.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err) {
				log.Warn().Err(err).Msg("websocket connection error")
			} else {
				log.Info().Msg("websocket connection closed")
			}
			MatrixWSConnectionsMutex.Lock()
			delete(MatrixWSConnections, connection)
			MatrixWSConnectionsMutex.Unlock()

			return
		}

		var message websocketMessage
		unmarshalErr := json.Unmarshal(messageBytes, &message)
		if unmarshalErr != nil {
			log.Error().Err(err).Msg("unable to unmarshal rtr ws message")

			break
		}

		switch message.Type {
		case "route_request":
			var request router.RouteRequest
			unmarshalErr := json.Unmarshal(message.Data, &request)
			if unmarshalErr != nil {
				log.Error().Err(err).Msg("unable to unmarshal rtr route request")
			}

			log.Info().Int("source", request.Source).Int("destination", request.Destination).Msg("handling route request")

			router.Router.Route(request.Destination, request.Source)
		}
	}
}

func RouteUpdateHandler(update *router.RouteUpdate) {
	var payload []byte
	var mt messageType

	switch update.Type {
	case "destination":
		mt = DestinationUpdate
		payload, _ = json.Marshal(router.DestinationUpdate{
			Id:          update.Destination.GetID(),
			Label:       update.Destination.GetLabel(),
			Description: update.Destination.Description,
			Source: router.SourceUpdate{
				Id:          update.Destination.Source.GetID(),
				Label:       update.Destination.Source.GetLabel(),
				Description: update.Destination.Source.Description,
			},
		})

	case "source":
		mt = SourceUpdate
		payload, _ = json.Marshal(router.SourceUpdate{
			Id:          update.Source.GetID(),
			Label:       update.Source.GetLabel(),
			Description: update.Source.Description,
		})
	}

	message := websocketMessage{
		Type: mt,
		Data: payload,
	}

	WriteToAllClients(message)
}

func ProbeStatsHandler(stats map[string]probe.ProbeChannelStatus) {
	payload, _ := json.Marshal(stats)

	message := websocketMessage{
		Type: ProbeStats,
		Data: payload,
	}
	WriteToAllClients(message)
}
