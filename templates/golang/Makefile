.PHONY: help run build test lint clean migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

run: ## Run the application
	go run cmd/server/main.go

build: ## Build the application
	go build -o bin/{{PROJECT_NAME}} cmd/server/main.go

test: ## Run tests
	go test -v ./...

test-coverage: ## Run tests with coverage
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

lint: ## Run linter
	golangci-lint run

lint-fix: ## Run linter and fix issues
	golangci-lint run --fix

clean: ## Clean build artifacts
	rm -rf bin/
	rm -f coverage.out coverage.html

tidy: ## Tidy go modules
	go mod tidy

migrate-up: ## Run database migrations up
	@echo "Add your migration command here"

migrate-down: ## Run database migrations down
	@echo "Add your migration command here"
