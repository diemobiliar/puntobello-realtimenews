if (Test-Path -Path '/.dockerenv') {
    $importPath = '/usr/local/bin'
} else {
    $importPath = './.devcontainer/scripts'
}

Import-Module "$($importPath)/functions.psm1" -Force -DisableNameChecking

Get-ChildItem env: | ? {$_.Name -like "SPFX_*"}

$env:SPFX_URL_SOCKET = "$(azd env get-value APP_NAME).azurewebsites.net"
azd env set SPFX_URL_SOCKET $env:SPFX_URL_SOCKET

$env:SPFX_LIST_ID_REALTIMENEWSLIST = $(azd env get-value RTNEWS_LIST_GUID)
azd env set SPFX_LIST_ID_REALTIMENEWSLIST $env:SPFX_LIST_ID_REALTIMENEWSLIST 

$target = ((Get-Content -Path './spo/solutions.json' | ConvertFrom-Json).sites.templates | Where-Object { $_.templateName -eq 'RealtimeNews.xml' })
if ($target.count -ne 1) {
    Write-Error "exactly 1 elemnt with templateName `'RealtimeNews.xml`' expected! Got $($target.count) elements"
    exit 1
}

[xml]$xml = Get-Content -Path "$($target.relativePath)/$($target.templateName)"

$env:SPFX_PATH_REALTIMENEWSLIST = $xml.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance.Url
azd env set SPFX_PATH_REALTIMENEWSLIST $env:SPFX_PATH_REALTIMENEWSLIST

$target = ((Get-Content -Path './spo/solutions.json' | ConvertFrom-Json).sites.templates | Where-Object { $_.templateName -eq 'SubscribedChannels.xml' })
if ($target.count -ne 1) {
    Write-Error "exactly 1 elemnt with templateName `'RealtimeNews.xml`' expected! Got $($target.count) elements"
    exit 1
}

[xml]$xml = Get-Content -Path "$($target.relativePath)/$($target.templateName)"

$env:SPFX_LIST_TITLE_SUBSCRIBEDCHANNELS = $xml.Provisioning.Templates.ProvisioningTemplate.Lists.ListInstance.Title
azd env set SPFX_LIST_TITLE_SUBSCRIBEDCHANNELS $env:SPFX_LIST_TITLE_SUBSCRIBEDCHANNELS

$env:SPFX_TERMSTORE_CHANNEL_GUID = Add-TermSet -termSetPath "$((Get-Content -Path './spo/solutions.json' | ConvertFrom-Json).termStore.termSets | Sort-Object -Unique)"
azd env set SPFX_TERMSTORE_CHANNEL_GUID $env:SPFX_TERMSTORE_CHANNEL_GUID
Write-Information "Term Set ID: $env:SPFX_TERMSTORE_CHANNEL_GUID"

Get-ChildItem env: | ? {$_.Name -like "SPFX_*"}

Invoke-Expression -Command $importPath/Build-SPWP.ps1
Invoke-Expression -Command $importPath/Deploy-SPWP.ps1