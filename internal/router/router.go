package router

import (
	"encoding/json"
	"log"
	"net"
	"os"

	nkrouter "github.com/monoxane/nk/pkg/router"

	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/model"
)

var (
	Router *nkrouter.Router
)

func ConnectRouter() {
	Router = nkrouter.New(net.ParseIP(config.Global.Router.IP), uint8(config.Global.Router.Address), config.Global.Router.Model)

	Router.SetOnUpdate(func(update *nkrouter.RouteUpdate) {
		log.Printf("Received %s update: %v%v", update.Type, update.Source, update.Destination)

		var payload []byte

		switch update.Type {
		case "destination":
			payload, _ = json.Marshal(model.DestinationUpdate{
				Id:    update.Destination.GetIDInt(),
				Label: update.Destination.GetLabel(),
				Source: model.SourceUpdate{
					Id:    update.Destination.Source.GetIDInt(),
					Label: update.Destination.Source.GetLabel(),
				},
			})

		case "source":
			payload, _ = json.Marshal(model.SourceUpdate{
				Id:    update.Source.GetIDInt(),
				Label: update.Source.GetLabel(),
			})
		}

		message := model.MatrixWSMessage{
			Type: update.Type + "_update",
			Data: payload,
		}

		MatrixWSConnectionsMutex.Lock()
		for conn := range MatrixWSConnections {
			conn.Socket.WriteJSON(message)
		}
		MatrixWSConnectionsMutex.Unlock()
	})

	data, err := os.ReadFile("labels.lbl")
	if err == nil {
		Router.LoadLabels(string(data))
	} else {
		log.Printf("unable to load DashBoard labels.lbl")
	}

	go Router.Connect()
}
