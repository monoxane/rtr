package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/router"
	"github.com/rs/zerolog"
)

var (
	log zerolog.Logger
)

func Logger(logger zerolog.Logger) {
	log = logger
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

	svc.GET("/v1/ws/rtr", HandleRtrWS)

	svc.GET("/v1/matrix", HandleMatrix)

	svc.POST("/v1/salvos", HandleSalvoPost)

	svc.GET("/v1/config", HandleGetConfig)
	svc.PUT("/v1/config/router", HandleUpdateRouter)
	svc.POST("/v1/config/labels/dashboard", HandleDashboardLabels)
	svc.PUT("/v1/config/source/:id", HandleUpdateSource)
	svc.PUT("/v1/config/destination/:id", HandleUpdateDestination)
	svc.POST("/v1/config/probe", HandleNewProbe)
	svc.PUT("/v1/config/probe/:slug", HandleUpdateProbe)
	svc.DELETE("/v1/config/probe/:slug", HandleDeleteProbe)

	svc.GET("/v1/ws/probe/:slug", HandleProbeClient)
	svc.GET("/v1/probe/statuses", HandleGetProbeStatuses)
	svc.POST("/v1/probe/stream/:slug", HandleHTTPProbeStream)

	err := svc.Run(fmt.Sprintf(":%d", config.GetServer().HTTPPort))
	if err != nil {
		log.Error().Err(err).Msg("unable to start http server")
	}
}

func HandleMatrix(c *gin.Context) {
	c.JSON(http.StatusOK, &router.Matrix)
}

func HandleGetConfig(c *gin.Context) {
	c.JSON(http.StatusOK, config.Get())
}
