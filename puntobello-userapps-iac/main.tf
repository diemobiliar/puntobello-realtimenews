provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {
}

data "azurerm_key_vault" "keyvault" {
  name                = "mobi-${lower(module.yaml.app_id)}-${lower(local.stage_storage[var.redn_stage])}-kv"
  resource_group_name = "${lower(module.yaml.app_id)}-base-${lower(module.yaml.tk_type_id)}-${lower(local.stage_short[var.redn_stage])}-rg"
}

data "azurerm_key_vault_secret" "auth_flow_aadappid" {
  name         = "AUTH-FLOW-AADAPPID-${local.stage_short[var.redn_stage]}"
  key_vault_id = data.azurerm_key_vault.keyvault.id
}

data "azurerm_key_vault_secret" "auth_flow_aadappsecret" {
  name         = "AUTH-FLOW-AADAPPSECRET-${local.stage_short[var.redn_stage]}"
  key_vault_id = data.azurerm_key_vault.keyvault.id
}

module "yaml" {
  source             = "terraform.app.mobiliar.ch/cin/cin-terraform-mobiyaml-iaclib/azurerm"
  stage              = var.redn_stage
  mobi_yaml_location = "mobi.yaml"
  version            = "0.0.1020"
}

resource "azurerm_resource_group" "rg" {
  name     = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-rg"
  location = var.location
  tags     = module.yaml.azure_tags
}

resource "azurerm_app_service_plan" "plan_linux" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-linux-${lower(local.stage_short[var.redn_stage])}-splan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "Linux"
  reserved            = true
  tags                = module.yaml.azure_tags
  sku {
    tier = "PremiumV2"
    size = "P1v2"
  }
}

resource "azurerm_monitor_diagnostic_setting" "plan_linux_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_app_service_plan.plan_linux.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

# App Service
resource "azurerm_app_service" "app_sitepublishing" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-sitepublishing-${lower(local.stage_short[var.redn_stage])}-as"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.plan_linux.id
  https_only          = true
  client_cert_enabled = true
  client_cert_mode    = "OptionalInteractiveUser"
  tags                = module.yaml.azure_tags

  site_config {
    http2_enabled            = true
    min_tls_version          = "1.2"
    ftps_state               = "FtpsOnly"
    always_on                = true
    dotnet_framework_version = "v4.0"
    linux_fx_version         = "NODE|16-lts"
    cors {
      allowed_origins = [local.app_sitepublishing_cors_origin[var.redn_stage]]
    }
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "~16"
  }

  identity {
    type = "SystemAssigned"
  }

  auth_settings {
    enabled                       = true
    unauthenticated_client_action = "AllowAnonymous"
    default_provider              = "AzureActiveDirectory"
    token_store_enabled           = true
    issuer                        = "https://sts.windows.net/${data.azurerm_client_config.current.tenant_id}/"
    active_directory {
      client_id     = data.azurerm_key_vault_secret.auth_flow_aadappid.value
      client_secret = data.azurerm_key_vault_secret.auth_flow_aadappsecret.value
    }
  }

  logs {
    detailed_error_messages_enabled = true
    failed_request_tracing_enabled  = true
    http_logs {
      file_system {
        retention_in_days = 1
        retention_in_mb   = 35
      }
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "app_sitepublishing_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_app_service.app_sitepublishing.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "AppServiceHTTPLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  enabled_log {
    category = "AppServiceConsoleLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  enabled_log {
    category = "AppServiceAppLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  enabled_log {
    category = "AppServicePlatformLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

# Service Bus
# namespace
resource "azurerm_servicebus_namespace" "sb_pagepublishing" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-pagepublishing-${lower(local.stage_short[var.redn_stage])}-bus"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Basic"
  tags                = module.yaml.azure_tags
  minimum_tls_version = "1.2"
}

#namespace queue
resource "azurerm_servicebus_queue" "sb_pagepublishing_queue" {
  name                  = "news"
  namespace_id          = azurerm_servicebus_namespace.sb_pagepublishing.id
  lock_duration         = "PT30S"
  max_size_in_megabytes = 1024
}

resource "azurerm_monitor_diagnostic_setting" "sb_pagepublishing_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_servicebus_namespace.sb_pagepublishing.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "OperationalLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  enabled_log {
    category = "RuntimeAuditLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  enabled_log {
    category = "ApplicationMetricsLogs"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

# API Connection Service Bus
resource "azurerm_resource_group_template_deployment" "apic_sb_pagepublishing" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-servicebus-${lower(local.stage_short[var.redn_stage])}-apic"
  resource_group_name = azurerm_resource_group.rg.name
  deployment_mode     = "Incremental"
  tags                = module.yaml.azure_tags
  parameters_content = jsonencode({
    "apic_sb_pagepublishing_name" = {
      value = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-servicebus-${lower(local.stage_short[var.redn_stage])}-apic"
    },
    "location" = {
      value = azurerm_resource_group.rg.location
    },
    "connection" = {
      value = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
    }
  })
  template_content = <<TEMPLATE
  {
      "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
          "apic_sb_pagepublishing_name": {
              "value": null,
              "type": "String"
          },
          "location": {
              "value": null,
              "type": "String"
          },
          "connection": {
              "value": null,
              "type": "String"
          }
      },
      "variables": {},
      "resources": [
          {
            "type": "Microsoft.Web/connections",
            "apiVersion": "2016-06-01",
            "name": "[parameters('apic_sb_pagepublishing_name')]",
            "location": "[parameters('location')]",
            "properties": {
                "displayName": "[parameters('apic_sb_pagepublishing_name')]",
                "customParameterValues": {},
                "api": {
                    "id": "[concat(subscription().id, '/providers/Microsoft.Web/locations/', parameters('location'), '/managedApis/', 'servicebus')]"
                },
                "parameterValues": {
                  "connectionString": "[parameters('connection')]"
                }
            }
        }
      ]
  }
  TEMPLATE
}

# Logic Apps
resource "azurerm_logic_app_workflow" "logic_newswatcher_de" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-newswatcherde-${lower(local.stage_short[var.redn_stage])}-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = module.yaml.azure_tags
}

