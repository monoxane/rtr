package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/controller/streams"
)

func HandleStreamSource(c *gin.Context) {
	slug := c.Param("slug")
	streams.Ingest(slug, c)
}

func HandleStreamClient(c *gin.Context) {
	slug := c.Param("slug")

	code := streams.Client(slug, c)
	if code == http.StatusGone {
		c.JSON(code, gin.H{"code": code, "message": "probe channel stopped working"})
	}
	log.Warn().Str("slug", slug).Int("code", code).Msg("unable to handle client connection")
}
