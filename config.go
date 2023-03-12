package main

import (
	"encoding/json"
	"log"
	"os"
)

type Configuration struct {
	Server Server `json:"server"`
	Router Router `json:"router"`
	Probe  Probe  `json:"probe"`
}
type Server struct {
	Port int `json:"port"`
}
type Router struct {
	IP      string `json:"ip"`
	Address int    `json:"address"`
	Model   string `json:"model"`
}

type Probe struct {
	Enabled           bool `json:"enabled"`
	RouterDestination int  `json:"router_destination"`
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
