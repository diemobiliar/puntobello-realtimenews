# Development Setup

## Running Fully Locally

You will need to set the following environment variables:

**Linux/macOS:**

```bash
export CORS_ORIGIN="https://localhost:3000"
export SERVICEBUS_CONNECTION_STRING="your-service-bus-connection-string"
export SERVICEBUS_QUEUE_NAME="your-queue-name"
```

**PowerShell:**

```powershell
$env:CORS_ORIGIN = "https://localhost:3000"
$env:SERVICEBUS_CONNECTION_STRING = "your-service-bus-connection-string"
$env:SERVICEBUS_QUEUE_NAME = "your-queue-name"
```

Since we're running locally, the connection will be established to `localhost`.

You can run both the socket server and a simple web app that connects your client to the socket server fully locally.

### 1. **Node Server (Socket Server)**:
Start the server from the main directory using the following command:

```bash
node index.js
```

This will start your server on `localhost:8080`.

### 2. **Local HTTP Server (Web App)**:
To run the local web app, navigate to the `development` subdirectory and run the following command:

```bash
node testsocket.js
```

This starts an HTTP server on `localhost:3000`, which serves the `testsocket.html` file by default.

### 3. **Testing**:
Open a browser and navigate to `http://localhost:3000` to test the setup.

In the developer console, you should see that you are connected to the socket server.

### 4. **Further Scenarios**:
At this point, you can test various scenarios, such as:
- Testing your Azure Logic App and seeing the results locally.
- Testing your web app code before deploying it.
- Testing the logic that will be implemented in your SPFx web part to connect to the socket server.

---

## Hybrid Setup

You can run the Node.js server on Azure while connecting locally from your client. During development or load testing, you may need to adjust your socket server's CORS settings. To allow CORS during development, modify your `index.js` as follows:

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
- **Do not load test against your production environment**, as these stress tests could overload your web app.
- Example rates:
  - 10 to 20 clients per second = 600 clients per minute or 1,200 clients per minute when full ramp-up is in progress.
  
  `Total clients during ramp = (10 + 20) / 2 * 1200 = 15 * 1200 = 18,000 clients`
  
  - 40 to 80 clients per second = 2,400 clients per minute or 4,800 clients per minute when full ramp-up is in progress.

  `Total clients during ramp = (40 + 80) / 2 * 300 = 60 * 300 = 18,000 clients`
  
### Running a Test:
From the `development` subfolder, run:

**Linux/macOS:**
```bash
export PUNTOBELLO_TARGET_URL="wss://yoursocketserver.azurewebsites.net"
npx artillery run loadteststandard.yml
```

**PowerShell:**
```powershell
$env:PUNTOBELLO_TARGET_URL="wss://yoursocketserver.azurewebsites.net"
npx artillery run loadteststandard.yml
```
---

## Notes
- The YAML key `engine: "socketio-v3"` is correct, as it uses the v4 Socket.IO configuration.
- Be cautious when adjusting **arrival rate** and **ramp-up rate**, as these values are per second.

---

## Debugging Artillery Load Testing

If you encounter issues during load tests (e.g., too many client errors), it may indicate a problem with your setup. You can debug Artillery by running the following command from the `development` subfolder:

### For debugging Socket.IO-only issues:
```bash
DEBUG=socketio npx artillery run loadteststandard.yml
```

### Full debug mode:
```bash
DEBUG=* npx artillery run loadteststandard.yml
```