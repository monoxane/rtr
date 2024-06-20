CREATE TABLE IF NOT EXISTS "destinations"
(
  "id"               INTEGER NOT NULL UNIQUE,
  "router_id"        INTEGER NOT NULL,
  "index"            INTEGER NOT NULL,
  "label"            TEXT    NOT NULL,
  "description"      TEXT    NULL    ,
  "umd_label"        TEXT    NULL    ,
  -- boolean
  "tally_green"      INTEGER NOT NULL DEFAULT 0,
  -- boolean
  "tally_red"        INTEGER NOT NULL DEFAULT 0,
  -- boolean
  "tally_yellow"     INTEGER NOT NULL DEFAULT 0,
  "tally_address"    INTEGER NULL    ,
  "routed_source_id" INTEGER NULL    ,
  "created_at"       TEXT    NULL    ,
  "updated_at"       TEXT    NULL    ,
  "updated_by"       TEXT    NULL    ,
  "deleted_at"       TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("routed_source_id") REFERENCES "sources" ("id"),
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id")
);

CREATE TABLE IF NOT EXISTS "routers"
(
  "id"             INTEGER NOT NULL UNIQUE,
  "label"          TEXT    NOT NULL,
  "provider"       INTEGER NOT NULL,
  "ip_address"     TEXT    NOT NULL UNIQUE,
  -- used in NK
  "router_address" INTEGER NULL    ,
  "level"          INTEGER NOT NULL,
  "model"          TEXT    NULL    ,
  "created_at"     TEXT    NULL    ,
  "updated_at"     TEXT    NULL    ,
  "updated_by"     TEXT    NULL    ,
  "deleted_at"     TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "salvo_destinations"
(
  "id"              INTEGER NOT NULL UNIQUE,
  "version_id"      INTEGER NOT NULL,
  "destination_id"  INTEGER NOT NULL,
  "saved_source_id" INTEGER NOT NULL,
  "created_at"      TEXT    NULL    ,
  "updated_at"      TEXT    NULL    ,
  "updated_by"      TEXT    NULL    ,
  "deleted_at"      TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("version_id") REFERENCES "salvo_versions" ("id"),
  FOREIGN KEY ("destination_id") REFERENCES "destinations" ("id"),
  FOREIGN KEY ("saved_source_id") REFERENCES "sources" ("id")
);

CREATE TABLE IF NOT EXISTS "salvo_versions"
(
  "id"          INTEGER NOT NULL UNIQUE,
  "salvo_id"    INTEGER NOT NULL,
  "label"       TEXT    NOT NULL,
  "description" TEXT    NULL    ,
  "created_at"  TEXT    NULL    ,
  "updated_at"  TEXT    NULL    ,
  "updated_by"  TEXT    NULL    ,
  "deleted_at"  TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("salvo_id") REFERENCES "salvos" ("id")
);

CREATE TABLE IF NOT EXISTS "salvos"
(
  "id"          INTEGER NOT NULL UNIQUE,
  "label"       TEXT    NOT NULL,
  "description" TEXT    NULL    ,
  "created_at"  TEXT    NULL    ,
  "updated_at"  TEXT    NULL    ,
  "updated_by"  TEXT    NULL    ,
  "deleted_at"  TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "sources"
(
  "id"            INTEGER NOT NULL UNIQUE,
  "router_id"     INTEGER NOT NULL,
  "index"         INTEGER NOT NULL,
  "label"         TEXT    NOT NULL,
  "description"   TEXT    NULL    ,
  "umd_label"     TEXT    NULL    ,
  -- boolean
  "tally_green"   INTEGER NOT NULL DEFAULT 0,
  -- boolean
  "tally_red"     INTEGER NOT NULL DEFAULT 0,
  -- boolean
  "tally_yellow"  INTEGER NOT NULL DEFAULT 0,
  "tally_address" INTEGER NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id")
);

CREATE TABLE IF NOT EXISTS "streams"
(
  "id"             INTEGER NOT NULL UNIQUE,
  "label"          TEXT    NOT NULL,
  "slug"           TEXT    NOT NULL UNIQUE,
  "destination_id" INTEGER NULL    ,
  -- boolean
  "is_rouTABLE IF NOT EXISTS"    INTEGER NOT NULL DEFAULT 0,
  "created_at"     TEXT    NULL    ,
  "updated_at"     TEXT    NULL    ,
  "updated_by"     TEXT    NULL    ,
  "deleted_at"     TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("destination_id") REFERENCES "destinations" ("id")
);

CREATE TABLE IF NOT EXISTS "tally_connections"
(
  "id"                    INTEGER NOT NULL UNIQUE,
  -- boolean
  "enable_inbound"        INTEGER NOT NULL DEFAULT 0,
  -- boolean
  "enable_outbound"       BOOL    NOT NULL DEFAULT 0,
  "remote_ip"             TEXT    NULL     UNIQUE,
  "remote_port"           INTEGER NULL    ,
  "local_port"            INTEGER NULL     UNIQUE,
  "protocol"              TEXT    NOT NULL DEFAULT tsl1_0,
  "transport"             TEXT    NOT NULL DEFAULT udp,
  "last_inbound_message"  TEXT    NULL    ,
  "last_outbound_message" TEXT    NULL    ,
  "created_at"            TEXT    NULL    ,
  "updated_at"            TEXT    NULL    ,
  "updated_by"            TEXT    NULL    ,
  "deleted_at"            TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "tally_states"
(
  "id"                  INTEGER NOT NULL UNIQUE,
  "tally_connection_id" INTEGER NOT NULL,
  "address"             INTEGER NOT NULL,
  -- boolean
  "tally_1"             INTEGER NOT NULL,
  -- boolean
  "tally_2"             INTEGER NOT NULL,
  -- boolean
  "tally_3"             INTEGER NOT NULL,
  -- boolean
  "tally_4"             INTEGER NOT NULL,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("tally_connection_id") REFERENCES "tally_connections" ("id")
);

CREATE TABLE IF NOT EXISTS "user_router_bindings"
(
  "id"         INTEGER NOT NULL UNIQUE,
  "user_id"    INTEGER NOT NULL,
  "router_id"  INTEGER NOT NULL,
  "created_at" TEXT    NULL    ,
  "updated_at" TEXT    NULL    ,
  "updated_by" TEXT    NULL    ,
  "deleted_at" TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id")
);

CREATE TABLE IF NOT EXISTS "users"
(
  "id"            INTEGER NOT NULL UNIQUE,
  "username"      TEXT    NOT NULL UNIQUE,
  "password_hash" TEXT    NOT NULL,
  -- boolean
  "is_admin"      INTEGER NOT NULL DEFAULT 0,
  "created_at"    TEXT    NULL    ,
  "updated_at"    TEXT    NULL    ,
  "updated_by"    TEXT    NULL    ,
  "deleted_at"    TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT)
);