variable "TENANT_NAME" {}
variable "RTNEWS_LCIDS" {}
variable "RTNEWS_SITEPAGES_GUIDS" {}
variable "RTNEWS_SITES" {}
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
  app_sitepublishing_cors_origin  = "https://${var.TENANT_NAME}.sharepoint.com"
  rtnews_sites                    = split(",", var.RTNEWS_SITES)
  rtnews_lcids                    = split(",", var.RTNEWS_LCIDS)
  rtnews_sitespages_guids         = split(",", var.RTNEWS_SITEPAGES_GUIDS)
}