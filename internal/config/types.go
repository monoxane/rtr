package config

import (
	"encoding/json"

	nkmatrix "github.com/monoxane/nk/pkg/matrix"
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
	Provider string                `json:"provider"`
	IP       string                `json:"ip"`
	Address  int                   `json:"address"`
	Model    string                `json:"model"`
	Label    string                `json:"label"`
	IO       RouterIOConfiguration `json:"io"`
}

type RouterIOConfiguration struct {
	Sources      []RouterSpigotConfiguration `json:"sources"`
	Destinations []RouterSpigotConfiguration `json:"destinations"`
}

type RouterSpigotConfiguration struct {
	ID          int    `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description"`
}

type ProbeConfig struct {
	Enabled  bool            `json:"enabled"`
	Channels []*ProbeChannel `json:"channels"`
}

type ProbeChannel struct {
	Label             string `json:"label"`
	Slug              string `json:"slug"`
	RouterDestination int    `json:"router_destination"`
	IngestTypeString  string `json:"ingest_type"` // ts-http, ts-tcp
	HTTPPath          string `json:"http_path"`
	TCPPort           int    `json:"tcp_port"`
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
	Label        string                 `json:"label"`
	Destinations []nkmatrix.Destination `json:"destinations"`
}
