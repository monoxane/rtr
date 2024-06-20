package router

type RouteRequest struct {
	Destination int `json:"destination"`
	Source      int `json:"source"`
}

type DestinationUpdate struct {
	Id          int          `json:"id"`
	Label       string       `json:"label"`
	Description string       `json:"description"`
	Source      SourceUpdate `json:"source"`
}

type SourceUpdate struct {
	Id          int    `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description"`
}
