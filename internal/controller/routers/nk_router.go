package routers

import (
	"context"
	"net"
	"time"

	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/rs/zerolog"

	"github.com/monoxane/nk/pkg/tbus"
)

const retryInterval time.Duration = 60 * time.Second

type NKRouter struct {
	router *model.Router
	cancel context.CancelFunc

	gateway *tbus.TBusGateway
	log     zerolog.Logger

	connecting bool
}

func (rtr *NKRouter) Start() {
	_, cancel := context.WithCancel(context.Background())
	rtr.log = log.With().Str("router", rtr.router.Label).Int("id", rtr.router.ID).Logger()
	rtr.log.Debug().Msg("starting router instance")

	rtr.cancel = cancel

	ipAddr := net.ParseIP(rtr.router.IPAddress)

	gw := tbus.NewGateway(ipAddr, rtr.onRouteUpdate, rtr.onStatusUpdate)

	rtr.gateway = gw

	err := rtr.gateway.Connect()
	if err != nil {
		rtr.log.Error().Err(err).Msg("unable to connect to gateway, retrying")
	} else {
		rtr.connecting = false
		return
	}
}

func (nk *NKRouter) Stop() {
	nk.cancel()
	nk.gateway.Disconnect()
}

func (nk *NKRouter) Route(dst, src int) error {

	return nil
}

func (rtr *NKRouter) Disconnect() {
	rtr.gateway.Disconnect()
}

func (nk *NKRouter) onRouteUpdate(update tbus.RouteUpdate) {

}

func (nk *NKRouter) onStatusUpdate(update tbus.StatusUpdate) {

}
