package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/api/auth"
	"github.com/monoxane/rtr/internal/repository/users"
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
			c.Errors = append(c.Errors, &gin.Error{Err: fmt.Errorf("user role (%d/%s) does not meet minimum requirement (%d/%s) for path", auth.ROLE_MAP[role], role, auth.ROLE_MAP[minimumRole], minimumRole)})
			c.String(http.StatusForbidden, "Forbidden")
			c.Abort()
			return
		}

		u, _ := users.GetByUsername(username)

		c.Set("x-user-role", role)
		c.Set("x-user-id", u.ID)
		c.Set("x-username", username)

		// Continue Processing
		c.Next()
	}
}
