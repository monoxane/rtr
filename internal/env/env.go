package env

import (
	"fmt"

	"github.com/spf13/viper"
)

var (
	LogLevel string = "INFO"

	JWTSecret   string
	JWTLifespan int

	AdminUsername string
	AdminPassword string
)

func LoadFromEnvironment() error {
	viper.SetConfigName(".env") // name of config file, not required when using real ENV vars
	viper.SetConfigType("env")  // type
	viper.AddConfigPath(".")    // in current directory
	viper.AutomaticEnv()        // read real ENV vars if applicable

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			return fmt.Errorf("env does not exist: %s", err)
		} else {
			return fmt.Errorf("failed to read env: %s", err)
		}
	}

	if viper.IsSet("LOG_LEVEL") {
		LogLevel = viper.GetString("LOG_LEVEL")
	}

	if viper.IsSet("JWT_SECRET") {
		JWTSecret = viper.GetString("JWT_SECRET")
	} else {
		return fmt.Errorf("JWT_SECRET is missing")
	}

	if viper.IsSet("JWT_LIFESPAN") {
		JWTLifespan = viper.GetInt("JWT_LIFESPAN")
	} else {
		return fmt.Errorf("JWT_LIFESPAN is missing")
	}

	if viper.IsSet("ADMIN_USERNAME") {
		AdminUsername = viper.GetString("ADMIN_USERNAME")
	} else {
		return fmt.Errorf("ADMIN_USERNAME is missing")
	}

	if viper.IsSet("ADMIN_PASSWORD") {
		AdminPassword = viper.GetString("ADMIN_PASSWORD")
	} else {
		return fmt.Errorf("ADMIN_PASSWORD is missing")
	}

	return nil
}
