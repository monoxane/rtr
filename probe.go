package main

// The vast majority of this is modified from jsmpeg-stream-go by Chanishk
// Their package does not have a license and I was unable to contact them to ask if I could use it
// If anyone has a problem with the code being used here please let me know and I'll do my best to handle it
// Go check out Chanshik's stuff because it's pretty cool
// https://github.com/chanshik/jsmpeg-stream-go
// https://github.com/chanshik/

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ProbeClient struct {
	ws       *websocket.Conn
	sendChan chan *[]byte

	unregisterChan chan *ProbeClient
}

var (
	readBufferSize  int = 8192
	writeBufferSize int = 8192
)

func NewProbeClient(ws *websocket.Conn, unregisterChan chan *ProbeClient) *ProbeClient {
	client := &ProbeClient{
		ws:             ws,
		sendChan:       make(chan *[]byte, 512),
		unregisterChan: unregisterChan,
	}

	return client
}

func (c *ProbeClient) Close() {
	log.Println("Closing client's send channel")
	close(c.sendChan)
}

func (c *ProbeClient) ReadHandler() {
	defer func() {
		c.unregisterChan <- c
	}()

	for {
		msgType, msg, err := c.ws.ReadMessage()
		if err != nil {
			break
		}

		if msgType == websocket.CloseMessage {
			break
		}

		log.Println("Received from client: " + string(msg))
	}
}

func (c *ProbeClient) WriteHandler() {
	defer func() {
		c.unregisterChan <- c
	}()

	for data := range c.sendChan {
		c.ws.WriteMessage(websocket.BinaryMessage, *data)
	}
}

func (c *ProbeClient) Run() {
	go c.ReadHandler()
	go c.WriteHandler()
}

func SendProbeStats() {
	statuses := []ProbeChannelStatus{}

	for _, channel := range Config.Probe.Channels {
		statuses = append(statuses, channel.Handler.Status)
	}

	payload, _ := json.Marshal(statuses)
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

func (c *ProbeChannel) Start() {
	ctx, cancel := context.WithCancel(context.Background())

	c.Handler = &ProbeClientHandler{
		slug: c.Slug,
		Status: ProbeChannelStatus{
			ActiveSource: false,
		},
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
		context: ctx,
		cancel:  cancel,
		tcpPort: c.TCPPort,
	}

	go c.Handler.Run()
	if c.IngestTypeString == "ts-tcp" {
		go c.Handler.ServeTCPIngest()
	}
}

func (c *ProbeChannel) Stop() {
	c.Handler.cancel()
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
