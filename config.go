package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"

	"github.com/monoxane/nk"
)

type Configuration struct {
	Server Server  `json:"server"`
	Router Router  `json:"router"`
	Probe  Probe   `json:"probe"`
	Salvos []Salvo `json:"salvos"`
}
type Server struct {
	Port                 int `json:"port"`
	FirstProbeStreamPort int `json:"first_probe_stream_port"`
}
type Router struct {
	IP      string `json:"ip"`
	Address int    `json:"address"`
	Model   string `json:"model"`
}

type Probe struct {
	Enabled            bool  `json:"enabled"`
	RouterDestinations []int `json:"router_destinations"`
}

type Salvo struct {
	Label        string           `json:"label"`
	Destinations []nk.Destination `json:"destinations"`
}

func (c *Configuration) Save() {
	file, err := json.MarshalIndent(c, "", "	")
	if err != nil {
		log.Printf("unable to marshal config: %s", err)
		return
	}

	err = ioutil.WriteFile("config.json", file, 0777)
	if err != nil {
		log.Printf("unable to save config: %s", err)
		return
	}

	log.Print("saved config")
}

var Config Configuration

func init() {
	data, err := os.ReadFile("config.json")
	if err == nil {
		err = json.Unmarshal(data, &Config)
		if err != nil {
			log.Fatalln(err)
		}
	}
}
