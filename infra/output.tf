output "rg" {
  value       = azurerm_resource_group.rg.name
  description = "outputting resource group"
}
output "location" {
  value       = azurerm_resource_group.rg.location
  description = "outputting resource group"
}
output "sb_pagepublishing_queue_name" {
  value       = azurerm_servicebus_queue.sb_pagepublishing_queue.name
  description = "outputting api connection service bus name"
}
output "sb_pagepublishing_connection_string" {
  value       = azurerm_servicebus_namespace.sb_pagepublishing.default_primary_connection_string
  description = "outputting api connection service bus connection string"
  sensitive   = true
}
# output "app_name" {
#  value       = azurerm_linux_web_app.app.name
#  description = "outputting app service name"
# }