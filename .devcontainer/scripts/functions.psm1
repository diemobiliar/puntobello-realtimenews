<#
.SYNOPSIS
    Ensures that a SharePoint site collection exists, and creates it if it does not.

.DESCRIPTION
    The Assert-SiteCollection function checks if a SharePoint site collection exists at the specified URL.
    If the site collection does not exist, it creates a new Communication Site with the specified title.

.PARAMETER SiteName
    The name of the site collection to check or create.

.PARAMETER SiteTitle
    The title of the site collection to create if it does not exist.

.EXAMPLE
    Assert-SiteCollection -SiteName "exampleSite" -SiteTitle "Example Site"
    Ensures that the site collection "exampleSite" exists, and creates it with the title "Example Site" if it does not.

.NOTES
    This function requires the PnP PowerShell module and appropriate permissions to create site collections.
#>
Function Assert-SiteCollection {
    param (
        [Parameter()]
        [String]$SiteName,
        [String]$SiteTitle
    )

    $Url = "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($SiteName)"

    if($null -eq (Get-PnPTenantSite -Url $Url -Connection $global:cnAdmin -ErrorAction SilentlyContinue)){
        try {
            Write-Information "Creating Site $($Url)"
            New-PnPSite -Type "CommunicationSite" -Title $SiteTitle -Url $Url -Lcid 1033 -Owner $global:adminUser -Connection $global:cnAdmin    
        }
        catch {
            throw "Site Creation for $($Url) failed: $_"
        }
        
    } else {
        Write-Verbose "Site $($Url) already exists"
    }
}
Export-ModuleMember -Function Assert-SiteCollection

<#
.SYNOPSIS
    Applies a PnP site template to a specified SharePoint site.

.DESCRIPTION
    The Invoke-SiteTemplate function connects to a specified SharePoint site and applies a PnP site template from a given path.

.PARAMETER siteUrl
    The URL of the SharePoint site to which the template will be applied.

.PARAMETER templatePath
    The path to the PnP site template file to apply.

.EXAMPLE
    Invoke-SiteTemplate -siteUrl "https://example.sharepoint.com/sites/exampleSite" -templatePath "C:\Templates\exampleTemplate.xml"
    Connects to the site "exampleSite" and applies the template located at "C:\Templates\exampleTemplate.xml".

.NOTES
    This function requires the PnP PowerShell module and appropriate permissions to apply site templates.
#>
function Invoke-SiteTemplate {
    param (
      [PSObject]$template
    )
  
    try {   
      foreach ($site in $template.targets) {
        $siteUrl = "https://$($global:M365_TENANTNAME).sharepoint.com/sites/$($site)"
        $cnSite = Connect-PnPOnline -Url $siteUrl @global:PnPCreds -ReturnConnection
        $templatePath = "$($template.relativePath)/$($template.templateName)"
        Invoke-PnPSiteTemplate -Path $templatePath -Connection $cnSite -Verbose
        Write-Host "SiteTemplate `'$($template.templateName)`' applied for site $($cnSite.Url)" -ForegroundColor Green
      }
    }
    catch {
      throw "Error applying `'$($template.templateName)`' for site $($cnSite.Url): $_"
    }
}
Export-ModuleMember -Function Invoke-SiteTemplate

<#
.SYNOPSIS
    Ensures and creates a Termgroup and Termset

.DESCRIPTION
    This function verify if a Termgrouo and Termset exists in Term store. If not it will be created.

.PARAMETER termGroupPath
    The full path of the Termset.

.EXAMPLE
    Ensure-TermSet -termSetPath "Puntobello|Channels"

.NOTES
    This function requires the PnP PowerShell module and appropriate permissions to create a term set and group.
#>
function Ensure-TermSet {
    param (
      [PSObject]$termSetPath
    )

    # Define the term group and term set names
    $termGroupName = $termSetPath.Split("|")[0]
    $termSetName = $termSetPath.Split("|")[1]

    # Check if the term group already exists
    $termGroup = Get-PnPTermGroup -Identity $termGroupName -Connection $global:cnAdmin -ErrorAction SilentlyContinue

    # If the term group doesn't exist, create it
    if (!$termGroup) {
        $termGroup = New-PnPTermGroup -Name $termGroupName -Connection $global:cnAdmin
    }

    # Check if the term set already exists
    $termSet = Get-PnPTermSet -Identity $termSetName -TermGroup $termGroup -Connection $global:cnAdmin -ErrorAction SilentlyContinue

    # If the term set doesn't exist, create it
    if (!$termSet) {
        $termSet = New-PnPTermSet -Name $termSetName -TermGroup $termGroup -Connection $global:cnAdmin
    }

    # Output the term set ID for reference
    Write-Host "Term Set ID: $($termSet.Id)"
}
Export-ModuleMember -Function Ensure-TermSet