PRAGMA foreign_keys = OFF;
CREATE TABLE `routers_tmp`
(
  "id"             INTEGER NOT NULL UNIQUE,
  "label"          TEXT    NOT NULL,
  "provider_id"    INTEGER NOT NULL,
  "model_id"          TEXT    NULL    ,
  "ip_address"     TEXT    NOT NULL UNIQUE,
  "router_address" INTEGER NULL    , -- used in NK
  "level"          INTEGER NOT NULL,
  "is_connected"   INTEGER NOT NULL DEFAULT 0,
  "created_at"     TEXT    NULL    ,
  "updated_at"     TEXT    NULL    ,
  "updated_by"     TEXT    NULL    ,
  "deleted_at"     TEXT    NULL    ,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("provider_id") REFERENCES "router_providers" ("id")
  FOREIGN KEY ("model_id") REFERENCES "router_models" ("id")
);
INSERT INTO `routers_tmp` (`id`, `label`, `provider_id`, `model_id`, `ip_address`, `router_address`, `level`, `created_at`, `updated_at`, `updated_by`, `deleted_at`) SELECT `id`, `label`, `provider_id`, `model_id`, `ip_address`, `router_address`, `level`, `created_at`, `updated_at`, `updated_by`, `deleted_at` FROM `routers`;
DROP TABLE `routers`;
ALTER TABLE `routers_tmp` RENAME TO `routers`;
PRAGMA foreign_keys = ON;