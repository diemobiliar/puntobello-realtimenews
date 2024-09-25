if (Test-Path -Path "/.dockerenv") {
    $importPath = "/usr/local/bin"
} else {
    $importPath = "./.devcontainer/scripts"
}

Invoke-Expression -Command $importPath/Deploy-SitesAndLists.ps1
azd env set TENANT_NAME $global:M365_TENANTNAME

if (Test-Path "./spo/solutions.json"){
    $target = ((Get-Content -Path "./spo/solutions.json" | ConvertFrom-Json).sites.templates | Where-Object { $_.templateName -eq "RealtimeNews.xml" })
    $Url = ((Get-Content -Path "./spo/solutions.json" | ConvertFrom-Json).sites | Where-Object { $_.templates.templateName -eq "RealtimeNews.xml" }).Url
    if ($target.Count -ne 1) {
        Write-Error "The `$target variable should only have 1 element."
        exit 1
    }
    $cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($Url)" @global:PnPCreds -ReturnConnection -WarningAction Ignore
    [xml]$xml = Get-Content -Path "$($target.relativePath)/$($target.templateName)"
    $listUrl = $xml.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance.Url
    azd env set RTNEWS_LIST_GUID (Get-PnPList -Identity $listUrl -Connection $cnSite).Id
    azd env set RTNEWS_HOME $Url

    $sites = ((Get-Content -Path "./spo/solutions.json" | ConvertFrom-Json).sites | Where-Object {$_.templates.templateName -eq "SitePages.xml" }).Url
    $cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($sites[0])" @PnPCreds -ReturnConnection -WarningAction Ignore
    azd env set RTNEWS_DE_SITEPAGES_LIST_GUID (Get-PnPList -Identity "SitePages" -Connection $cnSite).Id
    azd env set RTNEWS_DE $sites[0]
    $cnSite = Connect-PnPOnline -Url "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($sites[1])" @PnPCreds -ReturnConnection -WarningAction Ignore
    azd env set RTNEWS_EN_SITEPAGES_LIST_GUID (Get-PnPList -Identity "SitePages" -Connection $cnSite).Id
    azd env set rtnews_en  $sites[1]
}

((Get-Content -Path "./spo/solutions.json" | ConvertFrom-Json).sites | Where-Object {$_.templates.templateName -eq "SitePages.xml" }).Url