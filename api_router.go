package main

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func HandleUpdateRouter(c *gin.Context) {
	var newRouterConfig RouterConfig
	err := c.BindJSON(&newRouterConfig)
	if err != nil {
		log.Printf("unable to bind config to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	Config.Router = newRouterConfig
	Config.ConfigurationRequired = false
	Config.Save()
	log.Printf("saved new router config")

	log.Printf("closing existing router connection")
	router.Disconnect()

	router = nil

	log.Printf("connecting new router connection")
	ConnectRouter()

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

	var update SourceUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	router.UpdateSourceLabel(id, update.Label)
}

func HandleUpdateDestination(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("unable to read destination ID: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	var update DestinationUpdate
	err = c.BindJSON(&update)
	if err != nil {
		log.Printf("unable to bind update to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	router.UpdateDestinationLabel(id, update.Label)
}
