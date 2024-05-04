package api

import (
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/model"
)

func HandleNewProbe(c *gin.Context) {
	channel := model.ProbeChannel{
		Label:            fmt.Sprintf("Probe Channel %d", len(config.Global.Probe.Channels)+1),
		Slug:             fmt.Sprintf("probe-channel-%d", len(config.Global.Probe.Channels)+1),
		IngestTypeString: "ts-http",
	}

	config.Global.Probe.Channels = append(config.Global.Probe.Channels, &channel)

	log.Printf("Created new probe channel")
	config.Global.Probe.Enabled = true
	config.Save()

	c.Status(http.StatusOK)
}

func HandleUpdateProbe(c *gin.Context) {
	slug := c.Param("slug")

	var update ProbeChannel
	err := c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	for i, channel := range config.Global.Probe.Channels {
		if channel.Slug == slug {
			config.Global.Probe.Channels[i].Stop()
			config.Global.Probe.Channels[i] = &update
			config.Global.Probe.Channels[i].Start()

			config.Save()

			c.JSON(http.StatusOK, channel)
			return
		}
	}
}

func HandleDeleteProbe(c *gin.Context) {
	slug := c.Param("slug")

	for i, channel := range config.Global.Probe.Channels {
		if channel.Slug == slug {
			config.Global.Probe.Channels = append(config.Global.Probe.Channels[:i], config.Global.Probe.Channels[i+1:]...)

			c.Status(http.StatusOK)
			return
		}
	}
}

func HandleProbeClient(c *gin.Context) {
	slug := c.Param("slug")

	for _, channel := range config.Global.Probe.Channels {
		if channel.Slug == slug {
			channel.Handler.ServeWS(c)

			return
		}
	}
	c.JSON(http.StatusBadRequest, gin.H{"code": http.StatusBadRequest, "message": "invalid probe channel"})
	log.Printf("[probe-viewer] unable to handle stream: %s", slug)
}

func HandleHTTPProbeStream(c *gin.Context) {
	slug := c.Param("slug")

	log.Printf("stream for probe %s connected from %s", slug, c.RemoteIP())

	for _, channel := range config.Global.Probe.Channels {
		if channel.Slug == slug {
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

			log.Printf("stream for probe %s disconnected from %s", slug, c.RemoteIP())

			return
		}
	}
}
