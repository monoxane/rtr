package router

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"

	"github.com/monoxane/rtr/internal/config"
)

type Destination struct {
	Id          int     `json:"id"`
	Label       string  `json:"label"`
	UMD         string  `json:"umd"`
	Description string  `json:"description"`
	Source      *Source `json:"source"`
}

type Source struct {
	Id          int    `json:"id"`
	Label       string `json:"label"`
	UMD         string `json:"umd"`
	Description string `json:"description"`
}

type RouterMatrix struct {
	destinations map[int]*Destination
	sources      map[int]*Source
	notify       func(*RouteUpdate)
	mux          sync.Mutex
}

func (matrix *RouterMatrix) Init(numDestinations, numSources int) {
	matrix.destinations = make(map[int]*Destination)
	matrix.sources = make(map[int]*Source)

	routerConfig := config.GetRouter()

	for i := 0; i < int(numSources)+1; i++ {
		if i < len(routerConfig.IO.Sources) {
			matrix.sources[i] = &Source{
				Id:          i,
				Label:       routerConfig.IO.Sources[i].Label,
				Description: routerConfig.IO.Sources[i].Description,
			}
		} else {
			matrix.sources[i] = &Source{
				Id:          i,
				Label:       fmt.Sprintf("IN %d", i),
				Description: fmt.Sprintf("INPUT %d", i),
			}
		}
	}

	matrix.sources[0].SetLabel("DISCONNECTED")
	matrix.sources[0].SetDescription("This Destination has no Source")

	for i := 0; i < int(numDestinations)+1; i++ {
		if i < len(routerConfig.IO.Destinations) {
			matrix.destinations[i] = &Destination{
				Id:          i,
				Label:       routerConfig.IO.Destinations[i].Label,
				Description: routerConfig.IO.Destinations[i].Description,
			}
		} else {
			matrix.destinations[i] = &Destination{
				Id:          i,
				Label:       fmt.Sprintf("OUT %d", i),
				Description: fmt.Sprintf("OUTPUT %d", i),
			}
		}
	}

	go func() {
		sources := make([]config.RouterSpigotConfiguration, numSources+1)
		for i, source := range matrix.sources {
			sources[i] = config.RouterSpigotConfiguration{
				ID:          i,
				Label:       source.Label,
				Description: source.Description,
			}
		}
		config.SetRouterSourcesConfig(sources)

		destinations := make([]config.RouterSpigotConfiguration, numDestinations+1)
		for i, destination := range matrix.destinations {
			destinations[i] = config.RouterSpigotConfiguration{
				ID:          i,
				Label:       destination.Label,
				Description: destination.Description,
			}
		}
		config.SetRouterDestinationsConfig(destinations)
	}()
}

func (matrix *RouterMatrix) MarshalJSON() ([]byte, error) {
	type res struct {
		Destinations []*Destination `json:"destinations,omitempty"`
		Sources      []*Source      `json:"sources,omitempty"`
	}

	var result res

	for _, dst := range matrix.destinations {
		if dst != nil && dst.Id != 0 {
			result.Destinations = append(result.Destinations, dst)
		}
	}

	sort.Slice(result.Destinations, func(i, j int) bool {
		return result.Destinations[i].Id < result.Destinations[j].Id
	})

	for _, src := range matrix.sources {
		if src != nil && src.Id != 0 {
			result.Sources = append(result.Sources, src)
		}
	}

	sort.Slice(result.Sources, func(i, j int) bool {
		return result.Sources[i].Id < result.Sources[j].Id
	})

	return json.Marshal(&result)
}

func (matrix *RouterMatrix) UpdateCrosspoint(dst int, src int) {
	matrix.mux.Lock()
	matrix.destinations[dst].Source = matrix.sources[src]
	matrix.mux.Unlock()

	log.Info().
		Int("dst_id", matrix.destinations[dst].GetID()).
		Str("dst", matrix.destinations[dst].GetLabel()).
		Int("src_id", matrix.destinations[dst].Source.GetID()).
		Str("src", matrix.destinations[dst].Source.GetLabel()).
		Msg("route update")

	go matrix.notify(&RouteUpdate{
		Type:        "destination",
		Destination: Matrix.GetDestination(dst),
	})
}

func (matrix *RouterMatrix) GetDestination(dst int) *Destination {
	matrix.mux.Lock()
	defer matrix.mux.Unlock()
	return matrix.destinations[dst]
}

