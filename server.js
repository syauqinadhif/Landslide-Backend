const mqtt = require("mqtt");
const WebSocket = require("ws");

// Broker connection details
const brokerUrl = "tcp://cloud.hilmy.dev:51883";
const clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);
const topic = "bi/ews_landslide/pub_stat"; // Topic to subscribe to

// MQTT connection options
const options = {
  clientId: clientId,
  keepalive: 60,
  clean: true, // Start a clean session
  reconnectPeriod: 1000, // Reconnect after 1 second
  connectTimeout: 30000, // 30 seconds timeout for initial connection
};

// Create MQTT client and connect to broker
const client = mqtt.connect(brokerUrl, options);

// Use port provided by Vercel or fallback to 8080 for local development
const port = process.env.PORT || 8080;

// Create WebSocket server on the provided port
const wss = new WebSocket.Server({ port });

// MQTT Client Event: Connect
client.on("connect", () => {
  console.log("Connected to broker");
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

// MQTT Client Event: Message
client.on("message", (topic, message) => {
  const statusText = message.toString();
  console.log(`Received message: ${statusText} from topic: ${topic}`);

  let statusMessage;
  switch (statusText) {
    case "0":
      statusMessage = "Aman";
      break;
    case "1":
      statusMessage = "Siaga";
      break;
    case "2":
      statusMessage = "Bahaya";
      break;
    default:
      statusMessage = "Unknown status";
  }

  // Broadcast the status to all connected WebSocket clients
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(statusMessage);
    }
  });
});

// Handle WebSocket Connection Close
client.on("close", () => {
  console.log("Connection closed");
});

// Handle WebSocket Errors
client.on("error", (err) => {
  console.error("Connection error:", err);
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
