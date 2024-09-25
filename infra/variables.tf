variable "TENANT_NAME" {}
variable "RTNEWS_DE" {}
variable "RTNEWS_DE_SITEPAGES_LIST_GUID" {}
variable "RTNEWS_EN_SITEPAGES_LIST_GUID" {}
variable "RTNEWS_EN" {}
variable "RTNEWS_HOME" {}
variable "RTNEWS_LIST_GUID" {}
variable "recurrence_frequency" {}
variable "recurrence_interval" {}

variable "location" {
  description = "The supported Azure location where the resource deployed"
  type        = string
}

variable "environment_name" {
  description = "The name of the azd environment to be deployed"
  type        = string
}

variable "tags" {
  type = map(string)
  default = {
    AppID   = "PuntoBello"
    Stage   = "dev"
  }
}

locals {
  app_sitepublishing_cors_origin = "https://${var.TENANT_NAME}.sharepoint.com"
}