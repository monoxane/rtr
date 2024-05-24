package probe

import "time"

var (
	statsHandler func(map[string]ProbeChannelStatus)
)

type ProbeChannelStatus struct {
	Slug         string `json:"slug"`
	ActiveSource bool   `json:"active_source"`
	Clients      int    `json:"clients"`
}

func StatsHandler(handler func(map[string]ProbeChannelStatus)) {
	statsHandler = handler
	go WritePumpStats()
}

func WritePumpStats() {
	log.Info().Msg("sending probe stats every 1 second")
	ticker := time.NewTicker(1 * time.Second)
	for range ticker.C {
		SendProbeStats()
	}
}

func GetProbeStatuses() map[string]ProbeChannelStatus {
	statuses := map[string]ProbeChannelStatus{}

	for _, channel := range channels {
		statuses[channel.Slug] = channel.Handler.Status
	}

	return statuses
}

func SendProbeStats() {
	statsHandler(GetProbeStatuses())
}
