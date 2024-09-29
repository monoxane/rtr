package streams

import (
	"context"
	"io"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/streams"
	"github.com/rs/zerolog"
)

var (
	log zerolog.Logger

	readBufferSize  int = 8192
	writeBufferSize int = 8192

	streamInstances    map[int]*streamInstance
	streamInstancesMux sync.Mutex
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("controller", "stream").Logger()
	streams.SetLogger(logger)
}

type streamInstance struct {
	stream  *model.Stream
	handler *ProbeClientHandler
}

func LoadStreams() error {
	streamInstances = make(map[int]*streamInstance)

	allStreams, err := streams.List()
	if err != nil {
		return err
	}

	for _, stream := range allStreams {
		UpdateStream(stream)
	}

	return nil
}

func UpdateStream(stream *model.Stream) {
	instance := streamInstance{
		stream: stream,
	}

	streams.UpdateClients(stream.ID, 0)
	streams.UpdateStatus(stream.ID, false)

	streamInstancesMux.Lock()
	defer streamInstancesMux.Unlock()

	if _, exists := streamInstances[stream.ID]; exists {
		streamInstances[stream.ID].Stop()

		delete(streamInstances, stream.ID)
	}

	streamInstances[stream.ID] = &instance
	instance.Start()
}

func DeleteStream(stream int) {
	streamInstancesMux.Lock()
	defer streamInstancesMux.Unlock()

	streamInstances[stream].Stop()
	delete(streamInstances, stream)
}

func Ingest(slug string, c *gin.Context) {
	stream, err := streams.GetBySlug(slug)
	if err != nil {
		c.String(http.StatusNotFound, "stream not found")

		return
	}

	if instance, ok := streamInstances[stream.ID]; ok {
		instance.Ingest(c)
	} else {
		c.String(http.StatusNotFound, "stream not found")
	}
}

func (s *streamInstance) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	log.Debug().Str("stream", s.stream.Slug).Int("id", s.stream.ID).Msg("starting stream channel")

	s.handler = &ProbeClientHandler{
		stream:     s.stream,
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
		log:     log.With().Str("slug", s.stream.Slug).Int("id", s.stream.ID).Logger(),
		context: ctx,
		cancel:  cancel,
	}

	go s.handler.Run()
}

func (s *streamInstance) Stop() {
	if s.handler != nil {
		s.handler.cancel()
	}
}

func (s *streamInstance) Ingest(c *gin.Context) {
	s.handler.log.Info().Str("address", c.ClientIP()).Msg("stream source connected")

	streams.UpdateStatus(s.stream.ID, true)

	for {
		data, err := io.ReadAll(io.LimitReader(c.Request.Body, 1024))
		if err != nil || len(data) == 0 {
			break
		}

		s.handler.BroadcastData(&data)
	}

	s.handler.log.Info().Str("address", c.ClientIP()).Msg("stream source disconnected")
	streams.UpdateStatus(s.stream.ID, false)
}

func Client(slug string, c *gin.Context) int {
	stream, err := streams.GetBySlug(slug)
	if err != nil {
		c.String(http.StatusNotFound, "stream not found")

		return http.StatusNotFound
	}

	if instance, ok := streamInstances[stream.ID]; ok {
		instance.handler.ServeWS(c)
		return http.StatusGone
	} else {
		return http.StatusNotFound
	}
}
