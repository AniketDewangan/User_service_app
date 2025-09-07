terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "npipe:////./pipe/docker_engine"  # Windows Docker
}

# -------------------------------
# Create a network for the application
# -------------------------------
resource "docker_network" "user_crud_network" {
  name = "user-crud-network"
}

# -------------------------------
# Backend service
# -------------------------------
resource "docker_image" "backend" {
  name = "user-service-backend:v1.1"
  build {
    context    = "../backend/users-service"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "backend" {
  name  = "user-service-backend"
  image = docker_image.backend.image_id

  ports {
    internal = 8080
    external = 8080
  }

  networks_advanced {
    name = docker_network.user_crud_network.name
  }

  depends_on = [docker_network.user_crud_network]
}

# -------------------------------
# Frontend service
# -------------------------------
resource "docker_image" "frontend" {
  name = "user-service-frontend:v1.1"
  build {
    context    = "../frontend"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "frontend" {
  name  = "user-service-frontend"
  image = docker_image.frontend.image_id

  ports {
    internal = 3000
    external = 3000
  }

  networks_advanced {
    name = docker_network.user_crud_network.name
  }

  depends_on = [docker_container.backend]
}

# -------------------------------
# MySQL container (optional)
# -------------------------------
resource "docker_image" "mysql" {
  name = "mysql:8.0"
}

resource "docker_container" "mysql" {
  name  = "mysql-db"
  image = docker_image.mysql.image_id

  env = [
    "MYSQL_ROOT_PASSWORD=root",
    "MYSQL_DATABASE=userdb",
    "MYSQL_USER=user",
    "MYSQL_PASSWORD=user123"
  ]

  ports {
    internal = 3306
    external = 3307
  }

  networks_advanced {
    name = docker_network.user_crud_network.name
  }

  depends_on = [docker_network.user_crud_network]
}
