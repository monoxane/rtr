package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/router"
)

func main() {
	router.Connect()

	if len(config.Global.Probe.Channels) != 0 {
		for _, c := range config.Global.Probe.Channels {
			c.Start()
		}
	}

	go serveHTTP()

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Println(sig)
		done <- true
	}()

	log.Println("Server Start Awaiting Signal")
	<-done
	log.Println("Exiting")
}
