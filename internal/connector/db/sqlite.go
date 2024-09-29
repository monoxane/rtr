package db

import (
	"database/sql"

	"github.com/golang-migrate/migrate/v4"
	sqliteDriver "github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"

	"github.com/monoxane/rtr/migrations"
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

func MigrateUp() error {
	embeddedFS, err := iofs.New(migrations.EmbeddedFS, ".")
	if err != nil {
		return errors.Wrap(err, "unable to open iofs")
	}

	driver, err := sqliteDriver.WithInstance(Database, &sqliteDriver.Config{DatabaseName: "rtr"})
	if err != nil {
		return errors.Wrap(err, "unable to create driver")
	}

	m, err := migrate.NewWithInstance("iofs", embeddedFS, "rtr", driver)
	if err != nil {
		return errors.Wrap(err, "unable to create instance")
	}

	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		return errors.Wrap(err, "unable to execute migrations")
	}
	return nil
}
