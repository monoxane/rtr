package routers

import (
	"sync"

	"github.com/rs/zerolog"

	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/routers"
)

var (
	log zerolog.Logger

	routerInstances    map[int]routerInterface
	routerInstancesMux sync.Mutex
)

const PROVIDER_ROSS_NK = 0

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("controller", "routers").Logger()
	log.Info().Msg("logger active")
}

type routerInterface interface {
	Start()
	Stop()
	Route(dst, src int) error
}

func LoadRouters() error {
	routerInstances = make(map[int]routerInterface)

	allRouters, err := routers.List()
	if err != nil {
		return err
	}

	for _, router := range allRouters {
		UpdateRouter(router)
	}

	return nil
}

func UpdateRouter(router *model.Router) {
	routerInstancesMux.Lock()

	if _, exists := routerInstances[router.ID]; exists {
		routerInstances[router.ID].Stop()

		delete(routerInstances, router.ID)
	}

	switch router.ProviderID {
	case PROVIDER_ROSS_NK:
		routerInstances[router.ID] = &NKRouter{
			router: router,
		}
	}

	routerInstancesMux.Unlock()
	go routerInstances[router.ID].Start()
}

func DeleteRouter(router int) {
	routerInstancesMux.Lock()
	defer routerInstancesMux.Unlock()

	routerInstances[router].Stop()
	delete(routerInstances, router)
}

func Route(routerId, destination, source int) error {
	return routerInstances[routerId].Route(destination, source)
}
