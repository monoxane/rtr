package streams

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/mattn/go-sqlite3"
	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/repository"
	"github.com/pkg/errors"
)

type Stream struct {
	ID            int    `json:"id"`
	Label         string `json:"label" binding:"required"`
	Slug          string `json:"slug" binding:"required"`
	DestinationID *int   `json:"destination_id"`
	IsRoutable    bool   `json:"is_routable"`
	IsActive      bool   `json:"is_active"`
	UpdatedBy     int    `json:"-"`
	repository.CommonMetadata
}

const (
	queryStreams       = "SELECT * FROM streams;"
	queryStreamsInsert = "INSERT INTO streams(label, slug, destination_id, is_routable, is_active created_at, updated_at, updated_by) values(?,?,?,?,?,?,?,?)"
)

func Create(stream Stream) error {
	_, err := db.Database.Exec(queryStreamsInsert, stream.Label, stream.Slug, stream.DestinationID, stream.IsRoutable, false, time.Now().Unix(), time.Now().Unix(), stream.UpdatedBy)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}

func List() ([]Stream, error) {
	rows, err := db.Database.Query(queryStreams)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var streams []Stream
	for rows.Next() {
		var stream Stream
		var cat int64
		var uat int64

		if err := rows.Scan(&stream.ID, &stream.Label, &stream.Slug, &stream.DestinationID, &stream.IsRoutable, &stream.IsActive, &cat, &uat, &stream.UpdatedBy); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				log.Print("no more rows")
				continue
			}

			log.Printf("unable to scan row: %s", err)
		}

		stream.CreatedAt = time.Unix(cat, 0)
		stream.UpdatedAt = time.Unix(uat, 0)

		streams = append(streams, stream)
	}

	return streams, nil
}
