variable "tenantname" {}
variable "pb_news_de" {}
variable "pb_news_en" {}
variable "pb_home" {}
variable "rtnews_list_guid" {}
variable "pb_news_en_site_page_guid" {}
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
    AppID = "PuntoBello"
    Stage = "dev"
  }
}

variable "app_sitepublishing_cors_origin" {
  type    = string
  default = "https://fhu365.sharepoint.com"
}