#!/bin/bash

# Script to create a new project from template
# Usage: ./create-project.sh <project-name> <template-type>

set -e

PROJECT_NAME=$1
TEMPLATE_TYPE=$2

if [ -z "$PROJECT_NAME" ] || [ -z "$TEMPLATE_TYPE" ]; then
    echo "Usage: ./create-project.sh <project-name> <template-type>"
    echo ""
    echo "Available templates:"
    echo "  Frontend:  nextjs, react"
    echo "  Backend:   golang, nodejs, python"
    echo "  Infra:     docker"
    exit 1
fi

# Determine project category based on template
case $TEMPLATE_TYPE in
    react|nextjs|vue)
        CATEGORY="frontend"
        ;;
    nodejs|nestjs|python|golang|go)
        CATEGORY="backend"
        ;;
    nextjs-fullstack|t3-stack)
        CATEGORY="fullstack"
        ;;
    react-native|expo)
        CATEGORY="mobile"
        ;;
    *)
        CATEGORY=""
        ;;
esac

TEMPLATE_DIR="templates/$TEMPLATE_TYPE"
PROJECT_DIR="projects/$CATEGORY/$PROJECT_NAME"

if [ ! -d "$TEMPLATE_DIR" ]; then
    echo "Error: Template '$TEMPLATE_TYPE' not found in templates/"
    exit 1
fi

if [ -d "$PROJECT_DIR" ]; then
    echo "Error: Project '$PROJECT_NAME' already exists at $PROJECT_DIR"
    exit 1
fi

# Create project directory
mkdir -p "$PROJECT_DIR"

# Copy template (including hidden files like .env.example, .gitignore, .eslintrc.json)
cp -r "$TEMPLATE_DIR"/. "$PROJECT_DIR/"

# Replace {{PROJECT_NAME}} placeholder in all relevant files
SED_FILES=(-name "*.go" -o -name "*.mod" -o -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" -o -name "*.toml" -o -name "*.html" -o -name "Makefile" -o -name ".env.example")

if [[ "$OSTYPE" == "darwin"* ]]; then
    find "$PROJECT_DIR" -type f \( "${SED_FILES[@]}" \) -exec sed -i '' "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" {} +
else
    find "$PROJECT_DIR" -type f \( "${SED_FILES[@]}" \) -exec sed -i "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" {} +
fi

echo "Project '$PROJECT_NAME' created successfully!"
echo "Location: $PROJECT_DIR"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_DIR"
if [ -f "$PROJECT_DIR/go.mod" ]; then
    echo "  cp .env.example .env"
    echo "  # Start PostgreSQL, then:"
    echo "  go mod tidy"
    echo "  make run"
elif [ -f "$PROJECT_DIR/package.json" ]; then
    echo "  npm install"
    echo "  npm run dev"
elif [ -f "$PROJECT_DIR/requirements.txt" ]; then
    echo "  python -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    echo "  pip install -r requirements-dev.txt"
    echo "  uvicorn app.main:app --reload"
fi
