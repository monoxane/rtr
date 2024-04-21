package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/monoxane/nk"
)

var (
	router *nk.Router
)

func ConnectRouter() {
	router = nk.New(Config.Router.IP, uint8(Config.Router.Address), Config.Router.Model)

	router.SetOnUpdate(func(d *nk.Destination) {
		log.Printf("Received update for %s, current source %s", d.Label, d.Source.Label)
		payload, _ := json.Marshal(DestinationUpdate{
			Id:    int(d.Id),
			Label: d.GetLabel(),
			Source: SourceUpdate{
				Id:    int(d.Source.Id),
				Label: d.Source.GetLabel(),
			},
		})
		update := MatrixWSMessage{
			Type: "destination_update",
			Data: payload,
		}

		MatrixWSConnectionsMutex.Lock()
		for conn := range MatrixWSConnections {
			conn.Socket.WriteJSON(update)
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
