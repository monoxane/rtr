package router

import (
	"net"
	"os"

	nkRouter "github.com/monoxane/nk/pkg/router"

	"github.com/monoxane/rtr/internal/config"

	"github.com/rs/zerolog"
)

var (
	Router *nkRouter.Router
	log    zerolog.Logger
)

func Logger(logger zerolog.Logger) {
	log = logger
}

func Connect(updateFunc func(*nkRouter.RouteUpdate)) {
	routerConfig := config.GetRouter()
	log.Info().Str("ip", net.ParseIP(routerConfig.IP).String()).Int("tbus_address", routerConfig.Address).Str("model", routerConfig.Model).Msg("connecting to router")
	Router = nkRouter.New(net.ParseIP(routerConfig.IP), uint8(routerConfig.Address), routerConfig.Model)

	Router.SetOnUpdate(func(ru *nkRouter.RouteUpdate) {
		switch ru.Type {
		case "destination":
			log.Info().
				Str("type", ru.Type).
				Int("dst_id", ru.Destination.GetIDInt()).
				Str("dst", ru.Destination.Label).
				Int("src_id", ru.Destination.Source.GetIDInt()).
				Str("src", ru.Destination.Source.Label).
				Msg("processing update")
		case "source":
			log.Info().
				Str("type", ru.Type).
				Int("src_id", ru.Destination.Source.GetIDInt()).
				Str("src", ru.Destination.Source.Label).
				Msg("processing update")
		default:
		}
		updateFunc(ru)
	})

	data, err := os.ReadFile("labels.lbl")
	if err == nil {
		Router.LoadLabels(string(data))
	} else {
		log.Warn().Err(err).Msg("unable to load dashboard .lbl file")
	}

	go Router.Connect()
}
