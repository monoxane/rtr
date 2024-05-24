package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/config"
)

func HandleSalvoPost(c *gin.Context) {
	var salvo config.Salvo
	err := c.BindJSON(&salvo)
	if err != nil {
		log.Error().Err(err).Msg("unable to bind salvo to object")
		c.Status(http.StatusBadRequest)

		return
	}

	log.Info().Str("label", salvo.Label).Int("num_destinations", len(salvo.Destinations)).Msg("saving salvo")

	salvos := config.GetSalvos()

	for i, existingSalvo := range salvos {
		if existingSalvo.Label == salvo.Label {
			log.Info().Str("label", salvo.Label).Msg("existing salvo found with same name, updating it")
			salvos[i] = salvo
			err := config.SetSalvos(salvos)
			if err != nil {
				log.Error().Err(err).Msg("unable to save salvos")
				c.Status(http.StatusInternalServerError)

				return
			}

			c.Status(http.StatusOK)
			return
		}
	}

	salvos = append(salvos, salvo)
	log.Info().Str("label", salvo.Label).Msg("creating new salvo")
	err = config.SetSalvos(salvos)
	if err != nil {
		log.Error().Err(err).Msg("unable to save salvos")
		c.Status(http.StatusInternalServerError)

		return
	}

	c.Status(http.StatusOK)
}
