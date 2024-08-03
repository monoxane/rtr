package db_test

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/monoxane/rtr/internal/connector/db"
)

const testDBPath = "rtr_test.db"

func TestOpen(t *testing.T) {
	os.Remove(testDBPath)

	err := db.Open(testDBPath)
	assert.Nil(t, err, "unable to open test db")

	os.Remove(testDBPath)
}

func TestMigrate(t *testing.T) {
	os.Remove(testDBPath)

	err := db.Open(testDBPath)
	assert.Nil(t, err, "unable to open test db")

	err = db.MigrateSchema("schema.sql")
	assert.Nil(t, err, "unable to migrate db schema")

	os.Remove(testDBPath)
}
