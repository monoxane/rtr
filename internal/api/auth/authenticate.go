package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/graph/model"
	usersRepository "github.com/monoxane/rtr/internal/repository/users"
)

type LoginPayload struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	model.User
	Token string `json:"token"`
}

func Authenticate(c *gin.Context) {
	var request LoginPayload

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Invalid Request Body"})
		return
	}

	user, err := usersRepository.GetByUsername(request.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"sta": http.StatusNotFound, "err": err.Error(), "msg": "User Not Found"})
		return
	}

	match, err := comparePasswordAndHash(request.Password, user.Hash)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"sta": http.StatusUnauthorized, "err": err.Error(), "msg": "Incorrect Password"})
	}

	if !match {
		c.JSON(http.StatusUnauthorized, gin.H{"sta": http.StatusUnauthorized, "msg": "Incorrect Password"})
		return
	}

	token, err := createToken(request.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"sta": http.StatusInternalServerError, "err": err.Error(), "msg": "Unable to Login"})
		return
	}

	err = usersRepository.RecordLogin(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"sta": http.StatusInternalServerError, "err": err.Error(), "msg": "Unable to record Login event"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		User:  user,
		Token: token,
	})
}
