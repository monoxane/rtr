package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func serveHTTP() {
	gin.SetMode(gin.ReleaseMode)

	svc := gin.Default()
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
	svc.PUT("/v1/config/source/:id", HandleUpdateSource)
	svc.PUT("/v1/config/destination/:id", HandleUpdateDestination)
	svc.POST("/v1/config/probe", HandleNewProbe)
	svc.PUT("/v1/config/probe/:slug", HandleUpdateProbe)
	svc.DELETE("/v1/config/probe/:slug", HandleDeleteProbe)

	svc.GET("/v1/ws/probe/:slug", HandleProbeClient)
	svc.POST("/v1/probe/stream/:id", HandleHTTPProbeStream)

	err := svc.Run(fmt.Sprintf(":%d", Config.Server.HTTPPort))
	if err != nil {
		log.Fatalln("unable to start http server", err)
	}
}

func HandleMatrix(c *gin.Context) {
	c.JSON(http.StatusOK, &router.Matrix)
}

func HandleGetConfig(c *gin.Context) {
	c.JSON(http.StatusOK, Config)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