resource "azurerm_monitor_diagnostic_setting" "logic_newswatcher_de_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_logic_app_workflow.logic_newswatcher_de.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "WorkflowRuntime"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

resource "azurerm_logic_app_workflow" "logic_newswatcher_fr" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-newswatcherfr-${lower(local.stage_short[var.redn_stage])}-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = module.yaml.azure_tags
}

resource "azurerm_monitor_diagnostic_setting" "logic_newswatcher_fr_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_logic_app_workflow.logic_newswatcher_fr.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "WorkflowRuntime"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

resource "azurerm_logic_app_workflow" "logic_newswatcher_it" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-newswatcherit-${lower(local.stage_short[var.redn_stage])}-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = module.yaml.azure_tags
}

resource "azurerm_monitor_diagnostic_setting" "logic_newswatcher_it_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_logic_app_workflow.logic_newswatcher_it.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "WorkflowRuntime"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

resource "azurerm_logic_app_workflow" "logic_newsliker_de" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-newslikerde-${lower(local.stage_short[var.redn_stage])}-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = module.yaml.azure_tags
}

resource "azurerm_monitor_diagnostic_setting" "logic_newsliker_de_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_logic_app_workflow.logic_newsliker_de.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "WorkflowRuntime"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

resource "azurerm_logic_app_workflow" "logic_newsliker_fr" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-newslikerfr-${lower(local.stage_short[var.redn_stage])}-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = module.yaml.azure_tags
}

resource "azurerm_monitor_diagnostic_setting" "logic_newsliker_fr_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_logic_app_workflow.logic_newsliker_fr.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "WorkflowRuntime"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

resource "azurerm_logic_app_workflow" "logic_newsliker_it" {
  name                = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-newslikerit-${lower(local.stage_short[var.redn_stage])}-lapp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = module.yaml.azure_tags
}

resource "azurerm_monitor_diagnostic_setting" "logic_newsliker_it_diag" {
  name                       = "${lower(module.yaml.app_id)}-${lower(module.yaml.fk_name)}-${lower(local.stage_short[var.redn_stage])}-diag"
  target_resource_id         = azurerm_logic_app_workflow.logic_newsliker_it.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.cos_law.id

  enabled_log {
    category = "WorkflowRuntime"

    retention_policy {
      enabled = false
      days    = 0
    }
  }

  metric {
    category = "AllMetrics"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 0
    }
  }
}

resource "azurerm_key_vault_secret" "rtnews_sb_connection_string" {
  name            = "RTNEWS-SB-CONNECTION-STRING-${local.stage_short[var.redn_stage]}"
  value           = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
  key_vault_id    = data.azurerm_key_vault.keyvault.id
  content_type    = "key"
  expiration_date = timeadd(timestamp(), "17520h")
}