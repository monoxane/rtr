package db

import (
	"fmt"
	"time"
)

var (
	ErrNotExists error = fmt.Errorf("record not found")
)

type CommonMetadata struct {
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}
