data "azurerm_subscription" "sub" {
}

resource "azurerm_resource_group" "rg" {
  name     = "redn-azd-${var.environment_name}-rg"
  location = var.location
  tags     = var.tags
}

resource "azurerm_service_plan" "plan_linux" {
  name                = "redn-azd-${var.environment_name}-splan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name  
  os_type             = "Linux"
  sku_name            = "P1v2"
  tags                = var.tags
}

# resource "azurerm_monitor_diagnostic_setting" "plan_linux_diag" {
#   name                       = "redn-azd-${var.environment_name}-splan-diag"
#   target_resource_id         = azurerm_app_service_plan.plan_linux.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   metric {
#     category = "AllMetrics"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

# App Service
resource "azurerm_linux_web_app" "app" {
  name                = "redn-azd-${var.environment_name}-as"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id = azurerm_service_plan.plan_linux.id

  site_config {
    http2_enabled            = true
    minimum_tls_version      = "1.2"
    ftps_state               = "FtpsOnly"
    always_on                = true
    cors {
      allowed_origins = [var.app_sitepublishing_cors_origin]
    }
    application_stack {
      node_version   = "20-lts"
    }
    app_command_line = "cd site\\wwwroot && npm install && npm run start"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "~20"
    "SERVICEBUS_CONNECTION_STRING" = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
    "SERVICEBUS_QUEUE_NAME" = azurerm_servicebus_queue.sb_pagepublishing_queue.name
  }

  logs {
    detailed_error_messages = true
    failed_request_tracing  = true
    http_logs {
      file_system {
        retention_in_days = 1
        retention_in_mb   = 35
      }
    }
  }
}

# resource "azurerm_monitor_diagnostic_setting" "app_sitepublishing_diag" {
#   name                       = "redn-azd-${var.environment_name}-as-diag"
#   target_resource_id         = azurerm_app_service.app_sitepublishing.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "AppServiceHTTPLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   enabled_log {
#     category = "AppServiceConsoleLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   enabled_log {
#     category = "AppServiceAppLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   enabled_log {
#     category = "AppServicePlatformLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

# Service Bus
# namespace
resource "azurerm_servicebus_namespace" "sb_pagepublishing" {
  name                = "redn-azd-${var.environment_name}-bus"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Basic"
  tags                = var.tags
  minimum_tls_version = "1.2"
}

#namespace queue
resource "azurerm_servicebus_queue" "sb_pagepublishing_queue" {
  name                  = "news"
  namespace_id          = azurerm_servicebus_namespace.sb_pagepublishing.id
  lock_duration         = "PT30S"
  max_size_in_megabytes = 1024
}

# resource "azurerm_monitor_diagnostic_setting" "sb_pagepublishing_diag" {
#   name                       = "redn-azd-${var.environment_name}-bus-diag"
#   target_resource_id         = azurerm_servicebus_namespace.sb_pagepublishing.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "OperationalLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   enabled_log {
#     category = "RuntimeAuditLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   enabled_log {
#     category = "ApplicationMetricsLogs"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

# API Connection Service Bus
data "azurerm_managed_api" "managed_api_sb" {
  name     = "servicebus"
  location = azurerm_resource_group.rg.location
}

data "azurerm_managed_api" "managed_api_spo" {
  name     = "sharepointonline"
  location = azurerm_resource_group.rg.location
}

# data "azurerm_managed_api" "managed_api_conv" {
#   name     = "conversionservice"
#   location = azurerm_resource_group.rg.location
# }

# data "azurerm_managed_api" "managed_api_kv" {
#   name     = "keyvault"
#   location = azurerm_resource_group.rg.location
# }

# data "azurerm_managed_api" "managed_api_o365" {
#   name     = "office365"
#   location = azurerm_resource_group.rg.location
# }

# data "azurerm_managed_api" "managed_api_o365users" {
#   name     = "office365users"
#   location = azurerm_resource_group.rg.location
# }

resource "azurerm_api_connection" "apic_sb" {
  name                = "redn-azd-${var.environment_name}-bus-apic"
  resource_group_name = azurerm_resource_group.rg.name
  managed_api_id      = data.azurerm_managed_api.managed_api_sb.id
  tags                = var.tags
  parameter_values = {
    connectionString = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
  }
}

resource "azurerm_api_connection" "apic_spo" {
  name                = "redn-azd-${var.environment_name}-spo-apic"
  resource_group_name = azurerm_resource_group.rg.name
  managed_api_id      = data.azurerm_managed_api.managed_api_spo.id
  tags                = var.tags
}

# resource "azurerm_api_connection" "apic_conv" {
#   name                = "redn-azd-${var.environment_name}-conv-apic"
#   resource_group_name = azurerm_resource_group.rg.name
#   managed_api_id      = data.azurerm_managed_api.managed_api_conv.id
#   tags                = var.tags
# }

# data "azurerm_key_vault" "keyvault" {
#   name                = "mobi-redn-d3-kv"
#   resource_group_name = "redn-base-iac-d3-rg"
# }

# resource "azurerm_api_connection" "apic_kv" {
#   name                = "redn-azd-${var.environment_name}-kv-apic"
#   resource_group_name = azurerm_resource_group.rg.name
#   managed_api_id      = data.azurerm_managed_api.managed_api_kv.id
#   tags                = var.tags
# }

