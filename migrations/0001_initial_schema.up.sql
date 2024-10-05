CREATE TABLE "routers"
(
  "id"             INTEGER NOT NULL UNIQUE,
  "label"          TEXT    NOT NULL,
  "provider_id"    INTEGER NOT NULL,
  "model_id"          TEXT    NULL    ,
  "ip_address"     TEXT    NOT NULL UNIQUE,
  -- used in NK
  "router_address" INTEGER NULL    ,
  "level"          INTEGER NOT NULL,
  "created_at"     TEXT    NULL    ,
  "updated_at"     TEXT    NULL    ,
  "updated_by"     TEXT    NULL    ,
  "deleted_at"     TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("provider_id") REFERENCES "router_providers" ("id")
  FOREIGN KEY ("model_id") REFERENCES "router_models" ("id")
);

CREATE TABLE "salvo_destinations"
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

CREATE TABLE "salvo_versions"
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

CREATE TABLE "salvos"
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

CREATE TABLE "sources"
(
  "id"            INTEGER NOT NULL UNIQUE,
  "router_id"     INTEGER NOT NULL,
  "index"         INTEGER NOT NULL,
  "label"         TEXT    NOT NULL,
  "description"   TEXT    NULL    ,
  "umd_label"     TEXT    NULL    ,
  "tally_green"   INTEGER NOT NULL DEFAULT 0,
  "tally_red"     INTEGER NOT NULL DEFAULT 0,
  "tally_yellow"  INTEGER NOT NULL DEFAULT 0,
  "tally_address" INTEGER NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id")
);

CREATE TABLE "destinations"
(
  "id"               INTEGER NOT NULL UNIQUE,
  "router_id"        INTEGER NOT NULL,
  "index"            INTEGER NOT NULL,
  "label"            TEXT    NOT NULL,
  "description"      TEXT    NULL    ,
  "umd_label"        TEXT    NULL    ,
  "tally_green"      INTEGER NOT NULL DEFAULT 0,
  "tally_red"        INTEGER NOT NULL DEFAULT 0,
  "tally_yellow"     INTEGER NOT NULL DEFAULT 0,
  "tally_address"    INTEGER NULL    ,
  "routed_source_id" INTEGER NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("routed_source_id") REFERENCES "sources" ("id"),
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id")
);

CREATE TABLE "streams"
(
  "id"             INTEGER NOT NULL UNIQUE,
  "label"          TEXT    NOT NULL,
  "slug"           TEXT    NOT NULL UNIQUE,
  "destination_id" INTEGER NULL    ,
  -- boolean
  "is_routable"    INTEGER NOT NULL DEFAULT 0,
  "is_active"    INTEGER NOT NULL DEFAULT 0,
  "created_at"     TEXT    NULL    ,
  "updated_at"     TEXT    NULL    ,
  "updated_by"     TEXT    NULL    ,
  "deleted_at"     TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("destination_id") REFERENCES "destinations" ("id")
);

CREATE TABLE "tally_connections"
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

CREATE TABLE "tally_states"
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

CREATE TABLE "user_router_bindings"
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

CREATE TABLE "users"
(
  "id"            INTEGER NOT NULL UNIQUE,
  "username"      TEXT    NOT NULL UNIQUE,
  "real_name"     TEXT    NULL    ,
  "password_hash" TEXT    NOT NULL,
  "role"          TEXT    NOT NULL DEFAULT OPERATOR,
  "last_login"    INTEGER    NULL    ,
  "created_at"    INTEGER    NULL    ,
  "updated_at"    INTEGER    NULL    ,
  "updated_by"    INTEGER    NULL    ,
  "deleted_at"    INTEGER    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

