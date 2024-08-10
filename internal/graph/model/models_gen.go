// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Destination struct {
	ID           int     `json:"id"`
	Index        int     `json:"index"`
	Label        string  `json:"label"`
	Description  *string `json:"description,omitempty"`
	UmdLabel     *string `json:"umdLabel,omitempty"`
	TallyGreen   bool    `json:"tallyGreen"`
	TallyRed     bool    `json:"tallyRed"`
	TallyYellow  bool    `json:"tallyYellow"`
	TallyAddress *int    `json:"tallyAddress,omitempty"`
	CreatedAt    *string `json:"createdAt,omitempty"`
	UpdatedAt    *string `json:"updatedAt,omitempty"`
	UpdatedBy    *string `json:"updatedBy,omitempty"`
	RoutedSource *Source `json:"routedSource,omitempty"`
}

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

type Mutation struct {
}

type Query struct {
}

type Router struct {
	ID            int            `json:"id"`
	Label         string         `json:"label"`
	Provider      int            `json:"provider"`
	IPAddress     string         `json:"ipAddress"`
	RouterAddress *int           `json:"routerAddress,omitempty"`
	Level         int            `json:"level"`
	Model         *string        `json:"model,omitempty"`
	CreatedAt     *string        `json:"createdAt,omitempty"`
	UpdatedAt     *string        `json:"updatedAt,omitempty"`
	UpdatedBy     *string        `json:"updatedBy,omitempty"`
	Destinations  []*Destination `json:"destinations"`
	Sources       []*Source      `json:"sources"`
}

type Salvo struct {
	ID            int             `json:"id"`
	Label         string          `json:"label"`
	Description   *string         `json:"description,omitempty"`
	CreatedAt     *string         `json:"createdAt,omitempty"`
	UpdatedAt     *string         `json:"updatedAt,omitempty"`
	UpdatedBy     *string         `json:"updatedBy,omitempty"`
	SalvoVersions []*SalvoVersion `json:"salvoVersions"`
}

type SalvoDestination struct {
	ID           int           `json:"id"`
	CreatedAt    *string       `json:"createdAt,omitempty"`
	UpdatedAt    *string       `json:"updatedAt,omitempty"`
	UpdatedBy    *string       `json:"updatedBy,omitempty"`
	SalvoVersion *SalvoVersion `json:"salvoVersion,omitempty"`
	Destination  *Destination  `json:"destination,omitempty"`
	Source       *Source       `json:"source,omitempty"`
}

type SalvoVersion struct {
	ID                int                 `json:"id"`
	Label             string              `json:"label"`
	Description       *string             `json:"description,omitempty"`
	CreatedAt         *string             `json:"createdAt,omitempty"`
	UpdatedAt         *string             `json:"updatedAt,omitempty"`
	UpdatedBy         *string             `json:"updatedBy,omitempty"`
	Salvo             *Salvo              `json:"salvo,omitempty"`
	SalvoDestinations []*SalvoDestination `json:"salvoDestinations"`
}

type Source struct {
	ID           int     `json:"id"`
	Index        int     `json:"index"`
	Label        string  `json:"label"`
	Description  *string `json:"description,omitempty"`
	UmdLabel     *string `json:"umdLabel,omitempty"`
	TallyGreen   bool    `json:"tallyGreen"`
	TallyRed     bool    `json:"tallyRed"`
	TallyYellow  bool    `json:"tallyYellow"`
	TallyAddress *int    `json:"tallyAddress,omitempty"`
}

type StreamUpdate struct {
	Label       string `json:"label"`
	Slug        string `json:"slug"`
	IsRoutable  bool   `json:"isRoutable"`
	Destination *int   `json:"destination,omitempty"`
}

type Subscription struct {
}

type TallyConnections struct {
	ID                  int            `json:"id"`
	EnableInbound       int            `json:"enableInbound"`
	EnableOutbound      string         `json:"enableOutbound"`
	RemoteIP            *string        `json:"remoteIp,omitempty"`
	RemotePort          *int           `json:"remotePort,omitempty"`
	LocalPort           *int           `json:"localPort,omitempty"`
	Protocol            string         `json:"protocol"`
	Transport           string         `json:"transport"`
	LastInboundMessage  *string        `json:"lastInboundMessage,omitempty"`
	LastOutboundMessage *string        `json:"lastOutboundMessage,omitempty"`
	CreatedAt           *string        `json:"createdAt,omitempty"`
	UpdatedAt           *string        `json:"updatedAt,omitempty"`
	UpdatedBy           *string        `json:"updatedBy,omitempty"`
	DeletedAt           *string        `json:"deletedAt,omitempty"`
	TallyStatesList     []*TallyStates `json:"tallyStatesList"`
}

type TallyStates struct {
	ID               int               `json:"id"`
	Address          int               `json:"address"`
	Tally1           int               `json:"tally1"`
	Tally2           int               `json:"tally2"`
	Tally3           int               `json:"tally3"`
	Tally4           int               `json:"tally4"`
	TallyConnections *TallyConnections `json:"tallyConnections,omitempty"`
}

type UserRouterBinding struct {
	ID        int     `json:"id"`
	CreatedAt *int    `json:"createdAt,omitempty"`
	UpdatedAt *int    `json:"updatedAt,omitempty"`
	UpdatedBy *int    `json:"updatedBy,omitempty"`
	User      *User   `json:"user,omitempty"`
	Router    *Router `json:"router,omitempty"`
}

type UserUpdate struct {
	Username *string `json:"username,omitempty"`
	Realname *string `json:"realname,omitempty"`
	Role     *string `json:"role,omitempty"`
	Password *string `json:"password,omitempty"`
}
