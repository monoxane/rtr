INSERT INTO `router_providers` 
VALUES (0, "Ross NK Series", "Connection requires NK-IPS or NK-NET Gateway");

INSERT INTO `router_models` (`label`, `inputs`, `outputs`, `provider_id`)
VALUES ("NK-3G72", 72, 72, 0);

INSERT INTO `router_models` (`label`, `inputs`, `outputs`, `provider_id`)
VALUES ("NK-3G64", 64, 64, 0);

INSERT INTO `router_models` (`label`, `inputs`, `outputs`, `provider_id`)
VALUES ("NK-3G34", 34, 34, 0);

INSERT INTO `router_models` (`label`, `inputs`, `outputs`, `provider_id`)
VALUES ("NK-3G16", 16, 16, 0);

INSERT INTO `router_models` (`label`, `inputs`, `outputs`, `provider_id`)
VALUES ("NK-3G164", 16, 4, 0);