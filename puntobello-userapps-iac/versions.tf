terraform {
  # Exact version is defined by stack:
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      # Version managed by Renovate:
      version = "3.97.1"
    }
  }
}