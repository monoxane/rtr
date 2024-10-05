package repository

import (
	"github.com/monoxane/rtr/internal/repository/routers"
	"github.com/monoxane/rtr/internal/repository/spigots"
	"github.com/monoxane/rtr/internal/repository/streams"
	"github.com/rs/zerolog"
)

func SetLoggers(logger zerolog.Logger) {
	logger.Info().Msg("setting repository loggers")
	spigots.SetLogger(logger)
	streams.SetLogger(logger)
	routers.SetLogger(logger)
}
