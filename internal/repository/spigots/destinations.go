package spigots

import (
	"database/sql"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/common"

	"github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
)

var (
	queryInsertDestination            = "INSERT INTO `destinations` (`router_id`, `index`, `label`) VALUES (?, ?, ?);"
	queryRouterDestinations           = "SELECT `id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`, `routed_source_id` FROM `destinations` WHERE `router_id` = ?;"
	queryRouterDestinationByIndex     = "SELECT `id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`, `routed_source_id` FROM `destinations` WHERE `router_id` = ? AND `index` = ?;"
	queryRouterDestination            = "SELECT `id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`, `routed_source_id`, `router_id` FROM `destinations` WHERE `id` = ?;"
	queryDestinationUpdate            = "UPDATE destinations SET `label` = ?, `description` = ?, `tally_address` = ? WHERE `id` = ?;"
	queryRouterDestinationLabelUpdate = "UPDATE `destinations` SET `label` = ?, `description` = ? WHERE `router_id` = ? AND `index` = ?"
)

func CreateDestination(router_id int64, destination model.Destination) error {
	log.Debug().Int64("router_id", router_id).Interface("destination", destination).Msg("inserting destination")
	_, err := db.Database.Exec(queryInsertDestination, router_id, destination.Index, destination.Label)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return errors.Wrap(err, "unable to insert destination due to constraint")
			}
		}
		return errors.Wrap(err, "unable to insert destination")
	}

	notifyDestination(&destination)

	return nil
}

func ListDestinationsForRouter(id int) ([]*model.Destination, error) {
	rows, err := db.Database.Query(queryRouterDestinations, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var destinations []*model.Destination
	for rows.Next() {
		var destination model.Destination

		if err := rows.Scan(&destination.ID, &destination.Index, &destination.Label, &destination.Description, &destination.UmdLabel, &destination.TallyGreen, &destination.TallyRed, &destination.TallyYellow, &destination.TallyAddress, &destination.RoutedSourceID); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}

			log.Error().Err(err).Msg("unable to scan row")
		}

		destinations = append(destinations, &destination)
	}

	return destinations, nil
}

func GetDestinationByIndex(routerId, index int) (*model.Destination, error) {
	row := db.Database.QueryRow(queryRouterDestinationByIndex, routerId, index)

	var destination model.Destination

	if err := row.Scan(&destination.ID, &destination.Index, &destination.Label, &destination.Description, &destination.UmdLabel, &destination.TallyGreen, &destination.TallyRed, &destination.TallyYellow, &destination.TallyAddress, &destination.RoutedSourceID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		return nil, err
	}

	return &destination, nil
}

func GetDestination(id int) (*model.Destination, error) {
	row := db.Database.QueryRow(queryRouterDestination, id)

	var destination model.Destination

	if err := row.Scan(&destination.ID, &destination.Index, &destination.Label, &destination.Description, &destination.UmdLabel, &destination.TallyGreen, &destination.TallyRed, &destination.TallyYellow, &destination.TallyAddress, &destination.RoutedSourceID, &destination.RouterID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		return nil, err
	}

	return &destination, nil
}

func UpdateDestination(destination model.DestinationUpdate) (*model.Destination, error) {
	_, err := db.Database.Exec(queryDestinationUpdate, destination.Label, destination.Description, destination.TallyAddress, destination.ID)
	if err != nil {
		return nil, errors.Wrap(err, "unable to update destination")
	}

	updatedDestination, err := GetDestination(destination.ID)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get updated destination")
	}

	notifyDestination(updatedDestination)

	return updatedDestination, nil
}

func UpdateLabelsForRouterDestination(router, destination int, label, description string) error {
	_, err := db.Database.Exec(queryRouterDestinationLabelUpdate, label, description, router, destination)
	if err != nil {
		return errors.Wrap(err, "unable to update destination")
	}

	updatedDestination, err := GetDestinationByIndex(router, destination)
	if err != nil {
		return errors.Wrap(err, "unable to get updated destination")
	}

	notifyDestination(updatedDestination)

	return nil
}
