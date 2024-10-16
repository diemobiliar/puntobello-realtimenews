$tenant = "mtranet"
$AdminEmail = "admin"
$tenant = "devnello365"
$AdminEmail = "mobinello"
$SiteURL = "https://$($tenant).sharepoint.com/sites/pb_home"

# Get Credentials
$cred = Get-Credential -Message "none" -UserName "$($AdminEmail)@$($tenant).onmicrosoft.com" 
Connect-PnPOnline -Url $SiteURL -Credentials $cred

$subscribedChannelsListTitle = "Subscribed Channels";
$subscribedChannelsListUrl = "Lists/pb_subscribed_channels";

$GUID_pb_Subscriber = "0c0b047d-b7b9-4ca9-8f51-5f332fb46a8d"
$GUID_pb_Channels = "22021daf-dda9-4ecc-977a-154841274d24"

New-PnPList -Title $subscribedChannelsListTitle -Url $subscribedChannelsListUrl -Template GenericList -ErrorAction SilentlyContinue
Set-PnPList -Identity $subscribedChannelsListTitle -EnableAttachments $false

Add-PnPField -List $subscribedChannelsListTitle -DisplayName "Subscriber" -InternalName "pb_Subscriber" -Id $GUID_pb_Subscriber -Group "PuntoBello" -AddToDefaultView  -Type User
Set-PnPField -List $subscribedChannelsListTitle -Identity $GUID_pb_Subscriber -Values @{"SelectionMode"=0}
Add-PnPTaxonomyField -List $subscribedChannelsListTitle -DisplayName "Channels" -InternalName "pb_Channels" -TermSetPath "PuntoBello|Channels" -Group "PuntoBello" -AddToDefaultView -Id $GUID_pb_Channels -MultiValue 