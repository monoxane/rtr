package api

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/config"
)

func HandleSalvoPost(c *gin.Context) {
	var salvo config.Salvo
	err := c.BindJSON(&salvo)
	if err != nil {
		log.Printf("unable to bind salvo to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	log.Printf("saving salvo: %+v", salvo)

	for i, existingSalvo := range config.Global.Salvos {
		if existingSalvo.Label == salvo.Label {
			log.Printf("updating existing salvo")
			config.Global.Salvos[i] = salvo
			c.Status(http.StatusOK)
			config.Save()

			return
		}
	}

	config.Global.Salvos = append(config.Global.Salvos, salvo)
	log.Printf("added new salvo")
	config.Save()

	c.Status(http.StatusOK)
}
