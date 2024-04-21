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
	ProbeHandlers            []*ProbeSocketHandler
	MatrixWSConnections      = make(map[WebsocketConnection]uuid.UUID)
	MatrixWSConnectionsMutex sync.Mutex
	Upgrader                 = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}

	ProbeStats []*ProbeChannelStatus
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

	if Config.Probe.Enabled {
		ProbeHandlers = make([]*ProbeSocketHandler, len(Config.Probe.Channels))
		ProbeStats = make([]*ProbeChannelStatus, len(Config.Probe.Channels))
		for i := range ProbeStats {
			ProbeStats[i] = &ProbeChannelStatus{
				Id: i,
			}
		}

		for i := range Config.Probe.Channels {
			ProbeHandlers[i] = &ProbeSocketHandler{
				Id:         i,
				clients:    make(map[*ProbeClient]bool),
				register:   make(chan *ProbeClient),
				unregister: make(chan *ProbeClient),
				broadcast:  make(chan *[]byte),
				upgrader: &websocket.Upgrader{
					ReadBufferSize:  readBufferSize,
					WriteBufferSize: writeBufferSize,
					CheckOrigin: func(r *http.Request) bool {
						return true
					},
				},
			}

			go ProbeHandlers[i].Run()
			go ProbeHandlers[i].ServeTCPIngest()
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
