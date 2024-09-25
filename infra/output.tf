output "RG" {
  value       = azurerm_resource_group.rg.name
  description = "outputting resource group"
}
output "APP_NAME" {
  value       = azurerm_linux_web_app.app.name
  description = "outputting app service name"
}