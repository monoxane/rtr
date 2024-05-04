package probe

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ProbeClientHandler struct {
	slug       string
	Status     ProbeChannelStatus
	clients    map[*ProbeClient]bool // *client -> is connected (true/false)
	register   chan *ProbeClient
	unregister chan *ProbeClient
	broadcast  chan *[]byte

	tcpPort int

	context context.Context
	cancel  context.CancelFunc
	mux     sync.Mutex

	upgrader *websocket.Upgrader
}

func (h *ProbeClientHandler) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("[probe %s] client connected. active clients: %d\n", h.slug, len(h.clients))
			h.Status.Clients = len(h.clients)
			SendProbeStats()

		case client := <-h.unregister:
			_, ok := h.clients[client]
			if ok {
				delete(h.clients, client)
			}
			log.Printf("[probe %s] client disconnected. active clients: %d\n", h.slug, len(h.clients))
			h.Status.Clients = len(h.clients)
			SendProbeStats()

		case data := <-h.broadcast:
			h.BroadcastData(data)
		}
	}
}

func (h *ProbeClientHandler) ServeTCPIngest() {
	listener, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", h.tcpPort))
	if err != nil {
		log.Fatalf("unable to listen for transport stream on %s: %s", listener.Addr(), err)
	}

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("error handling tcp transport stream connection: %s", err)
		}

		log.Printf("stream for probe %s connected from %s", h.slug, conn.RemoteAddr())

		h.Status.ActiveSource = true
		SendProbeStats()

		reader := bufio.NewReader(conn)

		for {
			data := make([]byte, 1024)
			length, err := reader.Read(data)
			if err != nil || length == 0 {
				conn.Close()
				h.Status.ActiveSource = false
				SendProbeStats()

				log.Printf("stream for probe %s disconnected from %s", h.slug, conn.RemoteAddr())

				break
			}

			txData := data[:length]

			h.BroadcastData(&txData)
		}

		h.Status.ActiveSource = false
		SendProbeStats()

		log.Printf("stream for probe %s disconnected from %s", h.slug, conn.RemoteAddr())
	}
}

func (h *ProbeClientHandler) ServeWS(c *gin.Context) {
	if c.Request.Method != "GET" {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"code": http.StatusMethodNotAllowed, "error": "Method Not Allowed"})
		return
	}

	w := c.Writer
	r := c.Request

	ws, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := NewProbeClient(ws, h.unregister)

	h.register <- client

	go client.Run()
}

func (h *ProbeClientHandler) BroadcastData(data *[]byte) {
	h.mux.Lock()
	for client := range h.clients {
		client.sendChan <- data
	}
	h.mux.Unlock()
}
