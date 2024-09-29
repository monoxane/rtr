package routers

import (
	"database/sql"
	"time"

	"github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/common"
)

const (
	queryRouters       = "SELECT * from routers;"
	queryRoutersByID   = "SELECT * FROM routers WHERE id = ?;"
	queryRoutersInsert = "INSERT INTO routers(label, provider, model, ip_address, router_address, level, created_at, updated_at, updated_by) values(?, ?, ?, ?, ?, ?, ?, ?, ?)"
)

var (
	log zerolog.Logger
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "routers").Logger()
}

func Create(router model.Router) (*model.Router, error) {
	res, err := db.Database.Exec(queryRoutersInsert, router.Label, router.Provider, router.Model, router.IPAddress, router.RouterAddress, router.Level, time.Now().Unix(), time.Now().Unix(), router.UpdatedBy)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return nil, errors.Wrap(err, "unable to insert router due to constraint")
			}
		}
		return nil, errors.Wrap(err, "unable to insert router")
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get id of inserted router")
	}

	newRouter, err := GetByID(int(id))
	if err != nil {
		return nil, errors.Wrap(err, "unable to get new router")
	}

	return newRouter, nil
}

func GetByID(id int) (*model.Router, error) {
	row := db.Database.QueryRow(queryRoutersByID, id)

	var router model.Router
	var cat int64
	var uat int64

	if err := row.Scan(&router.ID, &router.Label, &router.Provider, &router.Model, &router.IPAddress, &router.RouterAddress, &router.Level, &cat, &uat, &router.UpdatedBy, nil); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrNotExists
		}

		return nil, err
	}

	router.CreatedAt = time.Unix(cat, 0)
	router.UpdatedAt = time.Unix(uat, 0)
	return &router, nil
}

func List() ([]*model.Router, error) {
	rows, err := db.Database.Query(queryRouters)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var routers []*model.Router
	for rows.Next() {
		var router model.Router
		var cat int64
		var uat int64
		var dat *int64

		if err := rows.Scan(&router.ID, &router.Label, &router.Provider, &router.IPAddress, &router.RouterAddress, &router.Level, &router.Model, &cat, &uat, &router.UpdatedBy, &dat); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}

			log.Printf("unable to scan row: %s", err)
		}

		router.CreatedAt = time.Unix(cat, 0)
		router.UpdatedAt = time.Unix(uat, 0)
		if dat != nil {
			deletedAt := time.Unix(*dat, 0)
			router.DeletedAt = &deletedAt
		}

		routers = append(routers, &router)
	}

	return routers, nil
}
