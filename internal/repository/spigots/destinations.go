package spigots

import (
	"database/sql"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"

	"github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
)

var (
	queryInsertDestination  = "INSERT INTO `destinations` (`router_id`, `index`, `label`) VALUES (?, ?, ?);"
	queryRouterDestinations = "SELECT `id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`, `routed_source_id` FROM `destinations` WHERE `router_id` = ?;"
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
