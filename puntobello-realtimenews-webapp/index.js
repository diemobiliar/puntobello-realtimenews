console.log("Telemetry initialized, webapp PuntoBello realtimenew webapp started");

// Port will be assigned automatically by the Azure Web App (process.env.port ). For localhost debugging, we use 8080.
const { ServiceBusClient } = require("@azure/service-bus");
const { Server } = require("socket.io");

const port = process.env.port || 8080;

const io = new Server({
  cors: {
    origin: process.env.CORS_ORIGIN
  },
  serveClient: false,
  pingInterval: 40000,
  pingTimeout: 30000,
  transports: ["websocket"]
});

var clientCount = 0;

io.on("connection", (socket) => {
  clientCount++;
  // Event connect
  console.log("Connect from socketid %s, count is %d", socket.id, clientCount);

  // Event disconnect
  socket.on("disconnect", (reason) => {
    clientCount--;
    console.log("Disconnect with reason %s, count is %d", reason, clientCount);
  })
  // Error
  socket.on("error", (err) => {
    console.error("Socket error detected " + err);
  });


});

io.listen(port);

// Handling for nd events aka news processing
const serviceBusClient = new ServiceBusClient(process.env.SERVICEBUS_CONNECTION_STRING);
const receiver = serviceBusClient.createReceiver(process.env.SERVICEBUS_QUEUE_NAME, { receiveMode: 'receiveAndDelete' });

const newsHandler = async (message) => {
  io.emit('nd', message.applicationProperties);
  console.log("service bus nd event emitted with message %o", message.applicationProperties);
};
const newsErrorHandler = async (args) => {
  console.error("service bus error handler, entitypath %s, argsFQN %s, argserror %s", args.entityPath, args.fullyQualifiedNamespace, args.error);
};
receiver.subscribe({
  processMessage: newsHandler,
  processError: newsErrorHandler
});

process.on('uncaughtException', (err, origin) => {
  console.error("Uncaught exception in node process, error : " + err + " origin : " + origin);
});