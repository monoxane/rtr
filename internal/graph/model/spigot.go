package model

type Destination struct {
	ID             int     `json:"id"`
	Index          int     `json:"index"`
	Label          string  `json:"label"`
	Description    *string `json:"description,omitempty"`
	UmdLabel       *string `json:"umdLabel,omitempty"`
	TallyGreen     bool    `json:"tallyGreen"`
	TallyRed       bool    `json:"tallyRed"`
	TallyYellow    bool    `json:"tallyYellow"`
	TallyAddress   *int    `json:"tallyAddress,omitempty"`
	RoutedSourceID *int    `json:"routedSourceID,omitempty"`
}
