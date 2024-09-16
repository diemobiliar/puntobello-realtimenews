variable "tenant_name" {}
variable "rtnews_de" {}
variable "rtnews_de_sitepages_list_guid" {}
variable "rtnews_en_sitepages_list_guid" {}
variable "rtnews_en" {}
variable "rtnews_home" {}
variable "rtnews_list_guid" {}
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
  app_sitepublishing_cors_origin = "https://${var.tenant_name}.sharepoint.com"
}