package db

import (
	"database/sql"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
)

var log zerolog.Logger
var Database *sql.DB

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("package", "db").Logger()
}

func Open(uri string) error {
	database, err := sql.Open("sqlite3", uri)
	if err != nil {
		return err
	}

	log.Info().Msg("opened sqlite database")

	Database = database

	return nil
}

func MigrateSchema(schemaFile string) error {
	schema, err := os.ReadFile(schemaFile)
	if err != nil {
		return errors.Wrap(err, "unable to open schema file")
	}

	_, err = Database.Exec(string(schema))
	if err != nil {
		return errors.Wrap(err, "unable to migrate database schema")
	}

	log.Info().Msg("migrated database schema")

	return nil
}
