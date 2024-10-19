package spigots

import (
	"context"
	"fmt"
	"sync"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
)

const (
	queryRouterUpdateDestinationSource = "UPDATE `destinations` SET `routed_source_id`=(SELECT `id` FROM `sources` WHERE `index` = ? AND `router_id` = ?) WHERE `index` = ? AND `router_id` = ?;"
)

var (
	log zerolog.Logger

	routerWatchers         map[chan *model.Destination]int
	routerWatchersMux      sync.RWMutex
	destinationWatchers    map[chan *model.Destination]int
	destinationWatchersMux sync.RWMutex
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "spigots").Logger()
	log.Info().Msg("logger active")
}

func WatchRouterDestinations(routerId int, ctx context.Context) (chan *model.Destination, error) {
	log.Debug().Int("router_id", routerId).Msg("watching router destinations")
	if routerWatchers == nil {
		routerWatchers = make(map[chan *model.Destination]int)
	}

	routerWatchersMux.Lock()
	ch := make(chan *model.Destination)
	routerWatchers[ch] = routerId
	routerWatchersMux.Unlock()

	go func() {
		<-ctx.Done()
		log.Debug().Int("router_id", routerId).Str("method", "watch").Msg("watch context done")
		delete(routerWatchers, ch)
		close(ch)
	}()

	log.Debug().Int("router_id", routerId).Str("method", "watch").Msg("returning router destinations")
	return ch, nil
}

func WatchDestination(destination int, ctx context.Context) (chan *model.Destination, error) {
	log.Debug().Int("destination", destination).Msg("watching destination")
	if destinationWatchers == nil {
		destinationWatchers = make(map[chan *model.Destination]int)
	}

	destinationWatchersMux.Lock()
	ch := make(chan *model.Destination)
	destinationWatchers[ch] = destination
	destinationWatchersMux.Unlock()

	go func() {
		<-ctx.Done()
		log.Debug().Int("destination", destination).Str("method", "watch").Msg("watch context done")
		delete(destinationWatchers, ch)
		close(ch)
	}()

	log.Debug().Int("router_id", destination).Str("method", "watch").Msg("returning destination")
	return ch, nil
}

func notifyDestination(destination *model.Destination) {
	log.Debug().Int("router_id", destination.RouterID).Int("index", destination.Index).Str("method", "notify").Msg("notifying watch channels")

	destinationWatchersMux.RLock()
	for ch, id := range destinationWatchers {
		if id == destination.ID {
			ch <- destination
		}
	}
	destinationWatchersMux.RUnlock()

	routerWatchersMux.RLock()
	for ch, id := range routerWatchers {
		if id == destination.RouterID {
			ch <- destination
		}
	}
	routerWatchersMux.RUnlock()
}

func UpdateRoutedSourceForDestination(routerId, destinationIndex, sourceIndex int) error {
	res, err := db.Database.Exec(queryRouterUpdateDestinationSource, sourceIndex, routerId, destinationIndex, routerId)
	if err != nil {
		return errors.Wrap(err, "unable to update destination")
	}
	ra, _ := res.RowsAffected()
	if ra != 1 {
		return fmt.Errorf("unexpected response, rows affected: %d", ra)
	}

	updatedDestination, err := GetDestinationByIndex(routerId, destinationIndex)
	if err != nil {
		return errors.Wrap(err, "unable to get updated destination")
	}

	notifyDestination(updatedDestination)
	return err
}
