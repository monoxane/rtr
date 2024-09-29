package migrations

import "embed"

//go:embed *.sql
var EmbeddedFS embed.FS
