# Development setup

## Variable to be replaced
In order to run this project, you will need to replace the following variables :
For the server config, in index.js 
- @@corsOrigin@@                : the domain where the client web app is running, which connects to the socket server (e.g. http://localhost:3000)
- @@azureSBConnectionString@@   : the connection string for the service bus
- @@azureSBQueueName@@          : the name of the service bus queue
For the client config, in testsocket.html
- @@azureWebapp@@               : Url of the socket server, e.g. http://localhost:8080

## Running fully locally

### Node server
You can start the server with the following command :
node index.js
Starts your server on localhost:8080

### Local http server
You can start the local server with the following command from the subdirectory "development" :
node testsocket.js
Start an http server on localhost:3000 which serves by default the file testsocket.html

### Testing
Start a browser and browse http:localhost:3000

## Hybrid setup
You can run the node server from azure and connects locally, in this case you just need to ajust the following parameters :
For the server config, in index.js
- @@corsOrigin@@
For the client config, in testsocket.html
- @@azureWebapp@@

## Load testing with Artillery
The node server was load tested with the Artillery.
You can find further informations about Artillery here :
[Artillery.io Socket Io Reference](https://www.artillery.io/docs/guides/guides/socketio-reference)

You will also find two configuration files :
- loadteststandard.yml
Runs for 20 seconds with an arrival rate of 10 clients per seconds, the clients stay connected for 10 minutes
- loadtesthighlongrunning.yml
Runs for 20 minutes with an arrival rate of 10 clients per seconds, ramping up to 20 clients per seconds. The clients stay connected for 10 minutes
10 clients per sec = 600 clients per minutes or 1200 clients when full ramp is in progress.
This test goes up to 11k connections

In the development subfolder run :
npx artillery run loadteststandard.yml

## _Notes_
- The yml key ...engine: "socketio-v3" ... is correct, it uses the v4 socket configuration
- Be prudent when adjusting arrival and ramp up rates as this values are per seconds

## Load testing with Artillery and debugging
In the development subfolder run :
DEBUG=socketio npx artillery run loadteststandard.yml
