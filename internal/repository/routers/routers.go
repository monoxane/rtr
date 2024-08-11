package routers

import (
	"database/sql"
	"errors"
	"time"

	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/rs/zerolog"
)

const (
	queryRouters = "SELECT * from routers;"
)

var (
	log zerolog.Logger
)

func SetLogger(logger zerolog.Logger) {
	log = logger.With().Str("repository", "routers").Logger()
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
