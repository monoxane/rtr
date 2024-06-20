package probe

import (
	"bufio"
	"context"
	"fmt"
	"net"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
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

	log zerolog.Logger

	upgrader *websocket.Upgrader
}

func (h *ProbeClientHandler) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.log.Info().Int("clients", len(h.clients)).Msg("client connected")
			h.Status.Clients = len(h.clients)
			SendProbeStats()

		case client := <-h.unregister:
			_, ok := h.clients[client]
			if ok {
				delete(h.clients, client)
			}
			h.log.Info().Int("clients", len(h.clients)).Msg("client disconnected")
			h.Status.Clients = len(h.clients)
			SendProbeStats()

		case data := <-h.broadcast:
			h.BroadcastData(data)
		}
	}
}

func (h *ProbeClientHandler) ServeTCPIngest() error {
	address := fmt.Sprintf("0.0.0.0:%d", h.tcpPort)
	listener, err := net.Listen("tcp", address)
	if err != nil {
		h.log.Error().Err(err).Str("address", address).Msg("unable to listen for transport stream")
		return errors.Wrap(err, "unable to listen on port")
	}

	for {
		conn, err := listener.Accept()
		if err != nil {
			h.log.Error().Err(err).Str("address", address).Msg("unable to handle incoming stream")
			return errors.Wrap(err, "unable to handle incoming stream")
		}

		h.log.Info().Str("address", conn.RemoteAddr().String()).Msg("stream connected")

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

				h.log.Warn().Err(err).Str("address", conn.RemoteAddr().String()).Msg("stream disconnected")

				break
			}

			txData := data[:length]

			h.BroadcastData(&txData)
		}

		h.Status.ActiveSource = false
		SendProbeStats()

		h.log.Warn().Str("address", conn.RemoteAddr().String()).Msg("stream disconnected connected")
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
		h.log.Error().Err(err).Str("address", c.ClientIP()).Msg("failed to upgrade client to ws")
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
