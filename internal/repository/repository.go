package repository

import (
	"github.com/monoxane/rtr/internal/repository/destinations"
	"github.com/monoxane/rtr/internal/repository/routers"
	"github.com/monoxane/rtr/internal/repository/streams"
	"github.com/rs/zerolog"
)

func SetLoggers(logger zerolog.Logger) {
	destinations.SetLogger(logger)
	streams.SetLogger(logger)
	routers.SetLogger(logger)
}
