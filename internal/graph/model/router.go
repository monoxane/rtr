package model

import (
	"github.com/monoxane/rtr/internal/repository/common"
)

type Router struct {
	ID            int    `json:"id"`
	Label         string `json:"label"`
	ProviderID    int    `json:"-"`
	ModelID       int    `json:"-"`
	IPAddress     string `json:"ipAddress"`
	RouterAddress *int   `json:"routerAddress,omitempty"`
	Level         int    `json:"level"`
	IsConnected   bool   `json:"is_connected"`
	UpdatedBy     *int   `json:"updated_by"`
	common.CommonMetadata
}
