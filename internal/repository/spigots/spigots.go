package spigots

import (
	"context"
	"fmt"
	"sync"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/rs/zerolog"
)

const (
	queryRouterUpdateDestinationSource = "UPDATE `destinations` SET `routed_source_id`=(SELECT `id` FROM `sources` WHERE `index` = ? AND `router_id` = ?) WHERE `index` = ? AND `router_id` = ?;"
)

var (
	log zerolog.Logger

	destinationWatchers    map[chan *model.Destination]int
	destinationWatchersMux sync.RWMutex
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "spigots").Logger()
	log.Info().Msg("logger active")
}

func WatchRouterDestinations(routerId int, ctx context.Context) (chan *model.Destination, error) {
	log.Debug().Int("router_id", routerId).Msg("watching router destinations")
	if destinationWatchers == nil {
		destinationWatchers = make(map[chan *model.Destination]int)
	}

	destinationWatchersMux.Lock()
	ch := make(chan *model.Destination)
	destinationWatchers[ch] = routerId
	destinationWatchersMux.Unlock()

	go func() {
		<-ctx.Done()
		log.Debug().Int("router_id", routerId).Str("method", "watch").Msg("watch context done")
		delete(destinationWatchers, ch)
		close(ch)
	}()

	log.Debug().Int("router_id", routerId).Str("method", "watch").Msg("returning router destinations")
	return ch, nil
}

func notifyDestination(routerId, index int) {
	log.Debug().Int("router_id", routerId).Int("index", index).Str("method", "notify").Msg("notifying watch channels")
	stream, err := GetDestinationByIndex(routerId, index)
	if err != nil {
		return
	}

	destinationWatchersMux.RLock()
	for ch, id := range destinationWatchers {
		if id == routerId {
			ch <- stream
		}
	}
	destinationWatchersMux.RUnlock()
}

func UpdateRoutedSourceForDestination(routerId, destinationIndex, sourceIndex int) error {
	res, err := db.Database.Exec(queryRouterUpdateDestinationSource, sourceIndex, routerId, destinationIndex, routerId)
	ra, _ := res.RowsAffected()
	if ra != 1 {
		return fmt.Errorf("unexpected response, rows affected: %d", ra)
	}

	notifyDestination(int(routerId), destinationIndex)
	return err
}
