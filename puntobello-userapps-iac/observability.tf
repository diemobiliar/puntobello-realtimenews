locals {
  # log analytics workspace name
  name_law_dev     = var.redn_stage == "dev" ? "redn-base-dev-law" : ""
  name_law_test    = var.redn_stage == "test" ? "redn-base-test-law" : ""
  name_law_preprod = var.redn_stage == "preprod" ? "cos-law-iac-preprod-law" : ""
  name_law_prod    = var.redn_stage == "prod" ? "cos-law-iac-prod-law" : ""
  name_law         = coalesce(local.name_law_dev, local.name_law_test, local.name_law_preprod, local.name_law_prod)

  # log analytics resource group name  
  rg_law_dev     = var.redn_stage == "dev" ? "redn-base-iac-dev-rg" : ""
  rg_law_test    = var.redn_stage == "test" ? "redn-base-iac-test-rg" : ""
  rg_law_preprod = var.redn_stage == "preprod" ? "cos-law-iac-preprod-rg" : ""
  rg_law_prod    = var.redn_stage == "prod" ? "cos-law-iac-prod-rg" : ""
  rg_law         = coalesce(local.rg_law_dev, local.rg_law_test, local.rg_law_preprod, local.rg_law_prod)
}

provider "azurerm" {
  subscription_id            = local.cos_sub[var.redn_stage]
  alias                      = "cos"
  skip_provider_registration = true
  features {}
}


data "azurerm_log_analytics_workspace" "cos_law" {
  provider            = azurerm.cos
  name                = local.name_law
  resource_group_name = local.rg_law
}