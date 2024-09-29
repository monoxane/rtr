package model

type RouterModel struct {
	ID         int     `json:"id"`
	Label      string  `json:"label"`
	HelperText *string `json:"helperText,omitempty"`
	Inputs     int     `json:"inputs"`
	Outputs    int     `json:"outputs"`
}
