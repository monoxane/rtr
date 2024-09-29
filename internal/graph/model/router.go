package model

import "github.com/monoxane/rtr/internal/repository"

type Router struct {
	ID            int     `json:"id"`
	Label         string  `json:"label"`
	Provider      string  `json:"provider"`
	Model         *string `json:"model,omitempty"`
	IPAddress     string  `json:"ipAddress"`
	RouterAddress *int    `json:"routerAddress,omitempty"`
	Level         int     `json:"level"`
	UpdatedBy     *int    `json:"updated_by"`
	repository.CommonMetadata
}
