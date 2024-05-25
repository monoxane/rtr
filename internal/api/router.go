package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/router"
)

func HandleUpdateRouter(c *gin.Context) {
	var newRouterConfig config.RouterConfig
	err := c.BindJSON(&newRouterConfig)
	if err != nil {
		log.Error().Err(err).Msg("unable to bind config to object")
		c.Status(http.StatusBadRequest)

		return
	}

	err = config.SetRouter(newRouterConfig)
	if err != nil {
		log.Error().Err(err).Msg("unable to save router config")
		c.Status(http.StatusBadRequest)

		return
	}

	log.Info().Msg("saved router config")

	log.Info().Msg("closing existing router connection")
	router.Router.Disconnect()

	log.Info().Msg("connecting to router with new config")
	router.Connect(RouteUpdateHandler)

	time.Sleep(1 * time.Second)

	c.Status(http.StatusOK)
}

func HandleUpdateSource(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Error().Err(err).Msg("unable to read source id")
		c.Status(http.StatusBadRequest)

		return
	}

	var update router.SourceUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Error().Err(err).Msg("unable to bind source update to object")
		c.Status(http.StatusBadRequest)

		return
	}

	router.Matrix.SetSourceLabel(id, update.Label)
	router.Matrix.SetSourceDescription(id, update.Description)
}

func HandleUpdateDestination(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Error().Err(err).Msg("unable to read destination id")
		c.Status(http.StatusBadRequest)

		return
	}

	var update router.DestinationUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Error().Err(err).Msg("unable to bind destination update to object")
		c.Status(http.StatusBadRequest)

		return
	}

	log.Print(update)

	router.Matrix.SetDestinationLabel(id, update.Label)
	router.Matrix.SetDestinationDescription(id, update.Description)
}
