package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/api/auth"
	"github.com/monoxane/rtr/internal/db"
)

func Authorization(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := auth.GetToken(c)
		username, err := auth.VerifyToken(token)

		// If token invalid we tell them to get in the sea
		if err != nil {
			c.String(http.StatusUnauthorized, "Unauthorized")
			c.Abort()
			return
		}

		user, err := db.GetUserByUsername(username)
		if err != nil {
			c.String(http.StatusUnauthorized, "Unauthorized")
			c.Abort()
			return
		}

		if user.Role != role && role != auth.ANY_ROLE {
			c.String(http.StatusUnauthorized, "Unauthorized")
			c.Abort()
			return
		}

		c.Set("x-user-role", user.Role)
		c.Set("x-user-id", user.ID)
		c.Set("x-username", user.Username)

		// Continue Processing
		c.Next()
	}
}
