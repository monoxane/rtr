package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleSalvoPost(c *gin.Context) {
	var salvo Salvo
	err := c.BindJSON(&salvo)
	if err != nil {
		log.Printf("unable to bind salvo to object: %s", err)
		c.Status(http.StatusBadRequest)

		return
	}

	log.Printf("saving salvo: %+v", salvo)

	for i, existingSalvo := range Config.Salvos {
		if existingSalvo.Label == salvo.Label {
			log.Printf("updating existing salvo")
			Config.Salvos[i] = salvo
			c.Status(http.StatusOK)
			Config.Save()

			return
		}
	}

	Config.Salvos = append(Config.Salvos, salvo)
	log.Printf("added new salvo")
	Config.Save()

	c.Status(http.StatusOK)
}
