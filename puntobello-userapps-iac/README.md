# redn-realtimenews-iac

IaC Project to deploy RedNet Cloud Real Time News resources.

* Resource group
    * redn-realtimenews-`stage`-rg
* API Connections (used from redn-base)
    * redn-spo-`stage`-apic
    * redn-realtimenews-servicebus-`stage`-apic
* App Service (+ App Service Plan and Storage Account)
    * redn-realtimenews-`stage`-fn
* Service Bus
    * redn-realtimenews-dev-bus
* Logic Apps
    * redn-realtimenews-newswatcherde-`stage`-lapp
    * redn-realtimenews-newswatcherfr-`stage`-lapp
    * redn-realtimenews-newswatcherit-`stage`-lapp
    * redn-realtimenews-newslikerde-`stage`-lapp
    * redn-realtimenews-newslikerfr-`stage`-lapp
    * redn-realtimenews-newslikerit-`stage`-lapp

## Test the code locally

IAC resources can be deployed from local machine. Following commands can be used to deploy a dev environment like Dx (D1, D2, ...) or DEV.

Start PowerShell and set env variables:

```
$env:DEPLOY_STAGE="sandbox"
$env:STAGE="dev"
# RedNet Test Subscription
$env:ARM_SUBSCRIPTION_ID="bf408115-a9b5-49bf-a497-24112465a319"
```

To start the artio deployer console use following command:

```
artio console -t deployer
```

Within the console following commands are required prior the deployment:

```
export DEPLOY_STAGE=sandbox
export STAGE=dev
# RedNet Test Subscription
export ARM_SUBSCRIPTION_ID=bf408115-a9b5-49bf-a497-24112465a319
# RedNet Stage to deploy
export TF_VAR_redn_stage=dev
# Storage parameters to save Terraform state
export STORAGE_ACCOUNT_SUBSCRIPTION_ID=bf408115-a9b5-49bf-a497-24112465a319
export STORAGE_ACCOUNT_NAME=dlprunnerredntestst
export STORAGE_ACCOUNT_RESOURCE_GROUP=dlp-runnerpools-iac-redn-test-rg
export STORAGE_ACCOUNT_CONTAINER_NAME=tfstate
```

Run Terraform with these commands:

```
deploy plan
deploy apply
```

To destroy the resources run this command:

```
deploy destroy
```
