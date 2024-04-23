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

	router.SetOnUpdate(func(u *nk.Update) {
		log.Printf("Received %s update: %v", u.Type, u.Data)

		var payload []byte

		switch u.Type {
		case "destination":
			update := u.Data.(*nk.Destination)
			payload, _ = json.Marshal(DestinationUpdate{
				Id:    update.GetIDInt(),
				Label: update.GetLabel(),
				Source: SourceUpdate{
					Id:    update.Source.GetIDInt(),
					Label: update.Source.GetLabel(),
				},
			})

		case "source":
			update := u.Data.(*nk.Source)
			payload, _ = json.Marshal(SourceUpdate{
				Id:    update.GetIDInt(),
				Label: update.GetLabel(),
			})
		}

		update := MatrixWSMessage{
			Type: u.Type + "_update",
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
