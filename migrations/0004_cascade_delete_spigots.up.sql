PRAGMA foreign_keys = OFF;

CREATE TABLE `sources_tmp`
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
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id") ON DELETE CASCADE
);
INSERT INTO `sources_tmp` (`id`, `router_id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`) SELECT `id`, `router_id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address` FROM `sources`;
DROP TABLE `sources`;
ALTER TABLE `sources_tmp` RENAME TO `sources`;

CREATE TABLE `destinations_tmp`
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
  FOREIGN KEY ("router_id") REFERENCES "routers" ("id") ON DELETE CASCADE
);
INSERT INTO `destinations_tmp` (`id`, `router_id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`, `routed_source_id`) SELECT `id`, `router_id`, `index`, `label`, `description`, `umd_label`, `tally_green`, `tally_red`, `tally_yellow`, `tally_address`, `routed_source_id` FROM `destinations`;
DROP TABLE `destinations`;
ALTER TABLE `destinations_tmp` RENAME TO `destinations`;

PRAGMA foreign_keys = ON;