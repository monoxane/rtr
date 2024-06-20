package probe

import (
	"io"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/config"
	"github.com/rs/zerolog"
)

// The vast majority of this is modified from jsmpeg-stream-go by Chanishk
// Their package does not have a license and I was unable to contact them to ask if I could use it
// If anyone has a problem with the code being used here please let me know and I'll do my best to handle it
// Go check out Chanshik's stuff because it's pretty cool
// https://github.com/chanshik/jsmpeg-stream-go
// https://github.com/chanshik/

var (
	readBufferSize  int = 8192
	writeBufferSize int = 8192
	channelsMux     sync.Mutex
	channels        map[string]*ProbeChannel
	log             zerolog.Logger
)

func Logger(logger zerolog.Logger) {
	log = logger
}

func LoadChannels(configChannels []*config.ProbeChannel) {
	channels = make(map[string]*ProbeChannel)

	for _, configChannel := range configChannels {
		loadChannel(configChannel)
	}
}

func loadChannel(configChannel *config.ProbeChannel) {
	log.Debug().Str("channel", configChannel.Slug).Msg("loading channel configuration")

	c := &ProbeChannel{
		ProbeChannel: configChannel,
	}

	channelsMux.Lock()
	channels[c.Slug] = c
	channelsMux.Unlock()

	go c.Start()
}

func UpdateChannel(slug string, configChannel *config.ProbeChannel) error {
	channelsMux.Lock()

	if channel, ok := channels[slug]; ok {
		channel.Stop()

		delete(channels, slug)
	}
	channelsMux.Unlock()

	loadChannel(configChannel)

	return nil
}

func HandleStream(slug string, c *gin.Context) {
	if channel, ok := channels[slug]; ok {
		log.Info().Str("slug", slug).Str("address", c.ClientIP()).Msg("stream connected")

		channel.Handler.Status.ActiveSource = true
		SendProbeStats()

		for {
			data, err := io.ReadAll(io.LimitReader(c.Request.Body, 1024))
			if err != nil || len(data) == 0 {
				break
			}

			channel.Handler.BroadcastData(&data)
		}

		channel.Handler.Status.ActiveSource = false
		SendProbeStats()

		log.Info().Str("slug", slug).Str("address", c.ClientIP()).Msg("stream disconnected")
	} else {
		c.String(http.StatusNotFound, "channel not found")
	}
}

func HandleClient(slug string, c *gin.Context) int {
	if channel, ok := channels[slug]; ok {
		channel.Handler.ServeWS(c)
		return http.StatusGone
	} else {
		return http.StatusNotFound
	}
}
