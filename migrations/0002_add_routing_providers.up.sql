CREATE TABLE "router_providers"
(
  "id"          INTEGER NOT NULL UNIQUE,
  "label"       TEXT    NOT NULL UNIQUE,
  "helper_text" TEXT,
  PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE TABLE "router_models"
(
  "id"          INTEGER NOT NULL UNIQUE,
  "label"       TEXT    NOT NULL UNIQUE,
  "provider_id" INTEGER NOT NULL,
  "inputs"      INTEGER NOT NULL,
  "outputs"     INTEGER NOT NULL,
  "helper_text" TEXT,
  PRIMARY KEY ("id" AUTOINCREMENT),
  FOREIGN KEY ("provider_id") REFERENCES "router_providers" ("id")
);