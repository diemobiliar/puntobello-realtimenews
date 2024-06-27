#!/bin/sh

set -e

export ARM_USE_AZUREAD=true
az extension add --name logic
az account set --subscription "${ARM_SUBSCRIPTION_ID}"

RT_NEWS_LIST_GUID=$(az keyvault secret show --name RTNEWS-LIST-ID-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
PUBLISHING_LOG_LIST_GUID=$(az keyvault secret show --name RTNEWS-PUBLISHING-LOG-LIST-ID-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
TENANT_NAME=$(az keyvault secret show --name M365-TENANTNAME-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
SITE_PAGE_TRIGGER_LIST_GUID[0]=$(az keyvault secret show --name RTNEWS-SITE-PAGES-DE-ID-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
SITE_PAGE_TRIGGER_LIST_GUID[1]=$(az keyvault secret show --name RTNEWS-SITE-PAGES-FR-ID-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
SITE_PAGE_TRIGGER_LIST_GUID[2]=$(az keyvault secret show --name RTNEWS-SITE-PAGES-IT-ID-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
TF_RG=$(terraform output -json | jq .rg.value | tr -d '"')
LOCATION=$(terraform output -json | jq .location.value | tr -d '"')
TF_RG_BASE=redn-base-iac-${TF_VAR_redn_stage}-rg
TF_APIC_SPO_NAME=redn-spo-${TF_VAR_redn_stage}-apic
TF_APIC_SB_NAME=$(terraform output -json | jq .apic_sb_pagepublishing_name.value | tr -d '"')
TF_SB_QUEUE_NAME=$(terraform output -json | jq .sb_pagepublishing_queue_name.value | tr -d '"')
REDN_ADMIN_URL=$(az keyvault secret show --name REDN-ADMIN-URL-${TF_VAR_redn_stage^^} --vault-name ${KEY_VAULT_NAME} --query value | tr -d '"')
LANGUAGES=(de fr it)
TF_LOGIC_NEWSWATCHER_NAME[0]=$(terraform output -json | jq .logic_newswatcher_${LANGUAGES[0]}_name.value | tr -d '"')
TF_LOGIC_NEWSWATCHER_NAME[1]=$(terraform output -json | jq .logic_newswatcher_${LANGUAGES[1]}_name.value | tr -d '"')
TF_LOGIC_NEWSWATCHER_NAME[2]=$(terraform output -json | jq .logic_newswatcher_${LANGUAGES[2]}_name.value | tr -d '"')
TF_LOGIC_NEWSLIKER_NAME[0]=$(terraform output -json | jq .logic_newsliker_${LANGUAGES[0]}_name.value | tr -d '"')
TF_LOGIC_NEWSLIKER_NAME[1]=$(terraform output -json | jq .logic_newsliker_${LANGUAGES[1]}_name.value | tr -d '"')
TF_LOGIC_NEWSLIKER_NAME[2]=$(terraform output -json | jq .logic_newsliker_${LANGUAGES[2]}_name.value | tr -d '"')

cd logicapps

for index in "${!LANGUAGES[@]}"
do
    jsonfile=${TF_LOGIC_NEWSWATCHER_NAME[$index]}.json
    cp mobi_rednet_news_watcher.json $jsonfile
    sed -i "s/@@rtNewsListGuid@@/${RT_NEWS_LIST_GUID}/" $jsonfile
    sed -i "s/@@publishingLogListGuid@@/${PUBLISHING_LOG_LIST_GUID}/" $jsonfile
    sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
    if [[ ${TF_VAR_redn_stage} == 'preprod' ]]; then
        sed -i "s/@@newsSite@@/preprod_rednet_news${LANGUAGES[$index]}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/preprod_rednet/" $jsonfile
    else
        sed -i "s/@@newsSite@@/rednet_news${LANGUAGES[$index]}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
    fi
    sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID[$index]}/" $jsonfile
    sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
    sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
    sed -i "s/@@azureResourceGroup@@/${TF_RG}/" $jsonfile
    sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
    sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
    sed -i "s/@@azureSBConnectionName@@/${TF_APIC_SB_NAME}/" $jsonfile
    sed -i "s/@@azureSBQueueName@@/${TF_SB_QUEUE_NAME}/" $jsonfile
    if [[ ${TF_VAR_redn_stage} == 'prod' ]]; then
        sed -i "s/@@frequency@@/Second/" $jsonfile
        sed -i "s/@@interval@@/30/" $jsonfile
    else
        sed -i "s/@@frequency@@/Minute/" $jsonfile
        sed -i "s/@@interval@@/5/" $jsonfile
    fi      
    az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSWATCHER_NAME[$index]} --definition $jsonfile
done

for index in "${!LANGUAGES[@]}"
do
    jsonfile=${TF_LOGIC_NEWSLIKER_NAME[$index]}.json
    cp mobi_rednet_news_liker.json $jsonfile
    sed -i "s/@@sitePageTriggerListGuid@@/${SITE_PAGE_TRIGGER_LIST_GUID[$index]}/" $jsonfile
    sed -i "s/@@rtNewsListName@@/RTNews/" $jsonfile
    sed -i "s/@@tenantName@@/${TENANT_NAME}/" $jsonfile
    if [[ ${TF_VAR_redn_stage} == 'preprod' ]]; then
        sed -i "s/@@newsSite@@/preprod_rednet_news${LANGUAGES[$index]}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/preprod_rednet/" $jsonfile
    else
        sed -i "s/@@newsSite@@/rednet_news${LANGUAGES[$index]}/" $jsonfile
        sed -i "s/@@rednetHubSite@@/rednet/" $jsonfile
    fi
    sed -i "s/@@azureSubscriptionId@@/${ARM_SUBSCRIPTION_ID}/" $jsonfile
    sed -i "s/@@azureBaseResourceGroup@@/${TF_RG_BASE}/" $jsonfile
    sed -i "s/@@azureSPOConnectionName@@/${TF_APIC_SPO_NAME}/" $jsonfile
    sed -i "s/@@azureLocation@@/${LOCATION}/" $jsonfile
    sed -i "s#@@adminUrl@@#${REDN_ADMIN_URL}#" $jsonfile
    az logic workflow update --resource-group ${TF_RG} --name ${TF_LOGIC_NEWSLIKER_NAME[$index]} --definition $jsonfile
done 