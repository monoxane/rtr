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
	"github.com/monoxane/nk"
)

var (
	router *nk.Router

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

	if Config.Probe.Enabled {
		ProbeHandlers = make([]*ProbeSocketHandler, len(Config.Probe.RouterDestinations))
		ProbeStats = make([]*ProbeChannelStatus, len(Config.Probe.RouterDestinations))
		for i := range ProbeStats {
			ProbeStats[i] = &ProbeChannelStatus{
				Id: i,
			}
		}

		for i := range Config.Probe.RouterDestinations {
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

	go router.Connect()
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

func SendProbeStats() {
	payload, _ := json.Marshal(ProbeStats)
	update := MatrixWSMessage{
		Type: "probe_stats",
		Data: payload,
	}

	MatrixWSConnectionsMutex.Lock()
	for conn := range MatrixWSConnections {
		conn.Socket.WriteJSON(update)
	}
	MatrixWSConnectionsMutex.Unlock()
}
