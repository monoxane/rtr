package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
	svc.Use(ZerologMiddleware())
	svc.Use(CORSMiddleware())

	svc.StaticFile("/", "/dist/index.html")
	svc.NoRoute(func(c *gin.Context) {
		c.File("/dist/index.html")
	})
	svc.Static("/dist", "/dist")

	//
	// REST ENDPOINTS
	//
	api := svc.Group("/v1/api")

	// Auth
	api.POST("/login", NotImplemented) // Handle Login

	// Users
	api.GET("/users", NotImplemented)     // Get all Users
	api.GET("/users/:id", NotImplemented) // Get User by ID

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
