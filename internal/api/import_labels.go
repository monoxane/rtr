package api

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/monoxane/rtr/internal/repository/spigots"
)

func HandleLabelImport(c *gin.Context) {
	filename := c.Query("filename")
	format := c.Query("format")
	router := c.Query("router")

	routerId, err := strconv.Atoi(router)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// single file
	file, err := c.FormFile(filename)
	if err != nil {
		log.Error().Err(err).Msg("unable to read uploaded file from request")
		c.Status(http.StatusBadRequest)

		return
	}

	// Upload the file to specific dst.
	c.SaveUploadedFile(file, "/tmp/rtr-"+filename)

	log.Info().Str("filename", filename).Str("format", format).Int("router", routerId).Msg("setting router spigot labels from imported file")

	switch format {
	case "rossDashboard":
		labels, err := os.ReadFile("/tmp/rtr-" + filename)
		if err == nil {
			lines := strings.Split(string(labels), "\n")
			for i, line := range lines {
				columns := strings.Split(line, ",")
				if len(columns) < 4 {
					continue
				}

				spigots.UpdateLabelsForRouterDestination(routerId, i+1, columns[1], columns[2])
				spigots.UpdateLabelsForRouterSource(routerId, i+1, columns[3], columns[4])

				// time.Sleep(10 * time.Millisecond)
			}
		}
	}

	c.String(http.StatusOK, fmt.Sprintf("'%s' uploaded!", file.Filename))
}
