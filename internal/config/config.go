package config

import (
	"encoding/json"
	"os"

	"github.com/pkg/errors"
	"github.com/rs/zerolog"
)

var (
	log           zerolog.Logger
	configuration Configuration
)

func Logger(logger zerolog.Logger) {
	log = logger
}

func Save() error {
	log.Info().Msg("saving configuration")
	file, err := json.MarshalIndent(configuration, "", "	  ")
	if err != nil {
		return errors.Wrap(err, "unable to marshal configuration")
	}

	err = os.WriteFile("config.json", file, 0777)
	if err != nil {
		return errors.Wrap(err, "unable to save configuration to disk")
	}

	log.Info().Msg("saved configuration")
	return nil
}

func Load() error {
	log.Info().Msg("loading configuration")
	data, err := os.ReadFile("config.json")

	if err != nil && os.IsNotExist(err) {
		log.Info().Msg("no configuration found, creating new configuration")

		config := Configuration{
			ConfigurationRequired: true,
			Server: ServerConfig{
				HTTPPort:             8080,
				FirstProbeStreamPort: 9000,
			},
			Salvos: []Salvo{},
		}

		configuration = config

		Save()
	}

	if err == nil {
		err = json.Unmarshal(data, &configuration)
		if err != nil {
			return errors.Wrap(err, "unable to unmarshal configuration")
		}
	}

	return nil
}

func Get() Configuration {
	return configuration
}

func GetServer() ServerConfig {
	return configuration.Server
}

func GetRouter() RouterConfig {
	return configuration.Router
}

func SetRouter(router RouterConfig) error {
	configuration.ConfigurationRequired = false
	configuration.Router = router
	return Save()
}

func GetProbe() ProbeConfig {
	return configuration.Probe
}

func SetProbe(probe ProbeConfig) error {
	configuration.Probe = probe
	return Save()
}

func GetSalvos() []Salvo {
	return configuration.Salvos
}

func SetSalvos(salvos []Salvo) error {
	configuration.Salvos = salvos
	return Save()
}

func SetRouterDestinationsConfig(destinations []RouterSpigotConfiguration) {
	configuration.Router.IO.Destinations = destinations
	Save()
}

func SetRouterSourcesConfig(sources []RouterSpigotConfiguration) {
	configuration.Router.IO.Sources = sources
	Save()
}
