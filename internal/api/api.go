package api

import (
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/monoxane/rtr/internal/api/middleware"
	"github.com/monoxane/rtr/internal/graph"
	"github.com/monoxane/rtr/internal/graph/resolvers"
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
	svc.Use(middleware.GinContextToContextMiddleware())

	svc.StaticFile("/", "/dist/index.html")
	svc.NoRoute(func(c *gin.Context) {
		c.File("/dist/index.html")
	})
	svc.Static("/dist", "/dist")

	svc.Any("/v3/graphql", graphqlHandler())
	svc.GET("/v3/playground", playgroundHandler())

	// Streams
	svc.POST("/v1/streams/source/:slug", HandleStreamSource) // Receive Stream Source
	svc.GET("/v1/streams/client/:slug", HandleStreamClient)  // Get Stream Media

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

// Defining the Graphql handler
func graphqlHandler() gin.HandlerFunc {
	// NewExecutableSchema and Config are in the generated.go file
	// Resolver is in the resolver.go file
	h := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &resolvers.Resolver{}}))
	h.AddTransport(&transport.Websocket{})

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

// Defining the Playground handler
func playgroundHandler() gin.HandlerFunc {
	h := playground.Handler("rtr GraphQL Playground", "/v3/graphql")

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
