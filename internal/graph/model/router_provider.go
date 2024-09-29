package model

type RouterProvider struct {
	ID         int     `json:"id"`
	Label      string  `json:"label"`
	HelperText *string `json:"helperText,omitempty"`
}
