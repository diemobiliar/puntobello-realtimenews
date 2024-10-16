$tenant = "mtranet"
$AdminEmail = "admin"
$tenant = "devnello365"
$AdminEmail = "mobinello"

$SiteURL = "https://$($tenant).sharepoint.com/sites/pb_newsde"
$SiteURL = "https://$($tenant).sharepoint.com/sites/pb_newseng"

# Get Credentials
$cred = Get-Credential -Message "none" -UserName "$($AdminEmail)@$($tenant).onmicrosoft.com" 
Connect-PnPOnline -Url $SiteURL -Credentials $cred

$GUID_pb_Sticky = "e04bb79c-9414-4232-9db5-4d40f4f05f08"
$GUID_pb_StickyDate = "253d0d96-60a4-4e91-9e17-8f650071c2bd"
$GUID_pb_Channels = "85fdf7a1-66b5-4075-b2f4-ebc07d91e628"
$GUID_pb_PublishedFrom = "abcfd13d-2645-4886-8086-cabb7cf18683"
$GUID_pb_PublishedTo = "1ed63437-a63b-4a67-bc02-c02e3525d1d3"

Add-PnPField -List "SitePages" -DisplayName "Sticky" -InternalName "pb_Sticky" -Id $GUID_pb_Sticky -Group "PuntoBello" -AddToDefaultView  -Type Boolean
Add-PnPField -List "SitePages" -DisplayName "Sticky date" -InternalName "pb_StickyDate" -Id $GUID_pb_StickyDate -Group "PuntoBello" -AddToDefaultView  -Type DateTime
Add-PnPTaxonomyField -List "SitePages" -DisplayName "Channels" -InternalName "pb_Channels" -TermSetPath "PuntoBello|Channels" -Group "PuntoBello" -AddToDefaultView -Id $GUID_pb_Channels -MultiValue 
Add-PnPField -List "SitePages" -DisplayName "Published from" -InternalName "pb_PublishedFrom" -Id $GUID_pb_PublishedFrom -Group "PuntoBello" -AddToDefaultView -Type DateTime
Add-PnPField -List "SitePages" -DisplayName "Published to" -InternalName "pb_PublishedTo" -Id $GUID_pb_PublishedTo -Group "PuntoBello" -AddToDefaultView -Type DateTime