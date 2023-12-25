package main

// The vast majority of this is modified from jsmpeg-stream-go by Chanishk
// Their package does not have a license and I was unable to contact them to ask if I could use it
// If anyone has a problem with the code being used here please let me know and I'll do my best to handle it
// Go check out Chanshik's stuff because it's pretty cool
// https://github.com/chanshik/jsmpeg-stream-go
// https://github.com/chanshik/

import (
	"bufio"
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

	for {
		select {
		case data, ok := <-c.sendChan:
			if !ok {
				log.Println("Client send failed")
				c.ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.ws.WriteMessage(websocket.BinaryMessage, *data)
		}
	}
}

func (c *ProbeClient) Run() {
	go c.ReadHandler()
	go c.WriteHandler()
}

type ProbeSocketHandler struct {
	Id         int
	clients    map[*ProbeClient]bool // *client -> is connected (true/false)
	register   chan *ProbeClient
	unregister chan *ProbeClient
	broadcast  chan *[]byte

	upgrader *websocket.Upgrader

	mux sync.Mutex
}

func (h *ProbeSocketHandler) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("[probe %d] client connected. active clients: %d\n", h.Id, len(h.clients))
			ProbeStats[h.Id].Clients = len(h.clients)
			SendProbeStats()

		case client := <-h.unregister:
			_, ok := h.clients[client]
			if ok {
				delete(h.clients, client)
			}
			log.Printf("[probe %d] client disconnected. active clients: %d\n", h.Id, len(h.clients))
			ProbeStats[h.Id].Clients = len(h.clients)
			SendProbeStats()

		case data := <-h.broadcast:
			h.BroadcastData(data)
		}
	}
}

func (c *ProbeSocketHandler) ServeTCPIngest() {
	listener, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", Config.Server.FirstProbeStreamPort+c.Id))
	if err != nil {
		log.Fatalf("unable to listen for transport stream on %s: %s", listener.Addr(), err)
	}

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("error handling tcp transport stream connection: %s", err)
		}

		log.Printf("stream for probe %d connected from %s", c.Id, conn.RemoteAddr())

		ProbeStats[c.Id].ActiveSource = true
		SendProbeStats()

		reader := bufio.NewReader(conn)

		for {
			data := make([]byte, 1024)
			length, err := reader.Read(data)
			if err != nil || length == 0 {
				conn.Close()
				ProbeStats[c.Id].ActiveSource = false
				SendProbeStats()

				log.Printf("stream for probe %d disconnected from %s", c.Id, conn.RemoteAddr())

				break
			}

			txData := data[:length]

			c.BroadcastData(&txData)
		}

		ProbeStats[c.Id].ActiveSource = false
		SendProbeStats()

		log.Printf("stream for probe %d disconnected from %s", c.Id, conn.RemoteAddr())
	}
}

func (h *ProbeSocketHandler) ServeWS(c *gin.Context) {
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

func (h *ProbeSocketHandler) BroadcastData(data *[]byte) {
	h.mux.Lock()
	for client := range h.clients {
		client.sendChan <- data
	}
	h.mux.Unlock()
}
