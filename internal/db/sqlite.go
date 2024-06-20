package db

import (
	"database/sql"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
)

var log zerolog.Logger
var db *sql.DB

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("package", "db").Logger()
}

func Open() error {
	database, err := sql.Open("sqlite3", "./rtr.db")
	if err != nil {
		return err
	}

	log.Info().Msg("opened sqlite database")

	db = database

	return nil
}

func Migrate() error {
	schema, err := os.ReadFile("internal/db/schema.sql")
	if err != nil {
		return errors.Wrap(err, "unable to open schema file")
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		return errors.Wrap(err, "unable to migrate database schema")
	}

	log.Info().Msg("migrated database schema")

	return nil
}
