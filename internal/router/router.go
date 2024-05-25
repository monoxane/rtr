package router

import (
	"net"

	"github.com/monoxane/rtr/internal/config"

	"github.com/rs/zerolog"
)

type RouteUpdate struct {
	Type        string       `json:"type"`
	Destination *Destination `json:"destination"`
	Source      *Source      `json:"source"`
}

type RouterAware interface {
	Connect() error
	Disconnect()
	Route(dst int, src int) error
}

var (
	Router RouterAware
	Matrix *RouterMatrix
	log    zerolog.Logger
)

func Logger(logger zerolog.Logger) {
	log = logger
}

func Connect(updateFunc func(*RouteUpdate)) {
	routerConfig := config.GetRouter()
	log.Info().Str("ip", net.ParseIP(routerConfig.IP).String()).Int("tbus_address", routerConfig.Address).Str("model", routerConfig.Model).Msg("connecting to router")

	switch routerConfig.Provider {
	case "Ross NK-IPS":
		Router = NewRossNKRouterUsingGlobalMatrix(net.ParseIP(routerConfig.IP), uint8(routerConfig.Address), routerConfig.Model, updateFunc)
	}

	go Router.Connect()
}
