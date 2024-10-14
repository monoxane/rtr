package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/monoxane/rtr/internal/api"
	"github.com/monoxane/rtr/internal/api/auth"
	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/controller/routers"
	"github.com/monoxane/rtr/internal/controller/streams"
	"github.com/monoxane/rtr/internal/env"
	"github.com/monoxane/rtr/internal/graph/model"
	repository "github.com/monoxane/rtr/internal/repository"
	"github.com/monoxane/rtr/internal/repository/users"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
)

var (
	log zerolog.Logger
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}

	log = zerolog.New(output).With().Timestamp().Caller().Logger()
	log.Info().Msg("rtr starting")

	err := env.LoadFromEnvironment()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load environment variables")
	}

	err = setLogLevel(env.LogLevel)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to set log level")
	}

	db.SetLogger(log)
	api.SetLogger(log)
	streams.SetLogger(log)
	routers.SetLogger(log)
	repository.SetLoggers(log)

	err = db.Open("rtr.db")
	if err != nil {
		log.Fatal().Err(err).Msg("failed to open database")
	}

	err = db.MigrateUp()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to migrate database schema")
	}

	log.Info().Msg("migrated database schema")

	createAdminUser(env.AdminUsername, env.AdminPassword)

	log.Info().Msg("admin user created")

	go api.Serve()
	log.Info().Msg("api serving")

	err = streams.LoadStreams()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load streams")
	}
	log.Info().Msg("loaded streams")

	err = routers.LoadRouters()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load routers")
	}
	log.Info().Msg("loaded routers")

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Warn().Interface("signal", sig).Msg("received signal")
		done <- true
	}()

	log.Info().Msg("rtr started")
	<-done
	log.Info().Msg("rtr exiting")
}

func createAdminUser(username, password string) error {
	_, err := users.GetByUsername(username)
	if err == nil {
		return nil
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		return errors.Wrap(err, "unable to hash password for admin user")
	}

	_, err = users.Create(model.User{
		Username: env.AdminUsername,
		Hash:     string(hash),
		Role:     auth.ROLE_ADMIN,
	})

	return err
}

func setLogLevel(level string) error {
	switch level {
	case "TRACE":
		zerolog.SetGlobalLevel(zerolog.TraceLevel)
	case "DEBUG":
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "INFO":
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	case "ERROR":
		zerolog.SetGlobalLevel(zerolog.ErrorLevel)
	case "FATAL":
		zerolog.SetGlobalLevel(zerolog.FatalLevel)
	default:
		return fmt.Errorf("invalid or unsupported log level: %s", level)
	}

	return nil
}
