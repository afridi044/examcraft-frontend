# ExamCraft Frontend - Docker Setup

Simple guide to run ExamCraft with Docker.

## Prerequisites

### Install Docker & Docker Compose

#### Ubuntu/Debian
```bash
# Update package index
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (restart terminal after this)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```



```

### API Credentials Needed
- Supabase project credentials
- OpenRouter API key

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy template for development
cp env.template .env.docker

# Copy template for production  
cp env.template .env.production
```

Edit both files with your actual values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`

### 2. Development

```bash
# Build and run development environment
docker-compose up --build

# Or use npm scripts
npm run docker:build:dev
npm run docker:deploy:dev
```

Access at: http://localhost:3000

### 3. Production

```bash
# Build production image
./scripts/docker-build.sh -e prod

# Deploy production
./scripts/docker-deploy.sh -e prod deploy
```

## Environment Files

| File | Purpose | Used By |
|------|---------|---------|
| `.env.docker` | Development | `docker-compose.yml` |
| `.env.production` | Production | `docker-compose.prod.yml` |

## Common Commands

```bash
# Development
docker-compose up                    # Start dev environment
docker-compose down                  # Stop dev environment
docker-compose logs -f               # View logs

# Production  
./scripts/docker-deploy.sh deploy    # Deploy production
./scripts/docker-deploy.sh stop      # Stop production
./scripts/docker-deploy.sh logs      # View production logs
./scripts/docker-deploy.sh status    # Check status

# Build & Push to Registry
./scripts/docker-build.sh -p         # Build and push to registry
./scripts/docker-build.sh -t v1.0.0 -p  # Build specific version
```

## Registry Deployment

Your images are pushed to: `sajidnoor5051/sajid_private_repo/examcraft-frontend`

```bash
# Login to Docker registry
docker login

# Build and push
./scripts/docker-build.sh -t v1.0.0 -p

# Deploy from registry
./scripts/docker-deploy.sh -t v1.0.0 deploy
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs examcraft-frontend

# Check environment file exists
ls -la .env.docker
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Environment variables not loading
```bash
# Verify environment file
cat .env.docker

# Check variables in container
docker-compose exec examcraft-frontend env | grep SUPABASE
```

## File Structure

```
examcraft-frontend/
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Development environment
├── docker-compose.prod.yml # Production environment
├── .env.docker            # Development variables
├── .env.production         # Production variables
├── env.template            # Template file
├── scripts/
│   ├── docker-build.sh     # Build script
│   └── docker-deploy.sh    # Deploy script
└── healthcheck.js          # Health check script
```

That's it! Your ExamCraft application is now fully dockerized and ready to run. 🚀 



## Registry Deployment

Latest image: `sajidnoor5051/sajid_private_repo:examcraft-v2`

```bash
# Pull the latest image
docker pull sajidnoor5051/sajid_private_repo:examcraft-v2

# Run the container
docker run -p 3000:3000 sajidnoor5051/sajid_private_repo:examcraft-v2