package api

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
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

func HandleDashboardLabels(c *gin.Context) {
	// single file
	file, err := c.FormFile("rtr-dashboard-labels.lbl")
	if err != nil {
		log.Error().Err(err).Msg("unable to read uploaded file from request")
		c.Status(http.StatusBadRequest)

		return
	}

	// Upload the file to specific dst.
	c.SaveUploadedFile(file, "/tmp/rtr-dashboard-labels.lbl")

	log.Info().Msg("setting matrix labels from ross dashboard labels file")

	labels, err := os.ReadFile("labels.lbl")
	if err == nil {
		lines := strings.Split(string(labels), "\n")
		for i, line := range lines {
			columns := strings.Split(line, ",")
			if len(columns) < 4 {
				continue
			}

			router.Matrix.SetDestinationLabel(i+1, columns[1])
			router.Matrix.SetDestinationDescription(i+1, columns[2])

			router.Matrix.SetSourceLabel(i+1, columns[3])
			router.Matrix.SetSourceDescription(i+1, columns[4])

			time.Sleep(10 * time.Millisecond)
		}
	} else {
		log.Printf("unable to load DashBoard labels.lbl")
	}

	c.String(http.StatusOK, fmt.Sprintf("'%s' uploaded!", file.Filename))
}
