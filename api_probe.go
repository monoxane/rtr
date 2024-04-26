package main

import (
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleNewProbe(c *gin.Context) {
	channel := ProbeChannel{
		Label:            fmt.Sprintf("Probe Channel %d", len(Config.Probe.Channels)+1),
		Slug:             fmt.Sprintf("probe-channel-%d", len(Config.Probe.Channels)+1),
		IngestTypeString: "ts-http",
	}

	Config.Probe.Channels = append(Config.Probe.Channels, &channel)

	log.Printf("Created new probe channel")
	Config.Probe.Enabled = true
	Config.Save()

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

	for i, channel := range Config.Probe.Channels {
		if channel.Slug == slug {
			Config.Probe.Channels[i].Stop()
			Config.Probe.Channels[i] = &update
			Config.Probe.Channels[i].Start()

			Config.Save()

			c.JSON(http.StatusOK, channel)
			return
		}
	}
}

func HandleDeleteProbe(c *gin.Context) {
	slug := c.Param("slug")

	for i, channel := range Config.Probe.Channels {
		if channel.Slug == slug {
			Config.Probe.Channels = append(Config.Probe.Channels[:i], Config.Probe.Channels[i+1:]...)

			c.Status(http.StatusOK)
			return
		}
	}
}

func HandleProbeClient(c *gin.Context) {
	slug := c.Param("slug")

	for _, channel := range Config.Probe.Channels {
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

	for _, channel := range Config.Probe.Channels {
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
