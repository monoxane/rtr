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
	queryInsertSource  = "INSERT INTO `sources`(`router_id`, `index`, `label`) values (?, ?, ?);"
	queryRouterSource  = "SELECT `id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address` FROM `sources` WHERE `id` = ?;"
	queryRouterSources = "SELECT `id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address` FROM `sources` WHERE `router_id` = ?;"
	querySourceUpdate  = "UPDATE `sources` SET `label` = ?, `description` = ?, `tally_address` = ?, `umd_label` = ? WHERE `id` = ?;"
)

func CreateSource(router_id int64, source model.Source) error {
	log.Debug().Int64("router_id", router_id).Interface("source", source).Msg("inserting source")
	_, err := db.Database.Exec(queryInsertSource, router_id, source.Index, source.Label)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return errors.Wrap(err, "unable to insert source due to constraint")
			}
		}
		return errors.Wrap(err, "unable to insert source")
	}

	return nil
}

func ListSourcesForRouter(id int) ([]*model.Source, error) {
	rows, err := db.Database.Query(queryRouterSources, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sources []*model.Source
	for rows.Next() {
		var source model.Source

		if err := rows.Scan(&source.ID, &source.Index, &source.Label, &source.Description, &source.UmdLabel, &source.TallyGreen, &source.TallyRed, &source.TallyYellow, &source.TallyAddress); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}

			log.Error().Err(err).Msg("unable to scan row")
		}

		sources = append(sources, &source)
	}

	return sources, nil
}

func GetSource(id int) (*model.Source, error) {
	row := db.Database.QueryRow(queryRouterSource, id)

	var source model.Source

	if err := row.Scan(&source.ID, &source.Index, &source.Label, &source.Description, &source.UmdLabel, &source.TallyGreen, &source.TallyRed, &source.TallyYellow, &source.TallyAddress); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		return nil, err
	}

	return &source, nil
}

func UpdateSource(source model.SourceUpdate) (*model.Source, error) {
	_, err := db.Database.Exec(querySourceUpdate, source.Label, source.Description, source.TallyAddress, source.UmdLabel, source.ID)
	if err != nil {
		return nil, errors.Wrap(err, "unable to update source")
	}

	updatedSource, err := GetSource(source.ID)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get updated source")
	}

	// notifySource(routerId, updatedSource.Index)

	return updatedSource, nil
}
