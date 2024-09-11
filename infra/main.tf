data "azurerm_subscription" "sub" {
}

resource "azurerm_resource_group" "rg" {
  name     = "puntobello-realtimenews-${var.environment_name}-rg"
  location = var.location
  tags     = var.tags
}

# resource "azurerm_service_plan" "plan_linux" {
#   name                = "puntobello-realtimenews-${var.environment_name}-splan"
#   location            = azurerm_resource_group.rg.location
#   resource_group_name = azurerm_resource_group.rg.name  
#   os_type             = "Linux"
#   #sku_name            = "P1v2"
#   sku_name            = "S1"
#   tags                = var.tags
# }

# resource "azurerm_linux_web_app" "app" {
#   name                = "puntobello-realtimenews-${var.environment_name}-as"
#   location            = azurerm_resource_group.rg.location
#   resource_group_name = azurerm_resource_group.rg.name
#   service_plan_id = azurerm_service_plan.plan_linux.id

#   site_config {
#     http2_enabled            = true
#     minimum_tls_version      = "1.2"
#     ftps_state               = "FtpsOnly"
#     always_on                = true
#     cors {
#       allowed_origins = [var.app_sitepublishing_cors_origin]
#     }
#     application_stack {
#       node_version   = "20-lts"
#     }
#     app_command_line = "cd site\\wwwroot && npm install && npm run start"
#   }

#   app_settings = {
#     "WEBSITE_NODE_DEFAULT_VERSION" = "~20"
#     "SERVICEBUS_CONNECTION_STRING" = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
#     "SERVICEBUS_QUEUE_NAME" = azurerm_servicebus_queue.sb_pagepublishing_queue.name
#     "CORS_ORIGIN" = var.app_sitepublishing_cors_origin
#   }

#   logs {
#     detailed_error_messages = true
#     failed_request_tracing  = true
#     http_logs {
#       file_system {
#         retention_in_days = 1
#         retention_in_mb   = 35
#       }
#     }
#   }
# }

resource "azurerm_servicebus_namespace" "sb_pagepublishing" {
  name                = "puntobello-realtimenews-${var.environment_name}-bus"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard"
  tags                = var.tags
  minimum_tls_version = "1.2"
}

resource "azurerm_servicebus_queue" "sb_pagepublishing_queue" {
  name                  = "news"
  namespace_id          = azurerm_servicebus_namespace.sb_pagepublishing.id
  lock_duration         = "PT30S"
}

data "azurerm_managed_api" "managed_api_sb" {
  name     = "servicebus"
  location = azurerm_resource_group.rg.location
}

data "azurerm_managed_api" "managed_api_spo" {
  name     = "sharepointonline"
  location = azurerm_resource_group.rg.location
}

resource "azurerm_api_connection" "apic_sb" {
  name                = "puntobello-realtimenews-${var.environment_name}-bus-apic"
  resource_group_name = azurerm_resource_group.rg.name
  managed_api_id      = data.azurerm_managed_api.managed_api_sb.id
  tags                = var.tags
  parameter_values = {
    connectionString = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
  }
}

resource "azurerm_api_connection" "apic_spo" {
  name                = "puntobello-realtimenews-${var.environment_name}-spo-apic"
  resource_group_name = azurerm_resource_group.rg.name
  managed_api_id      = data.azurerm_managed_api.managed_api_spo.id
  tags                = var.tags
}