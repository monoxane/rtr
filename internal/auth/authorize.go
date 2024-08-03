package auth

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/users"
)

func FromContext(ctx context.Context, minimumRole string) (model.User, error) { // role, id, username, err
	ginContext := ctx.Value("GinContextKey")
	if ginContext == nil {
		err := fmt.Errorf("could not retrieve gin.Context")
		return model.User{}, fmt.Errorf("no context available: %w", err)
	}

	c, ok := ginContext.(*gin.Context)
	if !ok {
		err := fmt.Errorf("gin.Context has wrong type")
		return model.User{}, fmt.Errorf("invalid context: %w", err)
	}

	token := GetToken(c)
	username, role, err := VerifyToken(token)

	// If token invalid we tell them to get in the sea
	if err != nil {
		return model.User{}, fmt.Errorf("401 Unauthorized")
	}

	if ROLE_MAP[role] < ROLE_MAP[minimumRole] {
		// c.Errors = append(c.Errors, &gin.Error{Err: fmt.Errorf("user role (%d/%s) does not meet minimum requirement (%d/%s) for path", auth.ROLE_MAP[role], role, auth.ROLE_MAP[minimumRole], minimumRole)})
		// c.String(http.StatusForbidden, "Forbidden")
		// c.Abort()
		return model.User{}, fmt.Errorf("403 Forbidden")
	}

	u, _ := users.GetByUsername(username)

	return u, nil
}
