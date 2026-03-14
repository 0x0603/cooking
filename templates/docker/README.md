# Docker Template

Multi-stage Dockerfile and Docker Compose setup with PostgreSQL.

## Usage

```bash
# Copy into your project
cp templates/docker/* projects/<category>/<your-project>/

# Build and run
docker compose up --build

# Run in background
docker compose up -d

# Stop
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Files

- `Dockerfile` — Multi-stage build (builder + production)
- `docker-compose.yml` — App + PostgreSQL with health checks
- `.dockerignore` — Files excluded from Docker build context

## Customization

- Change the base image in `Dockerfile` to match your stack
- Add services (Redis, RabbitMQ, etc.) to `docker-compose.yml`
- Update environment variables in `.env`
