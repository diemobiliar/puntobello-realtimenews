variable "redn_stage" {
  description = "REDN Stage short name"
  type        = string
}

variable "location" {
  description = "Azure location to deploy to."
  type        = string
  default     = "switzerlandnorth"
}

locals {
  stage_storage = {
    "sut" : "sut",
    "dev2" : "d2"
    "dev3" : "d3"
    "dev4" : "d4"
    "dev" : "dev"
    "test" : "tst"
    "preprod" : "pre"
    "prod" : "prd"
  }
  stage_short = {
    "sut" : "SUT",
    "dev2" : "D2"
    "dev3" : "D3"
    "dev4" : "D4"
    "dev" : "DEV"
    "test" : "TEST"
    "preprod" : "PREPROD"
    "prod" : "PROD"
  }
  app_sitepublishing_cors_origin = {
    "sut" : "https://sut.sharepoint.com"
    "dev2" : "https://nello365.sharepoint.com"
    "dev3" : "https://fhu365.sharepoint.com"
    "dev4" : "https://buergidev.sharepoint.com"
    "dev" : "https://mtranet.sharepoint.com"
    "test" : "https://umobiliar.sharepoint.com"
    "preprod" : "https://mobiliar.sharepoint.com"
    "prod" : "https://mobiliar.sharepoint.com"
  }
  cos_sub = {
    "dev" : "bf408115-a9b5-49bf-a497-24112465a319"     # redn-test-sub
    "test" : "4396f296-dd48-4d8d-b8b3-29fea6728566"    # redn-preprod-sub
    "preprod" : "b553c5fd-9a1e-4d65-8dc1-7a762bf6c68f" # cos-preprod-sub
    "prod" : "2837992e-1cda-438a-acfe-395637fab0b8"    # cos-prod-sub
  }
}