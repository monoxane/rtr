package routers

import (
	"database/sql"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/pkg/errors"
)

const (
	queryRouterProviders      = "SELECT * FROM router_providers;"
	queryRouterProviderModels = "SELECT (id, label, inputs, outputs, helper_text) FROM router_models WHERE provider_id = ?;"
)

func ListProviders() ([]*model.RouterProvider, error) {
	rows, err := db.Database.Query(queryRouterProviders)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var routerProviders []*model.RouterProvider
	for rows.Next() {
		var provider model.RouterProvider

		if err := rows.Scan(&provider.ID, &provider.Label, &provider.HelperText); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}

			log.Printf("unable to scan row: %s", err)
		}

		routerProviders = append(routerProviders, &provider)
	}

	return routerProviders, nil
}

func ListProviderModels(providerId int) ([]*model.RouterModel, error) {
	rows, err := db.Database.Query(queryRouterProviderModels, providerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var models []*model.RouterModel
	for rows.Next() {
		var model model.RouterModel

		if err := rows.Scan(&model.ID, &model.Label, &model.Inputs, &model.Outputs, &model.HelperText); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}

			log.Printf("unable to scan row: %s", err)
		}

		models = append(models, &model)
	}

	return models, nil
}
