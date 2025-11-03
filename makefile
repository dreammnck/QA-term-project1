# Variables
DOCKER_COMPOSE = docker-compose
APP_NAME = my-app

# Default target
.PHONY: help
help:
	@echo "Makefile for $(APP_NAME)"
	@echo ""
	@echo "Available commands:"
	@echo "  make build       Build Docker images"
	@echo "  make up          Start all containers"
	@echo "  make down        Stop containers (keeps volumes)"
	@echo "  make clean       Stop containers and remove volumes"
	@echo "  make logs        View logs from all services"
	@echo "  make restart     Restart all services"
	@echo "  make ps          Show container status"
	@echo "  make prune       Remove all unused Docker data"

# Build images
.PHONY: build
build:
	$(DOCKER_COMPOSE) build

# Start containers
.PHONY: up
up:
	$(DOCKER_COMPOSE) up -d

# Stop containers (keep volumes)
.PHONY: down
down:
	$(DOCKER_COMPOSE) down

# Stop and remove volumes (database + cache)
.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v

# Restart services
.PHONY: restart
restart:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up -d

# View logs
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

# Show container status
.PHONY: ps
ps:
	$(DOCKER_COMPOSE) ps

# Prune all unused Docker resources
.PHONY: prune
prune:
	docker system prune -a --volumes -f
