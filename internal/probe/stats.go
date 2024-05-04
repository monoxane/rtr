package probe

import (
	"encoding/json"

	"github.com/monoxane/rtr/internal/config"
	"github.com/monoxane/rtr/internal/model"
)

type ProbeChannelStatus struct {
	Id           int  `json:"id"`
	ActiveSource bool `json:"active_source"`
	Clients      int  `json:"clients"`
}

func SendProbeStats() {
	statuses := []ProbeChannelStatus{}

	for _, channel := range config.Global.Probe.Channels {
		statuses = append(statuses, channel.Handler.Status)
	}

	payload, _ := json.Marshal(statuses)
	update := model.MatrixWSMessage{
		Type: "probe_stats",
		Data: payload,
	}

	MatrixWSConnectionsMutex.Lock()
	for conn := range MatrixWSConnections {
		conn.Socket.WriteJSON(update)
	}
	MatrixWSConnectionsMutex.Unlock()
}
