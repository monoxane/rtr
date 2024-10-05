package routers

import (
	"database/sql"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/common"
	"github.com/pkg/errors"
)

const (
	queryRouterProviders      = "SELECT * FROM router_providers;"
	queryRouterProvider       = "SELECT * FROM router_providers WHERE id = ?;"
	queryRouterProviderModels = "SELECT id, label, inputs, outputs, helper_text FROM router_models WHERE provider_id = ?;"
	queryRouterModel          = "SELECT id, label, inputs, outputs, helper_text FROM router_models WHERE id = ?;"
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

			log.Error().Err(err).Msg("unable to scan row")
		}

		routerProviders = append(routerProviders, &provider)
	}

	return routerProviders, nil
}

func ListProviderModels(providerId int) ([]*model.RouterModel, error) {
	rows, err := db.Database.Query(queryRouterProviderModels, providerId)
	if err != nil {
		log.Error().Err(err).Msg("unable to query")
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

			log.Error().Err(err).Msg("unable to scan row")
		}

		models = append(models, &model)
	}

	return models, nil
}

func GetProvider(id int) (*model.RouterProvider, error) {
	row := db.Database.QueryRow(queryRouterProvider, id)

	var provider model.RouterProvider

	if err := row.Scan(&provider.ID, &provider.Label, &provider.HelperText); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		log.Error().Err(err).Msg("unable to scan row")

		return nil, err
	}

	return &provider, nil
}

func GetModel(id int) (*model.RouterModel, error) {
	row := db.Database.QueryRow(queryRouterModel, id)

	var model model.RouterModel

	if err := row.Scan(&model.ID, &model.Label, &model.Inputs, &model.Outputs, &model.HelperText); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		log.Error().Err(err).Msg("unable to scan row")

		return nil, err
	}

	return &model, nil
}
