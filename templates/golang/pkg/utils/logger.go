package utils

import "go.uber.org/zap"

// InitLogger creates a zap logger configured for the given environment.
func InitLogger(env string) (*zap.Logger, error) {
	if env == "production" {
		return zap.NewProduction()
	}
	return zap.NewDevelopment()
}
