# Input variables for the module
variable "tenantname" {
}

variable "hubsite" {
}

variable "rtnews" {
}

variable "publishinglog" {
}

variable newsde {
}

variable newsdelist {
}

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