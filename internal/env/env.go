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
	viper.SetConfigName(".env") // Read a config file
	viper.SetConfigType("env")  // Of type env
	viper.AddConfigPath(".")    // From the current directory

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// log.Printf("env does not exist: %s, reading from env directly", err)
		} else {
			return fmt.Errorf("failed to read env: %s", err)
		}
	}

	viper.AutomaticEnv() // And also read the real env vars where possible

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
