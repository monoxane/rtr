package main

import (
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rs/zerolog"

	"github.com/monoxane/rtr/internal/api"
	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/probe"
	"github.com/monoxane/rtr/internal/router"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}

	log := zerolog.New(output).With().Timestamp().Caller().Logger()
	log.Info().Msg("rtr starting")

	router.Logger(log.With().Str("package", "router").Logger())
	probe.Logger(log.With().Str("package", "probe").Logger())
	api.Logger(log.With().Str("package", "api").Logger())
	config.Logger(log.With().Str("package", "config").Logger())

	err := config.Load()
	if err != nil {
		log.Error().Err(err).Msg("unable to load configuration")
	}

	router.Connect(api.RouteUpdateHandler)
	probe.StatsHandler(api.ProbeStatsHandler)
	api.SetProbeStatusGetter(probe.GetProbeStatuses)

	probe.LoadChannels(config.GetProbe().Channels)

	go api.Serve()

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
