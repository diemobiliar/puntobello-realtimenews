# PuntoBello Realtimenews Webapp

This web app is a Node.js application running a Socket.IO server and listening to an Azure Service Bus. The message payloads for various events are minimized and do not contain sensitive information. These payloads are generated outside of this server, which functions purely as a wrapper to emit events to connected clients.

_This server is not an HTTP server; you cannot connect to it via HTTP._

## Server-Side Emitted Events of Type `nd`
This generic wrapper emits events received from the Service Bus to connected clients. The event type is in the payload and must be handled by the SPFx component.

## Setting Environment Variables
To ensure the application runs correctly, you need to set the appropriate environment variables. Below are instructions for setting these variables on **macOS** and **PowerShell**.

**Linux/macOS:**

```bash
export VARIABLE_NAME="your_value"
```

**PowerShell:**

```powershell
$env:VARIABLE_NAME = "your_value"
```

## Development Configuration
For detailed setup instructions, please refer to the [Development Config and Instructions](development/README.md). This document provides information on:
- Running the web app locally
- Load testing your Azure web app

## Production Configuration
In order to run this project, you need to set the following environment variables in `index.js`:

| Environment Variable             | Description                                                                                               | Example Value                                   |
|----------------------------------|-----------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `CORS_ORIGIN`                    | The domain where the client web app is running, which connects to the socket server.                        | `https://mytenant.sharepoint.com`               |
| `SERVICEBUS_CONNECTION_STRING`   | The connection string for the Azure Service Bus.                                                           | `Endpoint=sb://...`                             |
| `SERVICEBUS_QUEUE_NAME`          | The name of the Service Bus queue.                                                                         | `my-servicebus-queue`                           |
| `port`                           | Optional: The port used by the web app, default is `8080`.                                                 | `9000`                                          |

This project is configured as a Node.js server running on Linux. You can deploy the server with the following command:
```bash
az webapp up --sku yoursku --name yourappname --plan yourserviceplan --resource-group yourresourcegroup --location yourlocation --runtime "node|20-lts"
```

Depending on the number of clients connecting to the web app, you will need to scale your App Service plan. For example, a **P1V3** SKU can handle 10,000-15,000 clients.

For more information, refer to the [Azure App Service on Linux Pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/) page.

### _Note:_
When updating the web app code, always include the runtime like this:
```bash
az webapp up --runtime "node|20-lts"
```

Your disclaimer about security looks good as a starting point. Here's a slightly enhanced and clarified version, with more context and emphasis on securing WebSockets and API management:

---

## Security

Although the above code does not transmit sensitive information, it's crucial to take additional steps to secure your WebSocket server, especially in production environments. Here are a few recommended practices:

- **Implement Authentication via Azure AD**: Use [Azure Active Directory (Azure AD)](https://learn.microsoft.com/en-us/azure/active-directory/) to ensure only authenticated users can establish a connection with your WebSocket server. Tokens like **JWT** can be used to verify the identity of clients before establishing communication.
  
- **Protect with Azure API Management**: Enhance security further by implementing [Azure API Management](https://azure.microsoft.com/en-us/products/api-management/). With API Management, you can:
    - Control access to your WebSocket server with policies such as IP filtering, rate limiting, and geographic restrictions.
    - Apply additional authentication and authorization layers to ensure that only trusted sources can communicate with your WebSocket server.
  
## Version History

| Version | Date         | Comments         |
|---------|--------------|------------------|
| 1.0.0.0 | October 2024 | Initial release  |

## Minimal Path to Awesome

- Clone this repository.
- In the command line, run:
  - `npm install`
  - See the `az webapp` command configuration above.

## License

This project is licensed under the MIT License. See the [LICENSE.md](../LICENSE.md) file for details.

## Acknowledgment Request

If you find this software useful and incorporate it into your own projects, especially for commercial purposes, we kindly ask that you acknowledge its use. This acknowledgment can be as simple as mentioning "Powered by Die Mobiliar - PuntoBello" in your product's documentation, website, or related materials.

While this is not a requirement of the MIT License and is entirely voluntary, it helps support and recognize the efforts of the developers who contributed to this project. We appreciate your support!