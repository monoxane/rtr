package api

import (
	"log"
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
		log.Printf("unable to bind config to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	config.Global.Router = newRouterConfig
	config.Global.ConfigurationRequired = false
	config.Save()
	log.Printf("saved new router config")

	log.Printf("closing existing router connection")
	router.Router.Disconnect()

	log.Printf("connecting new router connection")
	router.ConnectRouter()

	time.Sleep(1 * time.Second)

	c.Status(http.StatusOK)
}

func HandleUpdateSource(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("unable to read source ID: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	var update router.SourceUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	router.Router.UpdateSourceLabel(id, update.Label)
}

func HandleUpdateDestination(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("unable to read destination ID: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	var update router.DestinationUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	router.Router.UpdateDestinationLabel(id, update.Label)
}
