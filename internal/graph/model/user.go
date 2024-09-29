package model

import (
	"time"

	"github.com/monoxane/rtr/internal/repository/common"
)

type User struct {
	ID        int        `json:"id"`
	Username  string     `json:"username" binding:"required"`
	RealName  string     `json:"real_name" binding:"required"`
	Hash      string     `json:"-"`
	Role      string     `json:"role" binding:"required"`
	UpdatedBy *int       `json:"updated_by"`
	LastLogin *time.Time `json:"last_login"`
	common.CommonMetadata
}