func (matrix *RouterMatrix) GetSource(src int) *Source {
	matrix.mux.Lock()
	defer matrix.mux.Unlock()
	return matrix.sources[src]
}

func (dst *Destination) GetID() int {
	return dst.Id
}

func (dst *Destination) GetLabel() string {
	return dst.Label
}

func (dst *Destination) SetLabel(lbl string) {
	dst.Label = lbl

	cfg := config.GetRouter().IO.Destinations
	cfg[dst.Id].Label = lbl
	config.SetRouterDestinationsConfig(cfg)
}

func (dst *Destination) SetDescription(desc string) {
	dst.Description = desc

	cfg := config.GetRouter().IO.Destinations
	cfg[dst.Id].Description = desc
	config.SetRouterDestinationsConfig(cfg)
}

func (dst *Destination) GetSource() *Source {
	return dst.Source
}

func (src *Source) GetID() int {
	return src.Id
}

func (src *Source) GetLabel() string {
	return src.Label
}

func (src *Source) SetLabel(lbl string) {
	src.Label = lbl

	cfg := config.GetRouter().IO.Sources
	cfg[src.Id].Label = lbl
	config.SetRouterSourcesConfig(cfg)
}

func (src *Source) SetDescription(desc string) {
	src.Description = desc

	cfg := config.GetRouter().IO.Sources
	cfg[src.Id].Description = desc
	config.SetRouterSourcesConfig(cfg)
}

func (matrix *RouterMatrix) SetSourceLabel(src int, label string) {
	if src <= int(len(matrix.sources)) {
		matrix.GetSource(src).SetLabel(label)
		if matrix.notify != nil {
			go matrix.notify(&RouteUpdate{
				Type:   "source",
				Source: Matrix.GetSource(src),
			})
		}

		matrix.ForEachDestination(func(i int, dst *Destination) {
			if dst.Source != nil && dst.Source.GetID() == src {
				if matrix.notify != nil {
					go matrix.notify(&RouteUpdate{
						Type:        "destination",
						Destination: dst,
					})
				}
			}
		})
	}
}

func (matrix *RouterMatrix) SetSourceDescription(src int, desc string) {
	if src <= int(len(matrix.sources)) {
		matrix.GetSource(src).SetDescription(desc)
		if matrix.notify != nil {
			go matrix.notify(&RouteUpdate{
				Type:   "source",
				Source: Matrix.GetSource(src),
			})
		}

		matrix.ForEachDestination(func(i int, dst *Destination) {
			if dst.Source != nil && dst.Source.GetID() == src {
				if matrix.notify != nil {
					go matrix.notify(&RouteUpdate{
						Type:        "destination",
						Destination: dst,
					})
				}
			}
		})
	}
}

func (matrix *RouterMatrix) SetDestinationLabel(dst int, label string) {
	if dst <= int(len(matrix.destinations)) {
		matrix.GetDestination(dst).SetLabel(label)

		if matrix.notify != nil {
			go matrix.notify(&RouteUpdate{
				Type:        "destination",
				Destination: matrix.GetDestination(dst),
			})
		}
	}
}

func (matrix *RouterMatrix) SetDestinationDescription(dst int, desc string) {
	if dst <= int(len(matrix.destinations)) {
		log.Debug().Int("dst", dst).Str("description", desc).Msg("setting description for destination")
		matrix.GetDestination(dst).SetDescription(desc)

		if matrix.notify != nil {
			ru := &RouteUpdate{
				Type:        "destination",
				Destination: matrix.GetDestination(dst),
			}

			log.Debug().Interface("ru", ru).Msg("sending ru for dst desc update")
			go matrix.notify(ru)

		}
	}
}

func (matrix *RouterMatrix) ForEachDestination(callback func(int, *Destination)) {
	for i, d := range matrix.destinations {
		callback(i, d)
	}
}

func (matrix *RouterMatrix) LoadLabels(labels string) {
	lines := strings.Split(labels, "\n")
	for i, line := range lines {
		columns := strings.Split(line, ",")
		if len(columns) < 4 {
			continue
		}

		if i < int(len(matrix.destinations)) {
			matrix.GetDestination(i + 1).SetLabel(columns[1])
		}

		if i < int(len(matrix.sources)) {
			matrix.GetSource(i + 1).SetLabel(columns[3])
		}
	}
}
