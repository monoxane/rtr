package streams

import (
	"sync"

	"github.com/monoxane/rtr/internal/repository/streams"
)

type streamInstance struct {
	stream streams.Stream
}

var (
	streamInstances    map[int]streamInstance
	streamInstancesMux sync.Mutex
)

func UpdateStream(stream streams.Stream) error {

	streamInstancesMux.Lock()
	streamInstances[stream.ID] = streamInstance{
		stream: stream,
	}
	streamInstancesMux.Unlock()

	return nil
}

func DeleteStream(stream int) error {

	return nil
}
