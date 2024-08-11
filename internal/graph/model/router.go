package model

import "github.com/monoxane/rtr/internal/repository"

type Router struct {
	ID            int     `json:"id"`
	Label         string  `json:"label"`
	Provider      int     `json:"provider"`
	IPAddress     string  `json:"ipAddress"`
	RouterAddress *int    `json:"routerAddress,omitempty"`
	Level         int     `json:"level"`
	Model         *string `json:"model,omitempty"`
	UpdatedBy     *int    `json:"updated_by"`
	repository.CommonMetadata
}
