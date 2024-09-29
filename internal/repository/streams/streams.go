package streams

import (
	"context"
	"database/sql"
	"sync"
	"time"

	"github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/common"
)

const (
	queryStreams       = "SELECT * FROM streams;"
	queryStreamsByID   = "SELECT * FROM streams WHERE id = ?;"
	queryStreamsBySlug = "SELECT * FROM streams WHERE slug = ?;"
	queryStreamsInsert = "INSERT INTO streams(label, slug, destination_id, is_routable, created_at, updated_at, updated_by) values(?,?,?,?,?,?,?)"
	queryStreamsDelete = "DELETE FROM streams WHERE id = ?;"

	queryUpdateStream       = "UPDATE streams SET label = ?, destination_id = ?, is_routable = ?, updated_at = ?, updated_by = ? WHERE id = ?"
	queryUpdateClientCount  = "UPDATE streams SET clients = ? WHERE id = ?"
	queryUpdateActiveStatus = "UPDATE streams SET is_active = ? WHERE id = ?"
)

var (
	log zerolog.Logger

	watchers    map[chan *model.Stream]int
	watchersMux sync.RWMutex
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "streams").Logger()
}

func Watch(streamId int, ctx context.Context) (chan *model.Stream, error) {
	log.Debug().Int("id", streamId).Msg("watching stream")
	if watchers == nil {
		watchers = make(map[chan *model.Stream]int)
	}

	watchersMux.Lock()
	ch := make(chan *model.Stream)
	watchers[ch] = streamId
	watchersMux.Unlock()

	go func() {
		stream, err := GetByID(streamId)
		if err != nil {
			return
		}

		ch <- stream
	}()

	go func() {
		<-ctx.Done()
		log.Debug().Int("id", streamId).Str("method", "watch").Msg("watch context done")
		delete(watchers, ch)
		close(ch)
	}()

	log.Debug().Int("id", streamId).Str("method", "watch").Msg("returning channel")
	return ch, nil
}

func notify(streamId int) {
	log.Debug().Int("id", streamId).Str("method", "notify").Msg("notifying watch channels")
	stream, err := GetByID(streamId)
	if err != nil {
		return
	}

	watchersMux.RLock()
	for ch, id := range watchers {
		if id == streamId {
			ch <- stream
		}
	}
	watchersMux.RUnlock()
}

func Create(stream model.Stream) (*model.Stream, error) {
	res, err := db.Database.Exec(queryStreamsInsert, stream.Label, stream.Slug, stream.Destination, stream.IsRoutable, time.Now().Unix(), time.Now().Unix(), stream.UpdatedBy)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return nil, errors.Wrap(err, "unable to insert stream due to constraint")
			}
		}
		return nil, errors.Wrap(err, "unable to insert stream")
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get id of inserted stream")
	}

	newStream, err := GetByID(int(id))
	if err != nil {
		return nil, errors.Wrap(err, "unable to get new stream")
	}

	return newStream, nil
}

func GetByID(id int) (*model.Stream, error) {
	row := db.Database.QueryRow(queryStreamsByID, id)

	var stream model.Stream
	var cat int64
	var uat int64

	if err := row.Scan(&stream.ID, &stream.Label, &stream.Slug, &stream.Destination, &stream.IsRoutable, &stream.IsActive, &stream.Clients, &cat, &uat, &stream.UpdatedBy); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		return nil, err
	}

	stream.CreatedAt = time.Unix(cat, 0)
	stream.UpdatedAt = time.Unix(uat, 0)
	return &stream, nil
}

func GetBySlug(slug string) (*model.Stream, error) {
	row := db.Database.QueryRow(queryStreamsBySlug, slug)

	var stream model.Stream
	var cat int64
	var uat int64

	if err := row.Scan(&stream.ID, &stream.Label, &stream.Slug, &stream.Destination, &stream.IsRoutable, &stream.IsActive, &stream.Clients, &cat, &uat, &stream.UpdatedBy); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		return nil, err
	}

	stream.CreatedAt = time.Unix(cat, 0)
	stream.UpdatedAt = time.Unix(uat, 0)
	return &stream, nil
}

func List() ([]*model.Stream, error) {
	rows, err := db.Database.Query(queryStreams)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var streams []*model.Stream
	for rows.Next() {
		var stream model.Stream
		var cat int64
		var uat int64

		if err := rows.Scan(&stream.ID, &stream.Label, &stream.Slug, &stream.Destination, &stream.IsRoutable, &stream.IsActive, &stream.Clients, &cat, &uat, &stream.UpdatedBy); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				log.Print("no more rows")
				continue
			}

			log.Printf("unable to scan row: %s", err)
		}

		stream.CreatedAt = time.Unix(cat, 0)
		stream.UpdatedAt = time.Unix(uat, 0)

		streams = append(streams, &stream)
	}

	return streams, nil
}

func Update(streamId int, stream model.Stream) (*model.Stream, error) {
	// queryUpdateStream       = "UPDATE streams SET label = ?, destination_id = ?, is_routable = ?, updated_at = ?, updated_by = ? WHERE id = ?"
	_, err := db.Database.Exec(queryUpdateStream, stream.Label, stream.Destination, stream.IsRoutable, time.Now().Unix(), stream.UpdatedBy, streamId)
	if err != nil {
		return nil, errors.Wrap(err, "unable to update stream")
	}

	updatedStream, err := GetByID(streamId)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get updated stream")
	}

	notify(streamId)

	return updatedStream, nil
}

func Delete(streamId int) error {
	_, err := db.Database.Exec(queryStreamsDelete, time.Now().Unix(), streamId)
	if err != nil {
		return err
	}

	watchersMux.Lock()
	for ch, id := range watchers {
		if id == streamId {
			delete(watchers, ch)
			close(ch)
		}
	}
	watchersMux.Unlock()
	return nil
}

func UpdateClients(stream, clients int) error {
	_, err := db.Database.Exec(queryUpdateClientCount, clients, stream)
	if err != nil {
		return err
	}

	notify(stream)

	return nil
}

func UpdateStatus(stream int, active bool) error {
	_, err := db.Database.Exec(queryUpdateActiveStatus, active, stream)
	if err != nil {
		return err
	}

	notify(stream)

	return nil
}
