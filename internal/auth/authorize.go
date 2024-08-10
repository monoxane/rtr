package auth

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/users"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func FromContext(ctx context.Context, minimumRole string) (model.User, error) { // role, id, username, err
	ginContext := ctx.Value("GinContextKey")
	if ginContext == nil {
		gqlerr := gqlerror.Errorf("invalid context: not found")
		gqlerr.Extensions = make(map[string]interface{})
		gqlerr.Extensions["code"] = "INTERNAL_SERVER_ERROR"
		return model.User{}, gqlerr
	}

	c, ok := ginContext.(*gin.Context)
	if !ok {
		gqlerr := gqlerror.Errorf("invalid context: gin.Context has wrong type")
		gqlerr.Extensions = make(map[string]interface{})
		gqlerr.Extensions["code"] = "INTERNAL_SERVER_ERROR"
		return model.User{}, gqlerr
	}

	token := GetToken(c)
	username, role, err := VerifyToken(token)

	// If token invalid we tell them to get in the sea
	if err != nil {
		gqlerr := gqlerror.Errorf("Invalid Token")
		gqlerr.Extensions = make(map[string]interface{})
		gqlerr.Extensions["code"] = "AUTH_ERROR"
		return model.User{}, gqlerr
	}

	if ROLE_MAP[role] < ROLE_MAP[minimumRole] {
		gqlerr := gqlerror.Errorf("Invalid Token")
		gqlerr.Extensions = make(map[string]interface{})
		gqlerr.Extensions["code"] = "PERMISSION_DENIED"
		return model.User{}, gqlerr
	}

	u, _ := users.GetByUsername(username)

	return u, nil
}
