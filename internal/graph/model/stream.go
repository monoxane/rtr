package model

import "github.com/monoxane/rtr/internal/repository"

type Stream struct {
	ID          int    `json:"id"`
	Label       string `json:"label"`
	Slug        string `json:"slug"`
	IsRoutable  bool   `json:"isRoutable"`
	IsActive    bool   `json:"isActive"`
	Clients     int    `json:"clients"`
	Destination *int   `json:"destination,omitempty"`
	UpdatedBy   *int   `json:"updated_by"`
	repository.CommonMetadata
}
