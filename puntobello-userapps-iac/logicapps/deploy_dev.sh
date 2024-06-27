$env:DEPLOY_STAGE="sandbox"
$env:STAGE="dev"
$env:ARM_SUBSCRIPTION_ID="bf408115-a9b5-49bf-a497-24112465a319"

export KEY_VAULT_NAME="mobi-redn-dev-kv"
export DEPLOY_STAGE=sandbox
export STAGE=dev
export ARM_SUBSCRIPTION_ID=bf408115-a9b5-49bf-a497-24112465a319
export TF_VAR_redn_stage=dev
export STORAGE_ACCOUNT_SUBSCRIPTION_ID=bf408115-a9b5-49bf-a497-24112465a319
export STORAGE_ACCOUNT_NAME=dlprunnerredntestst
export STORAGE_ACCOUNT_RESOURCE_GROUP=dlp-runnerpools-iac-redn-test-rg
export STORAGE_ACCOUNT_CONTAINER_NAME=tfstate

export ARM_USE_AZUREAD=true
az extension add --name logic
az account set --subscription "${ARM_SUBSCRIPTION_ID}"
RT_NEWS_LIST_GUID=$(az keyvault secret show --name RTNEWS-LIST-ID-DEV --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
PUBLISHING_LOG_LIST_GUID=$(az keyvault secret show --name RTNEWS-PUBLISHING-LOG-LIST-ID-DEV --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
TENANT_NAME=$(az keyvault secret show --name M365-TENANTNAME-DEV --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
SITE_PAGE_TRIGGER_LIST_GUID_DE=$(az keyvault secret show --name RTNEWS-SITE-PAGES-DE-ID-DEV --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
SITE_PAGE_TRIGGER_LIST_GUID_FR=$(az keyvault secret show --name RTNEWS-SITE-PAGES-FR-ID-DEV --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
SITE_PAGE_TRIGGER_LIST_GUID_IT=$(az keyvault secret show --name RTNEWS-SITE-PAGES-IT-ID-DEV --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
TF_RG=$(terraform output -json | jq .rg.value | tr -d '"')
LOCATION=$(terraform output -json | jq .location.value | tr -d '"')
TF_RG_BASE=redn-base-iac-dev-rg
TF_APIC_SPO_NAME=redn-spo-dev-apic
TF_APIC_SB_NAME=$(terraform output -json | jq .apic_sb_pagepublishing_name.value | tr -d '"')
TF_SB_QUEUE_NAME=$(terraform output -json | jq .sb_pagepublishing_queue_name.value | tr -d '"')
TF_LOGIC_NEWSWATCHER_NAME_DE=$(terraform output -json | jq .logic_newswatcher_de_name.value | tr -d '"')
TF_LOGIC_NEWSWATCHER_NAME_FR=$(terraform output -json | jq .logic_newswatcher_fr_name.value | tr -d '"')
TF_LOGIC_NEWSWATCHER_NAME_IT=$(terraform output -json | jq .logic_newswatcher_it_name.value | tr -d '"')
TF_LOGIC_NEWSLIKER_NAME_DE=$(terraform output -json | jq .logic_newsliker_de_name.value | tr -d '"')
TF_LOGIC_NEWSLIKER_NAME_FR=$(terraform output -json | jq .logic_newsliker_fr_name.value | tr -d '"')
TF_LOGIC_NEWSLIKER_NAME_IT=$(terraform output -json | jq .logic_newsliker_it_name.value | tr -d '"')
cd logicapps

        jsonfile=${TF_LOGIC_NEWSWATCHER_NAME_DE}.json
        cp mobi_rednet_news_watcher.json $jsonfile
        sed -i "s/@@rtNewsListGuid@@/${RT_NEWS_LIST_GUID}/" $jsonfile
        sed -i "s/@@publishingLogListGuid@@/${PUBLISHING_LOG_LIST_GUID}/" $jsonfile
        sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
        sed -i "s/@@newsSite@@/rednet_newsde/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
        sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID_DE}/" $jsonfile
        sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
        sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
        sed -i "s/@@azureResourceGroup@@/${TF_RG}/" $jsonfile
        sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
        sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
        sed -i "s/@@azureSBConnectionName@@/${TF_APIC_SB_NAME}/" $jsonfile
        sed -i "s/@@azureSBQueueName@@/${TF_SB_QUEUE_NAME}/" $jsonfile
        sed -i "s/@@frequency@@/Minute/" $jsonfile
        sed -i "s/@@interval@@/5/" $jsonfile
        az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSWATCHER_NAME_DE} --definition $jsonfile

        jsonfile=${TF_LOGIC_NEWSWATCHER_NAME_FR}.json
        cp mobi_rednet_news_watcher.json $jsonfile
        sed -i "s/@@rtNewsListGuid@@/${RT_NEWS_LIST_GUID}/" $jsonfile
        sed -i "s/@@publishingLogListGuid@@/${PUBLISHING_LOG_LIST_GUID}/" $jsonfile
        sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
        sed -i "s/@@newsSite@@/rednet_newsfr/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
        sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID_FR}/" $jsonfile
        sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
        sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
        sed -i "s/@@azureResourceGroup@@/${TF_RG}/" $jsonfile
        sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
        sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
        sed -i "s/@@azureSBConnectionName@@/${TF_APIC_SB_NAME}/" $jsonfile
        sed -i "s/@@azureSBQueueName@@/${TF_SB_QUEUE_NAME}/" $jsonfile
        sed -i "s/@@frequency@@/Minute/" $jsonfile
        sed -i "s/@@interval@@/5/" $jsonfile
        az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSWATCHER_NAME_FR} --definition $jsonfile

        jsonfile=${TF_LOGIC_NEWSWATCHER_NAME_IT}.json
        cp mobi_rednet_news_watcher.json $jsonfile
        sed -i "s/@@rtNewsListGuid@@/${RT_NEWS_LIST_GUID}/" $jsonfile
        sed -i "s/@@publishingLogListGuid@@/${PUBLISHING_LOG_LIST_GUID}/" $jsonfile
        sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
        sed -i "s/@@newsSite@@/rednet_newsit/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
        sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID_IT}/" $jsonfile
        sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
        sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
        sed -i "s/@@azureResourceGroup@@/${TF_RG}/" $jsonfile
        sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
        sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
        sed -i "s/@@azureSBConnectionName@@/${TF_APIC_SB_NAME}/" $jsonfile
        sed -i "s/@@azureSBQueueName@@/${TF_SB_QUEUE_NAME}/" $jsonfile
        sed -i "s/@@frequency@@/Minute/" $jsonfile
        sed -i "s/@@interval@@/5/" $jsonfile
        az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSWATCHER_NAME_IT} --definition $jsonfile

        jsonfile=${TF_LOGIC_NEWSLIKER_NAME_DE}.json
        cp mobi_rednet_news_liker.json $jsonfile
        sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID_DE}/" $jsonfile
        sed -i "s/@@rtNewsListName@@/RTNews/" $jsonfile
        sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
        sed -i "s/@@newsSite@@/rednet_newsde/" $jsonfile
        sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
        sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
        sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
        sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
        az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSLIKER_NAME_DE} --definition $jsonfile

        jsonfile=${TF_LOGIC_NEWSLIKER_NAME_FR}.json
        cp mobi_rednet_news_liker.json $jsonfile
        sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID_FR}/" $jsonfile
        sed -i "s/@@rtNewsListName@@/RTNews/" $jsonfile
        sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
        sed -i "s/@@newsSite@@/rednet_newsfr/" $jsonfile
        sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
        sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
        sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
        sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
        az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSLIKER_NAME_FR} --definition $jsonfile

        jsonfile=${TF_LOGIC_NEWSLIKER_NAME_IT}.json
        cp mobi_rednet_news_liker.json $jsonfile
        sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID_IT}/" $jsonfile
        sed -i "s/@@rtNewsListName@@/RTNews/" $jsonfile
        sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
        sed -i "s/@@newsSite@@/rednet_newsit/" $jsonfile
        sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
        sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
        sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
        sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
        az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSLIKER_NAME_IT} --definition $jsonfile
        