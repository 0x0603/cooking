# Deployment Guide

Guide for deploying projects in this repository.

## Deployment Options

### 1. Frontend Projects

#### Vercel (Recommended for Next.js, React)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### GitHub Pages

```bash
# Build project
npm run build

# Deploy to gh-pages branch
npm run deploy
```

### 2. Backend Projects

#### Railway

1. Connect GitHub repository
2. Select project
3. Set environment variables
4. Deploy automatically

#### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

#### Heroku

```bash
# Install Heroku CLI
heroku login
heroku create my-app
git push heroku main
```

### 3. Docker Deployment

#### Build and Push Image

```bash
# Build
docker build -t my-app:latest .

# Tag
docker tag my-app:latest registry.example.com/my-app:latest

# Push
docker push registry.example.com/my-app:latest
```

#### Docker Compose

```bash
docker-compose up -d
```

### 4. Kubernetes Deployment

See manifests in `infrastructure/kubernetes/`:

```bash
kubectl apply -f infrastructure/kubernetes/my-app/
```

## Environment Variables

### Development

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
# Edit .env with appropriate values
```

### Production

Set environment variables on the platform:

- Vercel: Project Settings > Environment Variables
- Railway: Variables tab
- Render: Environment section

## CI/CD

### GitHub Actions

Sample workflow in `.github/workflows/ci.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: |
          # Deployment commands
```

## Database Migrations

### Prisma

```bash
# Generate migration
npx prisma migrate dev --name migration-name

# Apply in production
npx prisma migrate deploy
```

### Alembic (Python)

```bash
# Create migration
alembic revision --autogenerate -m "migration message"

# Apply
alembic upgrade head
```

## Monitoring

### Application Monitoring

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: APM

### Infrastructure Monitoring

- **Datadog**: Infrastructure monitoring
- **Grafana**: Metrics visualization
- **Prometheus**: Metrics collection

## Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use staging environment**: Test before deploying to production
3. **Automate deployments**: Use CI/CD pipelines
4. **Monitor applications**: Set up logging and monitoring
5. **Backup databases**: Regular backups
6. **Version control**: Tag releases
7. **Rollback plan**: Have a rollback plan ready

## Troubleshooting

### Common Issues

**Issue**: Build fails
**Solution**: Check build logs, verify dependencies

**Issue**: Environment variables not working
**Solution**: Verify variable names and values

**Issue**: Database connection fails
**Solution**: Check connection string and network access

## Resources

- [Vercel Deployment](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
