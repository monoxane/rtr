package config

import (
	"encoding/json"
	"log"
	"os"
)

var Global Configuration

func Save() {
	file, err := json.MarshalIndent(Global, "", "	  ")
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

func Load() {
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

		Global = config

		Save()
	}

	if err == nil {
		err = json.Unmarshal(data, &Global)
		if err != nil {
			log.Fatalln(err)
		}
	}
}
