package destinations

import (
	"time"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/rs/zerolog"

	"github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
)

var (
	log zerolog.Logger
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "destinations").Logger()
}

var (
	queryDestinationsInsert = "INSERT INTO destinations(router_id, index, label, created_at, updated_at, updated_by) values(?, ?, ?, ?, ?, ?)"
)

func Create(router_id int64, destination model.Destination) error {
	_, err := db.Database.Exec(queryDestinationsInsert, router_id, destination.Index, destination.Label, time.Now().Unix(), time.Now().Unix(), destination.UpdatedBy)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return errors.Wrap(err, "unable to insert destination due to constraint")
			}
		}
		return errors.Wrap(err, "unable to insert destination")
	}

	return nil
}
