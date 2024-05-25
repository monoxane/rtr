package router

import (
	"fmt"
	"net"

	"github.com/monoxane/nk/pkg/levels"
	"github.com/monoxane/nk/pkg/models"
	"github.com/monoxane/nk/pkg/tbus"
)

// A Router is a fully featured NK Routing matrix with state and label management
type RossNKRouter struct {
	// The NK-IPS or NK-NET interface used to access this Router
	gateway *tbus.TBusGateway

	// The metadata of this router
	Address      tbus.TBusAddress
	Destinations uint16
	Sources      uint16
	Level        tbus.Level

	// client facing update messages
	// onRouteUpdate  func(*RouteUpdate)
	onStatusUpdate func(tbus.StatusUpdate)
}

func NewRossNKRouterUsingGlobalMatrix(
	ip net.IP,
	routerAddress tbus.TBusAddress,
	model models.Model,
	updateFunc func(*RouteUpdate),
) *RossNKRouter {
	rtr := &RossNKRouter{}

	switch model {
	case models.NK_3G72:
		rtr.Destinations = 72
		rtr.Sources = 72
		rtr.Level = levels.MD_Vid
	case models.NK_3G64:
		rtr.Destinations = 64
		rtr.Sources = 64
		rtr.Level = levels.MD_Vid
	case models.NK_3G34:
		rtr.Destinations = 34
		rtr.Sources = 34
		rtr.Level = levels.MD_Vid
	case models.NK_3G16, models.NK_3G16_RCP:
		rtr.Destinations = 16
		rtr.Sources = 16
		rtr.Level = levels.MD_Vid
	case models.NK_3G164, models.NK_3G164_RCP:
		rtr.Destinations = 4
		rtr.Sources = 16
		rtr.Level = levels.MD_Vid
	}

	Matrix = &RouterMatrix{
		notify: updateFunc,
	}
	Matrix.Init(int(rtr.Destinations), int(rtr.Sources))

	gw := tbus.NewGateway(ip, rtr.handleRouteUpdate, rtr.handleStatusUpdate)

	rtr.gateway = gw

	return rtr
}

func (rtr *RossNKRouter) Connect() error {
	return rtr.gateway.Connect()
}

func (rtr *RossNKRouter) Disconnect() {
	rtr.gateway.Disconnect()
}

func (rtr *RossNKRouter) Route(dst int, src int) error {
	if dst <= 0 || uint16(dst) > rtr.Destinations {
		return fmt.Errorf("requested destination is outside the range available on this router model")
	}

	if src <= 0 || uint16(src) > rtr.Sources {
		return fmt.Errorf("requested source is outside the range available on this router model")
	}

	return rtr.gateway.Route(rtr.Address, rtr.Level, uint16(dst), uint16(src))
}

func (rtr *RossNKRouter) handleRouteUpdate(update tbus.RouteUpdate) {
	rtr.updateMatrix(uint16(update.Destination), uint16(update.Source))
}

func (rtr *RossNKRouter) handleStatusUpdate(update tbus.StatusUpdate) {
	if rtr.onStatusUpdate != nil {
		rtr.onStatusUpdate(update)
	}
}

func (rtr *RossNKRouter) updateMatrix(dst uint16, src uint16) {
	Matrix.UpdateCrosspoint(int(dst), int(src))
}
