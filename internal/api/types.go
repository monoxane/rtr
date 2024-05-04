package api

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
)

type WebsocketConnection struct {
	Mux    *sync.Mutex
	Socket *websocket.Conn
}

type MatrixWSMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}
