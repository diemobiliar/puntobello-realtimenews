if (Test-Path /proc/1/cgroup) {
    $importPath = "/usr/local/bin"
} else {
    $importPath = "./.devcontainer/scripts"
}

Import-Module "$($importPath)/config.psm1" -Force -DisableNameChecking
Import-Module "$($importPath)/login.psm1" -Force -DisableNameChecking

Invoke-Expression -Command $importPath/Deploy-SitesAndLists.ps1

azd env set tenant_name $global:M365_TENANTNAME

if (Test-Path "./spo/templates.json"){
    $target = ((Get-Content -Path "./spo/templates.json" | ConvertFrom-Json).templates | Where-Object { $_.templateName -eq "RealtimeNews.xml" })
    if ($target.Count -ne 1) {
        Write-Error "The `$target variable should only have 1 element."
        exit 1
    }
    $cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($target.targets)" @global:PnPCreds -ReturnConnection
    [xml]$xml = Get-Content -Path "$($target.relativePath)/$($target.templateName)"
    $listUrl = $xml.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance.Url
    azd env set rtnews_list_guid (Get-PnPList -Identity $listUrl -Connection $cnSite).Id
    azd env set rtnews_home $target.targets

    $sites = ((Get-Content -Path "./spo/templates.json" | ConvertFrom-Json).templates | Where-Object { $_.templateName -eq "SitePages.xml" }).targets
    $cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($sites[0])" @PnPCreds -ReturnConnection
    azd env set rtnews_de_sitepages_list_guid (Get-PnPList -Identity "SitePages" -Connection $cnSite).Id
    azd env set rtnews_de $sites[0]
    $cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($sites[1])" @PnPCreds -ReturnConnection
    azd env set rtnews_en_sitepages_list_guid (Get-PnPList -Identity "SitePages" -Connection $cnSite).Id
    azd env set rtnews_en  $sites[1]
}