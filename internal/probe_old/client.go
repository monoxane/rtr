package probe

import (
	"github.com/gorilla/websocket"
)

type ProbeClient struct {
	ws       *websocket.Conn
	sendChan chan *[]byte

	unregisterChan chan *ProbeClient
}

func NewProbeClient(ws *websocket.Conn, unregisterChan chan *ProbeClient) *ProbeClient {
	client := &ProbeClient{
		ws:             ws,
		sendChan:       make(chan *[]byte, 512),
		unregisterChan: unregisterChan,
	}

	return client
}

func (c *ProbeClient) Close() {
	log.Info().Msg("closing client channel")
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

		log.Debug().Str("message", string(msg)).Int("type", msgType).Msg("received message from probe client")

		if msgType == websocket.CloseMessage {
			break
		}
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
