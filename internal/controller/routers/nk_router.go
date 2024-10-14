package routers

import (
	"context"
	"net"
	"time"

	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/routers"
	"github.com/monoxane/rtr/internal/repository/spigots"
	"github.com/rs/zerolog"

	"github.com/monoxane/nk/pkg/tbus"
)

// const retryInterval time.Duration = 60 * time.Second

type NKRouter struct {
	router *model.Router
	cancel context.CancelFunc

	gateway *tbus.TBusGateway
	log     zerolog.Logger

	connecting bool
}

func (nk *NKRouter) Start() {
	context, cancel := context.WithCancel(context.Background())
	nk.log = log.With().Str("router", nk.router.Label).Int("id", nk.router.ID).Logger()
	nk.log.Info().Msg("starting router instance")
	routers.UpdateRouterConnectionStatus(nk.router.ID, false)
	nk.cancel = cancel

	ipAddr := net.ParseIP(nk.router.IPAddress)

	gw := tbus.NewGateway(ipAddr, nk.onRouteUpdate, nk.onStatusUpdate)

	nk.gateway = gw

	for {
		err := nk.gateway.Connect()
		if err != nil {
			nk.log.Error().Err(err).Msg("unable to connect to gateway, retrying in 10 seconds")
		} else {
			nk.connecting = false
			return
		}

		select {
		case <-context.Done():
			return
		default:
			time.Sleep(10 * time.Second)
		}
	}
}

func (nk *NKRouter) Stop() {
	nk.cancel()
	nk.gateway.Disconnect()
}

func (nk *NKRouter) Route(dst, src int) error {
	return nk.gateway.Route(uint8(*nk.router.RouterAddress), uint32(nk.router.Level), uint16(dst), uint16(src))
}

func (nk *NKRouter) Disconnect() {
	nk.gateway.Disconnect()
}

func (nk *NKRouter) onRouteUpdate(update tbus.RouteUpdate) {
	err := spigots.UpdateRoutedSourceForDestination(nk.router.ID, update.Destination, update.Source)
	if err != nil {
		nk.log.Error().Err(err).Int("destination", update.Destination).Int("source", update.Source).Msg("failed to update routed source of destination")
		return
	}
	nk.log.Info().Int("destination", update.Destination).Int("source", update.Source).Msg("updated routed source for destination")
}

func (nk *NKRouter) onStatusUpdate(update tbus.StatusUpdate) {
	routers.UpdateRouterConnectionStatus(nk.router.ID, update.Connected)
}
