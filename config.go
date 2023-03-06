package main

import (
	"encoding/json"
	"log"
	"os"
)

type Configuration struct {
	Server       Server         `json:"server"`
	Router       Router         `json:"router"`
	Sources      []Sources      `json:"sources"`
	Destinations []Destinations `json:"destinations"`
}
type Server struct {
	Port int `json:"port"`
}
type Router struct {
	IP      string `json:"ip"`
	Address int    `json:"address"`
	Model   string `json:"model"`
}
type Sources struct {
	RtrInput int    `json:"rtr_input"`
	Label    string `json:"label"`
	Tsl      int    `json:"tsl"`
}
type Destinations struct {
	RtrOutput int    `json:"rtr_output"`
	Label     string `json:"label"`
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
