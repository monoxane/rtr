package streamsapi

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/repository/streams"
)

func CreateStream(c *gin.Context) {
	var request streams.Stream

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Bad Request Body"})

		return
	}

	request.UpdatedBy = c.GetInt("x-user-id")

	if err := streams.Create(request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Unable to create Stream"})

		return
	}

	c.JSON(http.StatusOK, request)
}

func GetStreams(c *gin.Context) {
	streams, err := streams.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err, "msg": "unable to get streams"})
		return
	}

	c.JSON(http.StatusOK, streams)
}
