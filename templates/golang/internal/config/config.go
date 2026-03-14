package config

import (
	"fmt"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Server      ServerConfig
	Database    DatabaseConfig
	JWT         JWTConfig
	Environment string
}

type ServerConfig struct {
	Port string
	Host string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	DSN      string
}

type JWTConfig struct {
	Secret     string
	Expiration int // in hours
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_HOST", "localhost")
	viper.SetDefault("ENVIRONMENT", "development")
	viper.SetDefault("JWT_EXPIRATION", 24)
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_SSLMODE", "disable")

	viper.AutomaticEnv()

	cfg := &Config{
		Server: ServerConfig{
			Port: viper.GetString("SERVER_PORT"),
			Host: viper.GetString("SERVER_HOST"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:   viper.GetString("DB_NAME"),
			SSLMode:  viper.GetString("DB_SSLMODE"),
		},
		JWT: JWTConfig{
			Secret:     viper.GetString("JWT_SECRET"),
			Expiration: viper.GetInt("JWT_EXPIRATION"),
		},
		Environment: viper.GetString("ENVIRONMENT"),
	}

	// Build PostgreSQL DSN
	cfg.Database.DSN = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host, cfg.Database.Port, cfg.Database.User,
		cfg.Database.Password, cfg.Database.DBName, cfg.Database.SSLMode,
	)

	return cfg, nil
}
