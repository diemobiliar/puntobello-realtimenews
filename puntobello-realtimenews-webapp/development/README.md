# Development Setup

## Variables to Replace
In order to develop and test locally, you will need to replace the following placeholders:

### For the server config (in `index.js`):
- `@@corsOrigin@@`: The domain where the client web app is running, which connects to the socket server (e.g., `http://localhost:3000`).
- `@@azureSBConnectionString@@`: The connection string for the Azure Service Bus.
- `@@azureSBQueueName@@`: The name of the Service Bus queue.

### For the client config (in `testsocket.html`):
Replace any necessary variables or configuration in `testsocket.html` based on your local setup.

---

## Running Fully Locally

You can run both the socket server and a simple web app that connects your client to the socket server fully locally.

### 1. **Node Server (Socket Server)**:
Start the server with the following command:

```bash
node index.js
```

This starts your server on `localhost:8080`.

### 2. **Local HTTP Server (Web App)**:
To run the local web app, go to the subdirectory `development` and run the following command:

```bash
node testsocket.js
```

This starts an HTTP server on `localhost:3000` that serves the `testsocket.html` file by default.

### 3. **Testing**:
Open a browser and navigate to `http://localhost:3000` to test the setup.

---

## Hybrid Setup

You can run the Node server on Azure and connect locally from your client. When developing or load testing, you might need to adjust your socket server to allow CORS. To bypass CORS during development, modify your `index.js` as follows:

```javascript
const io = new Server({
  cors: {
    origin: true  // Allows all origins, DO NOT USE IN PRODUCTION
  },
  // other configurations
});
```

---

## Load Testing Your Azure Web App with Artillery

You can find more information about Artillery [here](https://www.artillery.io/docs/guides/guides/socketio-reference).

### Available Configuration Files:
- **`loadteststandard.yml`**: Runs for 20 seconds with an arrival rate of 10 clients per second. The clients stay connected for 10 minutes.
- **`loadtesthighlongrunning.yml`**: Runs for 20 minutes with an arrival rate of 10 clients per second, ramping up to 20 clients per second. The clients stay connected for 10 minutes.
- **`loadtestveryhighshorterrun.yml`**: Runs for 5 minutes with an arrival rate of 40 clients per second, ramping up to 80 clients per second. The clients stay connected for 10 minutes.

### Important Notes on Load Testing:
- **Do not load test against your production environment**, as these stress tests may overload your web app.
- For example:
  - 10 clients per second = 600 clients per minute or 1,200 clients when full ramp is in progress.
  - 40 clients per second = 2,400 clients per minute or 4,800 clients when full ramp is in progress.
  
- Tests have been performed with up to 11,000 simultaneous connections.

### Running a Test:
In the `development` subfolder, run:

```bash
export PUNTOBELLO_TARGET_URL="wss://yoursocketserver.azurewebsites.net"
npx artillery run loadteststandard.yml
```

---

## Notes
- The YAML key `engine: "socketio-v3"` is correct, as it uses the v4 Socket.IO configuration.
- Be careful when adjusting **arrival rate** and **ramp-up rate** since these values are per second.

---

## Debugging Artillery Load Testing

If you experience issues during load tests (e.g., too many client errors), it may indicate a problem with your setup. You can debug Artillery by running the following command from the `development` subfolder:

### For debugging socketio only issues
```bash
DEBUG=socketio npx artillery run loadteststandard.yml
```

### Full debug mode
```bash
DEBUG=* npx artillery run loadteststandard.yml
```
