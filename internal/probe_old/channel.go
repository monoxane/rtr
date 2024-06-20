package probe

import (
	"context"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/monoxane/rtr/internal/config"
)

type ProbeChannel struct {
	*config.ProbeChannel
	Handler *ProbeClientHandler `json:"-"`
}

func (c *ProbeChannel) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	log.Debug().Str("channel", c.Slug).Msg("starting probe channel")

	c.Handler = &ProbeClientHandler{
		slug: c.Slug,
		Status: ProbeChannelStatus{
			Slug:         c.Slug,
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
		log:     log.With().Str("object", "probeChannelHandler").Str("channel", c.Slug).Logger(),
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
	if c.Handler != nil {
		c.Handler.cancel()
	}
}
