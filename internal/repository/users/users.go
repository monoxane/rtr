package users

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/mattn/go-sqlite3"
	"github.com/monoxane/rtr/internal/connector/db"
	"github.com/monoxane/rtr/internal/repository"
	"github.com/pkg/errors"
)

type User struct {
	ID        int        `json:"id"`
	Username  string     `json:"username" binding:"required"`
	RealName  string     `json:"real_name" binding:"required"`
	Hash      string     `json:"-"`
	Role      string     `json:"role" binding:"required"`
	UpdatedBy *int       `json:"updated_by"`
	LastLogin *time.Time `json:"last_login"`
	repository.CommonMetadata
}

const (
	queryUsers               = "SELECT * FROM users WHERE deleted_at IS NULL"
	queryUsersWithDeleted    = "SELECT * FROM users"
	queryUserByUsername      = "SELECT * FROM users WHERE username = ? AND deleted_at IS NULL"
	queryUserByID            = "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL"
	queryUsersInsert         = "INSERT INTO users(username, real_name, password_hash, role, created_at, updated_at, updated_by) values(?,?,?,?,?,?,?)"
	queryUserUpdate          = "UPDATE users SET username = ?, real_name = ?, role = ?, updated_at = ?, updated_by = ? WHERE id = ?"
	queryUpdateLastLogin     = "UPDATE users SET last_login = ? WHERE id = ?"
	queryUsersSoftDelete     = "UPDATE users SET deleted_at = ? WHERE id = ?"
	queryUsersUpdatePassword = "UPDATE users SET password_hash = ? WHERE id = ?"
)

func Create(user User) error {
	_, err := db.Database.Exec(queryUsersInsert, user.Username, user.RealName, user.Hash, user.Role, time.Now().Unix(), time.Now().Unix(), user.UpdatedBy)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}

func Update(id int, user User) error {
	_, err := db.Database.Exec(queryUserUpdate, user.Username, user.RealName, user.Role, time.Now().Unix(), user.UpdatedBy, id)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}

func RecordLogin(user int) error {
	_, err := db.Database.Exec(queryUpdateLastLogin, time.Now().Unix(), user)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}

func List(deleted bool) ([]User, error) {
	q := queryUsers
	if deleted {
		q = queryUsersWithDeleted
	}

	rows, err := db.Database.Query(q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		var cat int64
		var uat int64
		var dat *int64
		var last *int64

		if err := rows.Scan(&user.ID, &user.Username, &user.RealName, &user.Hash, &user.Role, &last, &cat, &uat, &user.UpdatedBy, &dat); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				log.Print("no more rows")
				continue
			}
		}

		user.CreatedAt = time.Unix(cat, 0)
		user.UpdatedAt = time.Unix(uat, 0)
		if last != nil {
			lastLog := time.Unix(*last, 0)
			user.LastLogin = &lastLog
		}
		if dat != nil {
			deletedAt := time.Unix(*dat, 0)
			user.DeletedAt = &deletedAt
		}

		users = append(users, user)
	}

	return users, nil
}

func GetByUsername(username string) (User, error) {
	row := db.Database.QueryRow(queryUserByUsername, username)

	var user User
	var cat int64
	var uat int64
	var dat *int64
	var last *int64

	if err := row.Scan(&user.ID, &user.Username, &user.RealName, &user.Hash, &user.Role, &last, &cat, &uat, &user.UpdatedBy, &dat); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, repository.ErrNotExists
		}

		return User{}, err
	}

	user.CreatedAt = time.Unix(cat, 0)
	user.UpdatedAt = time.Unix(uat, 0)
	if last != nil {
		lastLog := time.Unix(*last, 0)
		user.LastLogin = &lastLog
	}

	return user, nil
}

func GetByID(id int) (User, error) {
	row := db.Database.QueryRow("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL", id)

	var user User
	var cat string
	var uat string
	var dat *string
	if err := row.Scan(&user.ID, &user.Username, &user.Hash, &user.Role, &cat, &uat, &user.UpdatedBy, &dat); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, repository.ErrNotExists
		}

		return User{}, err
	}

	createdAt, _ := time.Parse(time.DateTime, cat)
	user.CreatedAt = createdAt
	updatedAt, _ := time.Parse(time.DateTime, cat)
	user.UpdatedAt = updatedAt

	return user, nil
}

func Delete(user int) error {
	_, err := db.Database.Exec(queryUsersSoftDelete, time.Now().Unix(), user)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}

func Reactivate(user int) error {
	_, err := db.Database.Exec(queryUsersSoftDelete, nil, user)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}

func UpdateUserPassword(user int, hash string) error {
	_, err := db.Database.Exec(queryUsersUpdatePassword, hash, user)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return fmt.Errorf("record exists: %s", err)
			}
		}
		return err
	}

	return nil
}
