# Resource Group
output "rg" {
  value       = azurerm_resource_group.rg.name
  description = "outputting resource group"
}
output "location" {
  value       = azurerm_resource_group.rg.location
  description = "outputting resource group"
}
# Logic App Names
output "logic_newswatcher_de_name" {
  value       = azurerm_logic_app_workflow.logic_newswatcher_de.name
  description = "outputting logic app name"
}
output "logic_newswatcher_fr_name" {
  value       = azurerm_logic_app_workflow.logic_newswatcher_fr.name
  description = "outputting logic app name"
}
output "logic_newswatcher_it_name" {
  value       = azurerm_logic_app_workflow.logic_newswatcher_it.name
  description = "outputting logic app name"
}
output "logic_newsliker_de_name" {
  value       = azurerm_logic_app_workflow.logic_newsliker_de.name
  description = "outputting logic app name"
}
output "logic_newsliker_fr_name" {
  value       = azurerm_logic_app_workflow.logic_newsliker_fr.name
  description = "outputting logic app name"
}
output "logic_newsliker_it_name" {
  value       = azurerm_logic_app_workflow.logic_newsliker_it.name
  description = "outputting logic app name"
}
#API Connection
output "apic_sb_pagepublishing_name" {
  value       = azurerm_resource_group_template_deployment.apic_sb_pagepublishing.name
  description = "outputting api connection service bus name"
}
#App Service
# output "fn_pagepublishing_hostname" {
#   value       = azurerm_function_app.func_pagepublishing.default_hostname
#   description = "outputting function hostname"
# }
output "sb_pagepublishing_queue_name" {
  value       = azurerm_servicebus_queue.sb_pagepublishing_queue.name
  description = "outputting api connection service bus name"
}