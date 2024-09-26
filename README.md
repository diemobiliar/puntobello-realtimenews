# PuntoBello real time news

## Use Case

## PuntoBello Artifacts
All lists and fields associated with the PuntoBello solution are prefixed with `pb_`

## Structure

You can find additional information in each respective repository.

## Multilinguality


### Configuring / Translating Languages


### Rendering of Text-Based Information


### Gathering the User Language


#### SPFx Solutions on a SharePoint Page


#### SPFx Solutions Outside of a SharePoint Page


## Additional Configuration Possibilites
Across all the PuntoBello solutions, we have put considerable effort into enabling you to configure your solutions at build time, so that you can:

- Brand the solution with your specific colors, fonts, etc.
- Deploy the solutions easily on multiple tenants if needed (e.g., dev/test/prod environments).

We have also implemented a mini framework across all solutions, which you can easily extend with additional properties if you want to configure further aspects of the solutions.

## Minimal Path to Awesome

todo @bumatt @fabianhutzli

Installation process:
- Set parameters in config.psm1 of devcontainer
- Run devcontainer
- Login to azd and az (azd auth login, az login)
- Run deployment with "azd up" - this will run following steps without additional config of guid's etc needed.
    - Deploy-SitesAndLists.ps1 as preup hook with parameters
    - Infra deployment with terraform, definied in infra
    - Build and deploy webapp to app service
    - Build-SPWP.ps1 and Deploy-SPWP.ps1 as postup hook with automated parameters
- Config SPO API Connection in Azure Portal
    - Set an user which has access to the sites/lists
- Create new terms in term set "PuntoBello|Channels"

### Puntobello Installer

https://github.com/diemobiliar/puntobello-installer/ is configured as a submodule und provides a docker image containing build and deploy scripts for SPFx and SharePoint Scripts. When cloning this repository, include the submodule:

```shell
git clone --recurse-submodules https://github.com/diemobiliar/puntobello-multilingualdocument.git
```
Alternatively, configure the submodule after cloning the repository:

```shell
git submodule update --init
```

With the Puntobello Installer, there is the possibility to execute the installation of all artifacts in various variants. These are described below. They are:
- [Use Dev Container in VS code](#install_devcontainer)
- [Use commands in docker container locally](#install_docker)
- [Build and Deploy locally](#install_locally)

Alternatively, your own preferred methods can be used to build and deploy the solutions - see [Build and serve Webpart or Extension locally using nvm](#install_nvm).

### Azure Developer CLI

For the real-time news, more resources are required than just SharePoint artifacts such as sites and lists, as well as SPFx solutions. We also need various Azure resources to ensure the entire process. For this, we have planned an integration with the Azure Developer CLI. In doing so, we are integrating the scripts of the Puntobello Installer into a complete solution with the Azure Developer CLI.

To read more about the Azure Developer CLI please consult the documentation: [What is the Azure Developer CLI?](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview) and [Quickstart: Deploy an Azure Developer CLI template](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/get-started?tabs=localinstall&pivots=programming-language-nodejs).

### Prerequisites

> 📝 **NOTE:**
> The Dockerfile can be used for arm64 or amd64 CPU architectures. The architecture can be set to "arm64" or "amd64" in the devcontainer.json under build.args. The architecture can also be set using the `ARCH` argument for use with `docker build`. Only arm64 and amd64 are supported. It is set to amd64 if you don't change.

> 📝 **NOTE:**
> If the scripts are executed locally on the client and not in the Dev container, it must be ensured that the following prerequisites are installed:
> - Prerequisites for building SPFx solutions
> - Azure Developer CLI, Terraform and Az CLI
> - The corresponding PowerShell modules

> 💡 **TIP:**
> In order to use the scripts you have to configure login mechanism and other parameters in `./.devcontainer/scripts/config.psm1`. Every authentication mechanism is based on the PnP.PowerShell examples. For setting up an Entra ID app registration and its corresponding API permissions, as well as the necessary permissions when using a user, consult the documentation: [Connect-PnPOnline](https://pnp.github.io/powershell/cmdlets/Connect-PnPOnline.html) and [Authentication](https://pnp.github.io/powershell/articles/authentication.html).

> ⚠️ **Caution:** Never commit files containing secrets or passwords!

### <a id="install_devcontainer"></a>Use Dev Container in VS code
The Visual Studio Code Dev Containers extension lets you use a container as a full-featured development environment.

> 💡 **TIP:**
> If you're interested in getting started with dev containers, you may find this [Dev Containers tutorial](https://code.visualstudio.com/docs/devcontainers/tutorial) helpful. It provides step-by-step instructions to help you get up and running quickly.

#### Use fully automated setup with azd


## Authors

* **Nicole Beck Dekkara** - [PuntoBello](https://www.puntobello.ch/)
* **Mattias Bürgi** - [PuntoBello](https://www.puntobello.ch/)
* **Fabian Hutzli** - [PuntoBello](https://www.puntobello.ch/)
* **Nello D'Andrea** - [PuntoBello](https://www.puntobello.ch/)

## License

This project is licensed under the MIT - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgment Request

If you find this software useful and incorporate it into your own projects, especially for commercial purposes, we kindly ask that you acknowledge its use. This acknowledgment can be as simple as mentioning "Powered by Die Mobiliar - PuntoBello" in your product's documentation, website, or any related materials.

While this is not a requirement of the MIT License and is entirely voluntary, it helps support and recognize the efforts of the developers who contributed to this project. We appreciate your support!