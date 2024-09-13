output "rg" {
  value       = azurerm_resource_group.rg.name
  description = "outputting resource group"
}
output "location" {
  value       = azurerm_resource_group.rg.location
  description = "outputting resource group"
}
output "app_name" {
  value       = azurerm_linux_web_app.app.name
  description = "outputting app service name"
}