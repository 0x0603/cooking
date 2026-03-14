package main

import (
	"log"

	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/handlers"
	"{{PROJECT_NAME}}/internal/middleware"
	"{{PROJECT_NAME}}/internal/models"
	"{{PROJECT_NAME}}/internal/repositories"
	"{{PROJECT_NAME}}/internal/services"
	"{{PROJECT_NAME}}/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize logger
	logger, err := utils.InitLogger(cfg.Environment)
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	db, err := utils.InitDB(cfg.Database)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&models.User{}); err != nil {
		logger.Fatal("Failed to run auto-migration", zap.Error(err))
	}

	// Wire dependencies (clean architecture: interface-based DI)
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	_ = userService // use in your handlers

	// Setup router
	router := gin.New()
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Recovery(logger))
	router.Use(middleware.CORS())

	// Routes
	router.GET("/health", handlers.HealthCheck)

	api := router.Group("/api/v1")
	{
		api.GET("/ping", handlers.Ping)
		// Add your routes here, e.g.:
		// api.POST("/users", userHandler.Create)
	}

	// Start server
	addr := ":" + cfg.Server.Port
	logger.Info("Starting server", zap.String("address", addr))
	if err := router.Run(addr); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}
