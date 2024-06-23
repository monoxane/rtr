package users

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/api/auth"
	"github.com/monoxane/rtr/internal/db"
)

func GetUserRoles(c *gin.Context) {
	c.JSON(http.StatusOK, auth.ROLES)
}

func GetUsers(c *gin.Context) {
	deleted := c.Query("show_deleted")
	users, err := db.GetUsers(deleted == "true")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"err": err, "msg": "unable to get users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

type userPayload struct {
	db.User
	Password string `json:"password"`
}

func CreateUser(c *gin.Context) {
	var request userPayload

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Bad Request Body"})

		return
	}

	hash, err := auth.HashPassword(request.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Unable to hash Password for new User"})

		return
	}

	request.User.Hash = hash

	db.CreateUser(request.User)

	c.JSON(http.StatusOK, request.User)
}

func UpdateUser(c *gin.Context) {
	var request db.User

	idString := c.Param("id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Invalid User ID"})

		return
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Bad Request Body"})

		return
	}

	db.UpdateUser(id, request)

	c.JSON(http.StatusOK, request)
}

func DeleteUser(c *gin.Context) {
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Invalid User ID"})

		return
	}

	err = db.DeleteUser(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Unable to delete User"})

		return
	}

	c.Status(http.StatusOK)
}

func ReactivateUser(c *gin.Context) {
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Invalid User ID"})

		return
	}

	err = db.ReactivateUser(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Unable to reactivate User"})

		return
	}

	c.Status(http.StatusOK)
}

type passwordPayload struct {
	New string `json:"new"`
}

func ResetPassword(c *gin.Context) {
	idString := c.Param("id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Invalid User ID"})

		return
	}

	var request passwordPayload
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Bad Request Body"})

		return
	}

	hash, err := auth.HashPassword(request.New)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Unable to hash new Password for user"})

		return
	}

	err = db.UpdateUserPassword(id, hash)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error(), "msg": "Unable to update user password"})

		return
	}

	c.Status(http.StatusOK)
}
