if (Test-Path -Path '/.dockerenv') {
    $importPath = '/usr/local/bin'
} else {
    $importPath = './.devcontainer/scripts'
}

$env:SPFX_URL_SOCKET = "$(azd env get-value app_name).azurewebsites.net"
$env:SPFX_LIST_ID_REALTIMENEWSLIST = $(azd env get-value rtnews_list_guid)

$target = ((Get-Content -Path './spo/solutions.json' | ConvertFrom-Json).sites.templates | Where-Object { $_.templateName -eq 'RealtimeNews.xml' })
if ($target.count -ne 1) {
    Write-Error "exactly 1 elemnt with templateName `'RealtimeNews.xml`' expected! Got $($target.count) elements"
    exit 1
}

Import-Module "$($importPath)/functions.psm1" -Force -DisableNameChecking
[xml]$xml = Get-Content -Path "$($target.relativePath)/$($target.templateName)"
$env:SPFX_PATH_REALTIMENEWSLIST = $xml.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance.Url
$env:SPFX_TERMSTORE_CHANNEL_GUID = Add-TermSet -termSetPath "$((Get-Content -Path './spo/solutions.json' | ConvertFrom-Json).termStore.termSets | Sort-Object -Unique)"

Invoke-Expression -Command $importPath/Build-SPWP.ps1
Invoke-Expression -Command $importPath/Deploy-SPWP.ps1