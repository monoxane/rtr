package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/monoxane/nk/pkg/matrix"
)

type Configuration struct {
	ConfigurationRequired bool         `json:"configuration_required"`
	Server                ServerConfig `json:"server"`
	Router                RouterConfig `json:"router"`
	Probe                 ProbeConfig  `json:"probe"`
	Salvos                []Salvo      `json:"salvos"`
}
type ServerConfig struct {
	HTTPPort             int `json:"http_port"`
	FirstProbeStreamPort int `json:"first_probe_stream_port"`
}
type RouterConfig struct {
	Provider string `json:"provider"`
	IP       string `json:"ip"`
	Address  int    `json:"address"`
	Model    string `json:"model"`
	Label    string `json:"label"`
}

type ProbeConfig struct {
	Enabled  bool            `json:"enabled"`
	Channels []*ProbeChannel `json:"channels"`
}

type ProbeChannel struct {
	Label             string              `json:"label"`
	Slug              string              `json:"slug"`
	RouterDestination int                 `json:"router_destination"`
	IngestTypeString  string              `json:"ingest_type"` // ts-http, ts-tcp
	HTTPPath          string              `json:"http_path"`
	TCPPort           int                 `json:"tcp_port"`
	Handler           *ProbeClientHandler `json:"-"`
}

func (c *ProbeChannel) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Label             string `json:"label"`
		Slug              string `json:"slug"`
		RouterDestination int    `json:"router_destination"`
		IngestTypeString  string `json:"ingest_type"` // ts-http, ts-tcp
		HTTPPath          string `json:"http_path"`
		TCPPort           int    `json:"tcp_port"`
	}{
		Label:             c.Label,
		Slug:              c.Slug,
		RouterDestination: c.RouterDestination,
		IngestTypeString:  c.IngestTypeString,
		HTTPPath:          "/v1/probe/stream/" + c.Slug,
		TCPPort:           c.TCPPort,
	})
}

type Salvo struct {
	Label        string               `json:"label"`
	Destinations []matrix.Destination `json:"destinations"`
}

func (c *Configuration) Save() {
	file, err := json.MarshalIndent(c, "", "	  ")
	if err != nil {
		log.Printf("unable to marshal config: %s", err)
		return
	}

	err = os.WriteFile("config.json", file, 0777)
	if err != nil {
		log.Printf("unable to save config: %s", err)
		return
	}

	log.Print("saved config")
}

var Config Configuration

func init() {
	data, err := os.ReadFile("config.json")

	if err != nil && os.IsNotExist(err) {
		config := Configuration{
			ConfigurationRequired: true,
			Server: ServerConfig{
				HTTPPort:             8080,
				FirstProbeStreamPort: 9000,
			},
			Salvos: []Salvo{},
		}

		config.Save()

		Config = config
	}

	if err == nil {
		err = json.Unmarshal(data, &Config)
		if err != nil {
			log.Fatalln(err)
		}
	}
}
