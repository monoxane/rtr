package routers

import (
	"github.com/monoxane/rtr/internal/graph/model"
	"go.openly.dev/pointy"
)

var RouterProviders = map[string]*model.RouterProvider{
	"ross-nk": {
		ID:         "ross-nk",
		Label:      "Ross NK",
		HelperText: pointy.String("Connection to NK Routers requires an NK-IPS or NK-NET gateway."),
		AdditionalConfiguration: []*string{
			pointy.String("routerAddress"),
		},
		Models: []*model.RouterModel{
			RouterModels["ross-nk-3g72"],
		},
	},
}

var RouterProvidersList = []*model.RouterProvider{RouterProviders["ross-nk"]}

var RouterModels = map[string]*model.RouterModel{
	"ross-nk-3g72": {
		ID:      "ross-nk-3g72",
		Label:   "NK 3G72",
		Inputs:  72,
		Outputs: 72,
	},
}
