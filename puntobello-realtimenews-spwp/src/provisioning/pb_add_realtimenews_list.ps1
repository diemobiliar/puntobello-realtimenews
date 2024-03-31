$tenant = "mtranet"
$AdminEmail = "admin"
$tenant = "devnello365"
$AdminEmail = "mobinello"

$SiteURL = "https://$($tenant).sharepoint.com/sites/pb_home"

# Get Credentials
$cred = Get-Credential -Message "none" -UserName "$($AdminEmail)@$($tenant).onmicrosoft.com" 
Connect-PnPOnline -Url $SiteURL -Credentials $cred

$newsListTitle = "Realtime News";   
$newsListUrl = "Lists/pb_realtime_news";

$GUID_pb_Sticky = "e04bb79c-9414-4232-9db5-4d40f4f05f08"
$GUID_pb_Language = "f4825232-a8f6-436e-a0c1-1accb195cf7a"
$GUID_pb_ImageUrl = "596c6a9a-8e73-4b27-ab79-4a0898559ee3"
$GUID_pb_Header = "00eb9d6b-901d-4440-9522-6b41b981b1dd"
$GUID_pb_Title = "536f0d35-2a25-487d-b0d8-9b70e5fcbb7f"
$GUID_pb_NewsUrl = "5cab36a1-3b57-4243-8e3d-6545e5c2cd74"
$GUID_pb_PageName = "02dcc130-d56c-412e-b54a-dc049b209267"
$GUID_pb_Channels = "85fdf7a1-66b5-4075-b2f4-ebc07d91e628"
$GUID_pb_PublishedFrom = "abcfd13d-2645-4886-8086-cabb7cf18683"
$GUID_pb_PublishedTo = "1ed63437-a63b-4a67-bc02-c02e3525d1d3"

New-PnPList -Title $newsListTitle -Url $newsListUrl -Template GenericList -OnQuickLaunch -ErrorAction SilentlyContinue
Set-PnPList -Identity $newsListTitle -EnableAttachments $false

Add-PnPField -List $newsListTitle -DisplayName "Sticky" -InternalName "pb_Sticky" -Id $GUID_pb_Sticky -Group "PuntoBello" -AddToDefaultView  -Type Boolean
Add-PnPField -List $newsListTitle -DisplayName "Language" -InternalName "pb_Language" -Id $GUID_pb_Language -Group "PuntoBello" -AddToDefaultView -Type Text
Add-PnPField -List $newsListTitle -DisplayName "Image Url" -InternalName "pb_ImageUrl" -Id $GUID_pb_ImageUrl -Group "PuntoBello" -AddToDefaultView -Type URL
Add-PnPField -List $newsListTitle -DisplayName "Header" -InternalName "pb_Header" -Id $GUID_pb_Header -Group "PuntoBello" -AddToDefaultView -Type Note
Add-PnPField -List $newsListTitle -DisplayName "Title" -InternalName "pb_Title" -Id $GUID_pb_Title -Group "PuntoBello" -AddToDefaultView -Type Text
Add-PnPField -List $newsListTitle -DisplayName "News Url" -InternalName "pb_NewsUrl" -Id $GUID_pb_NewsUrl -Group "PuntoBello" -AddToDefaultView -Type URL
Add-PnPField -List $newsListTitle -DisplayName "Page name" -InternalName "pb_PageName" -Id $GUID_pb_PageName -Group "PuntoBello" -AddToDefaultView -Type Text
Add-PnPField -List $newsListTitle -DisplayName "Channels" -InternalName "pb_Channels" -Id $GUID_pb_Channels -Group "PuntoBello" -AddToDefaultView -Type Text
Add-PnPField -List $newsListTitle -DisplayName "Published from" -InternalName "pb_PublishedFrom" -Id $GUID_pb_PublishedFrom -Group "PuntoBello" -AddToDefaultView -Type DateTime
Add-PnPField -List $newsListTitle -DisplayName "Published to" -InternalName "pb_PublishedTo" -Id $GUID_pb_PublishedTo -Group "PuntoBello" -AddToDefaultView -Type DateTime