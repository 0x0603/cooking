.PHONY: help setup clean install test lint format prepare

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Setup development environment
	@echo "Setting up development environment..."
	@chmod +x tools/scripts/*.sh
	@npm install
	@npx husky init 2>/dev/null || true
	@echo "npx --no -- commitlint --edit \$$1" > .husky/commit-msg
	@echo "npx lint-staged" > .husky/pre-commit
	@echo "Setup complete!"

install: ## Install dependencies for all projects
	@echo "Installing dependencies..."
	@npm install
	@find projects -name "package.json" -not -path "*/node_modules/*" -execdir npm install \;
	@find projects -name "requirements.txt" -not -path "*/node_modules/*" -execdir pip install -r requirements.txt \;

test: ## Run tests for all projects
	@echo "Running tests..."
	@find projects -name "package.json" -not -path "*/node_modules/*" -execdir npm test \;
	@find projects -name "pytest.ini" -not -path "*/node_modules/*" -execdir pytest \;

lint: ## Run linter for all projects
	@echo "Running linters..."
	@npm run lint 2>/dev/null || true
	@find projects -name "package.json" -not -path "*/node_modules/*" -execdir npm run lint \;

format: ## Format code for all projects
	@echo "Formatting code..."
	@npm run format
	@find projects -name "package.json" -not -path "*/node_modules/*" -execdir npm run format \;

format-check: ## Check code formatting without making changes
	@echo "Checking formatting..."
	@npm run format:check

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@find projects -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	@find projects -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find projects -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
	@find projects -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@find projects -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find projects -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find projects -type d -name "coverage" -exec rm -rf {} + 2>/dev/null || true
	@echo "Clean complete!"

new-project: ## Create a new project (usage: make new-project NAME=my-project TEMPLATE=react)
	@if [ -z "$(NAME)" ] || [ -z "$(TEMPLATE)" ]; then \
		echo "Usage: make new-project NAME=my-project TEMPLATE=react"; \
		exit 1; \
	fi
	@./tools/scripts/create-project.sh $(NAME) $(TEMPLATE)
