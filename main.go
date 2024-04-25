package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
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

type WebsocketConnection struct {
	Mux    *sync.Mutex
	Socket *websocket.Conn
}

type MatrixWSMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type RouteRequest struct {
	Destination int `json:"destination"`
	Source      int `json:"source"`
}

type DestinationUpdate struct {
	Id     int          `json:"id"`
	Label  string       `json:"label"`
	Source SourceUpdate `json:"source"`
}

type ProbeChannelStatus struct {
	Id           int  `json:"id"`
	ActiveSource bool `json:"active_source"`
	Clients      int  `json:"clients"`
}

type SourceUpdate struct {
	Id    int    `json:"id"`
	Label string `json:"label"`
}

func main() {
	ConnectRouter()

	if len(Config.Probe.Channels) != 0 {
		for _, c := range Config.Probe.Channels {
			c.Start()
		}
	}

	go serveHTTP()

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Println(sig)
		done <- true
	}()

	log.Println("Server Start Awaiting Signal")
	<-done
	log.Println("Exiting")
}