# resource "azurerm_api_connection" "apic_o365" {
#   name                = "redn-azd-${var.environment_name}-o365-apic"
#   resource_group_name = azurerm_resource_group.rg.name
#   managed_api_id      = data.azurerm_managed_api.managed_api_o365.id
#   tags                = var.tags
# }

# resource "azurerm_api_connection" "apic_o365users" {
#   name                = "redn-azd-${var.environment_name}-o365users-apic"
#   resource_group_name = azurerm_resource_group.rg.name
#   managed_api_id      = data.azurerm_managed_api.managed_api_o365users.id
#   tags                = var.tags
# }

# resource "azurerm_resource_group_template_deployment" "apic_sb_pagepublishing" {
#   name                = "redn-azd-${var.environment_name}-bus-apic"
#   resource_group_name = azurerm_resource_group.rg.name
#   deployment_mode     = "Incremental"
#   tags                = var.tags
#   parameters_content = jsonencode({
#     "apic_sb_pagepublishing_name" = {
#       value = "redn-azd-${var.environment_name}-bus-apic"
#     },
#     "location" = {
#       value = azurerm_resource_group.rg.location
#     },
#     "connection" = {
#       value = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
#     }
#   })
#   template_content = <<TEMPLATE
#   {
#       "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
#       "contentVersion": "1.0.0.0",
#       "parameters": {
#           "apic_sb_pagepublishing_name": {
#               "value": null,
#               "type": "String"
#           },
#           "location": {
#               "value": null,
#               "type": "String"
#           },
#           "connection": {
#               "value": null,
#               "type": "String"
#           }
#       },
#       "variables": {},
#       "resources": [
#           {
#             "type": "Microsoft.Web/connections",
#             "apiVersion": "2016-06-01",
#             "name": "[parameters('apic_sb_pagepublishing_name')]",
#             "location": "[parameters('location')]",
#             "properties": {
#                 "displayName": "[parameters('apic_sb_pagepublishing_name')]",
#                 "customParameterValues": {},
#                 "api": {
#                     "id": "[concat(subscription().id, '/providers/Microsoft.Web/locations/', parameters('location'), '/managedApis/', 'servicebus')]"
#                 },
#                 "parameterValues": {
#                   "connectionString": "[parameters('connection')]"
#                 }
#             }
#         }
#       ]
#   }
#   TEMPLATE
# }

# Logic Apps
# resource "azurerm_monitor_diagnostic_setting" "logic_newswatcher_de_diag" {
#   name                       = "redn-azd-${var.environment_name}-newswatcherde-lapp-diag"
#   target_resource_id         = azurerm_logic_app_workflow.logic_newswatcher_de.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "WorkflowRuntime"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

resource "azurerm_logic_app_workflow" "logic_newswatcher_fr" {
  name                = "redn-azd-${var.environment_name}-newswatcherfr-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags
}

# resource "azurerm_monitor_diagnostic_setting" "logic_newswatcher_fr_diag" {
#   name                       = "redn-azd-${var.environment_name}-newswatcherfr-lapp-diag"
#   target_resource_id         = azurerm_logic_app_workflow.logic_newswatcher_fr.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "WorkflowRuntime"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

resource "azurerm_logic_app_workflow" "logic_newswatcher_it" {
  name                = "redn-azd-${var.environment_name}-newswatcherit-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags
}

# resource "azurerm_monitor_diagnostic_setting" "logic_newswatcher_it_diag" {
#   name                       = "redn-azd-${var.environment_name}-newswatcherit-lapp-diag"
#   target_resource_id         = azurerm_logic_app_workflow.logic_newswatcher_it.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "WorkflowRuntime"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

resource "azurerm_logic_app_workflow" "logic_newsliker_de" {
  name                = "redn-azd-${var.environment_name}-newslikerde-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags
}

# resource "azurerm_monitor_diagnostic_setting" "logic_newsliker_de_diag" {
#   name                       = "redn-azd-${var.environment_name}-newslikerde-lapp-diag"
#   target_resource_id         = azurerm_logic_app_workflow.logic_newsliker_de.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "WorkflowRuntime"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

resource "azurerm_logic_app_workflow" "logic_newsliker_fr" {
  name                = "redn-azd-${var.environment_name}-newslikerfr-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags
}

# resource "azurerm_monitor_diagnostic_setting" "logic_newsliker_fr_diag" {
#   name                       = "redn-azd-${var.environment_name}-newslikerfr-lapp-diag"
#   target_resource_id         = azurerm_logic_app_workflow.logic_newsliker_fr.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "WorkflowRuntime"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }

resource "azurerm_logic_app_workflow" "logic_newsliker_it" {
  name                = "redn-azd-${var.environment_name}-newslikerit-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.tags
}

# resource "azurerm_monitor_diagnostic_setting" "logic_newsliker_it_diag" {
#   name                       = "redn-azd-${var.environment_name}-newslikerit-lapp-diag"
#   target_resource_id         = azurerm_logic_app_workflow.logic_newsliker_it.id
#   log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

#   enabled_log {
#     category = "WorkflowRuntime"

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }

#   metric {
#     category = "AllMetrics"
#     enabled  = true

#     retention_policy {
#       enabled = false
#       days    = 0
#     }
#   }
# }