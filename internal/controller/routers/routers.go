package routers

import (
	"sync"

	"github.com/rs/zerolog"

	"github.com/monoxane/rtr/internal/controller/streams"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/routers"
)

var (
	log zerolog.Logger

	routerInstances    map[int]routerInterface
	routerInstancesMux sync.Mutex
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("controller", "routers").Logger()
	streams.SetLogger(logger)
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
	defer routerInstancesMux.Unlock()

	if _, exists := routerInstances[router.ID]; exists {
		routerInstances[router.ID].Stop()

		delete(routerInstances, router.ID)
	}

	switch router.Provider {
	case "ross-nk":
		routerInstances[router.ID] = &NKRouter{}
		routerInstances[router.ID].Start()
	}
}

func DeleteStream(router int) {
	routerInstancesMux.Lock()
	defer routerInstancesMux.Unlock()

	routerInstances[router].Stop()
	delete(routerInstances, router)
}
