package model

import (
	"github.com/monoxane/rtr/internal/repository/common"
)

type Router struct {
	ID            int            `json:"id"`
	Label         string         `json:"label"`
	Provider      RouterProvider `json:"provider"`
	ProviderID    int            `json:"-"`
	Model         RouterModel    `json:"model,omitempty"`
	ModelID       int            `json:"-"`
	IPAddress     string         `json:"ipAddress"`
	RouterAddress *int           `json:"routerAddress,omitempty"`
	Level         int            `json:"level"`
	UpdatedBy     *int           `json:"updated_by"`
	common.CommonMetadata
}
