package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/api/auth"
	"github.com/monoxane/rtr/internal/api/middleware"
	"github.com/monoxane/rtr/internal/api/users"
	"github.com/rs/zerolog"
)

var (
	log zerolog.Logger
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("package", "api").Logger()
}

func Serve() {
	gin.SetMode(gin.ReleaseMode)

	svc := gin.New()
	svc.Use(middleware.Zerolog(log))
	svc.Use(middleware.CORS())

	svc.StaticFile("/", "/dist/index.html")
	svc.NoRoute(func(c *gin.Context) {
		c.File("/dist/index.html")
	})
	svc.Static("/dist", "/dist")

	//
	// REST ENDPOINTS
	//
	api := svc.Group("/v1/api")
	api.Use(middleware.Authorization(auth.ROLE_ADMIN))

	// Auth
	svc.POST("/v1/api/login", auth.Authenticate) // Handle Login, NOT BEHIND THE MIDDLEWARE!

	// Users
	api.Group("/user_roles").Use(middleware.Authorization(auth.ROLE_ADMIN)).GET("", users.GetUserRoles) // Get all User Roles

	v1_users := api.Group("/users")
	v1_users.Use(middleware.Authorization(auth.ROLE_ADMIN))

	v1_users.GET("/", users.GetUsers)                      // Get all Users
	v1_users.POST("/", users.CreateUser)                   // Create a new User
	v1_users.DELETE("/:id", users.DeleteUser)              // Delete a User
	v1_users.PATCH("/:id", users.UpdateUser)               // Edit a user
	v1_users.POST("/:id/password", users.ResetPassword)    // Forcefully set a users password
	v1_users.POST("/:id/reactivate", users.ReactivateUser) // Reactivate a User

	//
	// WEBSOCKET ENDPOINTS FOR STREAMS AND REALTIME UPDATES
	//

	ws := svc.Group("/v1/ws")

	ws.GET("/realtime/:type", NotImplemented) // Provide realtime updates for a resource type

	// Streams
	ws.GET("/streams/source/:id", NotImplemented) // Receive Stream Source
	ws.GET("/streams/client/:id", NotImplemented) // Get Stream Media

	// svc.GET("/v1/ws/rtr", HandleRtrWS)

	// svc.GET("/v1/matrix", HandleMatrix)

	// svc.POST("/v1/salvos", HandleSalvoPost)

	// svc.GET("/v1/config", HandleGetConfig)
	// svc.PUT("/v1/config/router", HandleUpdateRouter)
	// svc.POST("/v1/config/labels/dashboard", HandleDashboardLabels)
	// svc.PUT("/v1/config/source/:id", HandleUpdateSource)
	// svc.PUT("/v1/config/destination/:id", HandleUpdateDestination)
	// svc.POST("/v1/config/probe", HandleNewProbe)
	// svc.PUT("/v1/config/probe/:slug", HandleUpdateProbe)
	// svc.DELETE("/v1/config/probe/:slug", HandleDeleteProbe)

	// svc.GET("/v1/ws/probe/:slug", HandleProbeClient)
	// svc.GET("/v1/probe/statuses", HandleGetProbeStatuses)
	// svc.POST("/v1/probe/stream/:slug", HandleHTTPProbeStream)

	log.Info().Msg("starting api service")
	err := svc.Run(":8080")
	if err != nil {
		log.Error().Err(err).Msg("unable to start http server")
	}
}

func NotImplemented(c *gin.Context) {
	c.Status(http.StatusNotImplemented)
}
