# PuntoBello Realtimenews Webapp
This webapp is a node js app running a socket-io server and listening to an azure service bus
The message payloads of the various events are reduced to the strict minimum and do not contain any informations, the payloads are generated outside this server, so it's only a wrapper to emit the event to the connected clients.
_This server is not an http server, you can't connect with http_

## Server-side emitted events of type nd
Generic wrapper emits events received from service bus to the connected clients

## Configuration development
Please check [Development config and instruction](development/README.md) for details about how to setup the project for development purposes

## Configuration production
All the informations are streamed to the console

In order to run this project, you will need to replace the following variables :
In index.js
- @@corsOrigin@@                : the domain where the client web app is running, which connects to the socket server (https://mytenant.sharepoint.com)
- @@azureSBConnectionString@@   : the connection string for the service bus
- @@azureSBQueueName@@          : the name of the service bus queue

This project is configured as a node server running under linux, you can spin up a server with the following command :
az webapp up --sku P1V2 --name yourappname --plan yourserviceplan --resource-group yourresourcegroup --location yourlocation --runtime "node|20-lts"
The recommended config is running at least an sku P1V2, other configurations may run or fail ;-)

### _Note_
When you update the code, please always include the runtime like this :
az webapp up --runtime "node|20-lts"


## Version history

Version|Date|Comments
-------|----|--------
1.0.0.0|Month ???? 1 2024|Initial release

## Copyright
License agreement here

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - See az webapp command config above

