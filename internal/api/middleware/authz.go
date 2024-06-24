package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/api/auth"
)

func Authorization(minimumRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := auth.GetToken(c)
		username, role, err := auth.VerifyToken(token)

		// If token invalid we tell them to get in the sea
		if err != nil {
			c.String(http.StatusUnauthorized, "Unauthorized")
			c.Abort()
			return
		}

		if auth.ROLE_MAP[role] < auth.ROLE_MAP[minimumRole] {
			c.String(http.StatusUnauthorized, "Unauthorized")
			c.Abort()
			return
		}

		c.Set("x-user-role", role)
		// c.Set("x-user-id", id)
		c.Set("x-username", username)

		// Continue Processing
		c.Next()
	}
}
