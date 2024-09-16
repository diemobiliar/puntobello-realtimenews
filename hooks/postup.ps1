if (Test-Path /proc/1/cgroup) {
    $importPath = "/usr/local/bin"
} else {
    $importPath = "./.devcontainer/scripts"
}

$env:SPFX_URL_SOCKET = "$(azd env get-value app_name).azurewebsites.net"
$env:SPFX_LIST_ID_REALTIMENEWSLIST = $(azd env get-value rtnews_list_guid)

$target = ((Get-Content -Path "./spo/templates.json" | ConvertFrom-Json).templates | Where-Object { $_.templateName -eq "RealtimeNews.xml" })
if ($target.Count -ne 1) {
    Write-Error "The `$target variable should only have 1 element."
    exit 1
}
$cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($target.targets)" @global:PnPCreds -ReturnConnection
[xml]$xml = Get-Content -Path "$($target.relativePath)/$($target.templateName)"
$env:SPFX_PATH_REALTIMENEWSLIST = $xml.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance.Url        
$env:SPFX_TERMSTORE_CHANNEL_GUID = Ensure-TermSet -termSetPath "$((Get-Content ./spo/templates.json | ConvertFrom-Json).templates.termSets | Sort-Object -Unique)"

Invoke-Expression -Command $importPath/Build-SPWP.ps1
Invoke-Expression -Command $importPath/Deploy-SPWP.ps1