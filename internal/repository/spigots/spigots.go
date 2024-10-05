package spigots

import "github.com/rs/zerolog"

var (
	log zerolog.Logger
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "spigots").Logger()
	log.Info().Msg("logger active")
}
