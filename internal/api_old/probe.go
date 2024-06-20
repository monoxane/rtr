package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/probe"
)

func HandleNewProbe(c *gin.Context) {
	log.Info().Msg("creating new probe")

	channel := config.ProbeChannel{
		Label:            fmt.Sprintf("Probe Channel %d", len(config.GetProbe().Channels)+1),
		Slug:             fmt.Sprintf("probe-channel-%d", len(config.GetProbe().Channels)+1),
		IngestTypeString: "ts-http",
	}

	probeConfig := config.GetProbe()

	probeConfig.Channels = append(probeConfig.Channels, &channel)
	probeConfig.Enabled = true

	err := config.SetProbe(probeConfig)
	if err != nil {
		log.Error().Err(err).Msg("unable to save probe configuration")
		c.Status(http.StatusInternalServerError)

		return
	}

	c.Status(http.StatusOK)
}

func HandleUpdateProbe(c *gin.Context) {
	slug := c.Param("slug")

	log.Info().Str("slug", slug).Msg("updating probe channel")

	var update config.ProbeChannel
	err := c.BindJSON(&update)
	if err != nil {
		log.Error().Err(err).Msg("unable to bind body to config.ProbeChannel")
		c.Status(http.StatusBadRequest)

		return
	}

	probeConfig := config.GetProbe()

	for i, channel := range probeConfig.Channels {
		if channel.Slug == slug {
			probe.UpdateChannel(slug, &update)

			probeConfig.Channels[i] = &update

			err := config.SetProbe(probeConfig)
			if err != nil {
				log.Error().Err(err).Msg("unable to save probe configuration")
				c.Status(http.StatusInternalServerError)

				return
			}

			c.JSON(http.StatusOK, channel)
			return
		}
	}

	c.Status(http.StatusNotFound)
}

func HandleDeleteProbe(c *gin.Context) {
	slug := c.Param("slug")

	probeConfig := config.GetProbe()

	for i, channel := range probeConfig.Channels {
		if channel.Slug == slug {
			probeConfig.Channels = append(probeConfig.Channels[:i], probeConfig.Channels[i+1:]...)

			err := config.SetProbe(probeConfig)
			if err != nil {
				log.Error().Err(err).Msg("unable to save probe configuration")
				c.Status(http.StatusInternalServerError)

				return
			}

			c.Status(http.StatusOK)
			return
		}
	}

	c.Status(http.StatusNotFound)
}

func HandleProbeClient(c *gin.Context) {
	slug := c.Param("slug")

	code := probe.HandleClient(slug, c)
	if code == http.StatusGone {
		c.JSON(code, gin.H{"code": code, "message": "probe channel stopped working"})
	}
	log.Warn().Str("slug", slug).Int("code", code).Msg("unable to handle client connection")
}

func HandleHTTPProbeStream(c *gin.Context) {
	slug := c.Param("slug")
	probe.HandleStream(slug, c)
}

var statusGetter func() map[string]probe.ProbeChannelStatus

func SetProbeStatusGetter(getter func() map[string]probe.ProbeChannelStatus) {
	statusGetter = getter
}

func HandleGetProbeStatuses(c *gin.Context) {
	c.JSON(http.StatusOK, statusGetter())
}
