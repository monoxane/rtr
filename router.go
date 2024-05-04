package main

import (
	"encoding/json"
	"log"
	"net"
	"os"

	nkrouter "github.com/monoxane/nk/pkg/router"
)

var (
	router *nkrouter.Router
)

func ConnectRouter() {
	router = nkrouter.New(net.ParseIP(Config.Router.IP), uint8(Config.Router.Address), Config.Router.Model)

	router.SetOnUpdate(func(update *nkrouter.RouteUpdate) {
		log.Printf("Received %s update: %v%v", update.Type, update.Source, update.Destination)

		var payload []byte

		switch update.Type {
		case "destination":
			payload, _ = json.Marshal(DestinationUpdate{
				Id:    update.Destination.GetIDInt(),
				Label: update.Destination.GetLabel(),
				Source: SourceUpdate{
					Id:    update.Destination.Source.GetIDInt(),
					Label: update.Destination.Source.GetLabel(),
				},
			})

		case "source":
			payload, _ = json.Marshal(SourceUpdate{
				Id:    update.Source.GetIDInt(),
				Label: update.Source.GetLabel(),
			})
		}

		message := MatrixWSMessage{
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
		router.LoadLabels(string(data))
	} else {
		log.Printf("unable to load DashBoard labels.lbl")
	}

	go router.Connect()
}
