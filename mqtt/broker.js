const mosca = require('mosca');

const settings = {
  port: 1885, // MQTT port
  http: {
    port: 3000, // WebSockets port (optional)
    bundle: true,
  },
};

const authenticate = (client, username, password, callback) => {
  // Check if the username and password match your expected values
  const authorized = (username === 'counter' && password.toString() === 'counter');

  if (authorized) {
    client.user = username;
  }

  callback(null, authorized);
};

const authorizePublish = (client, topic, payload, callback) => {
  // You can add additional logic for publishing authorization here if needed
  callback(null);
};

const authorizeSubscribe = (client, topic, callback) => {
  // You can add additional logic for subscribing authorization here if needed
  callback(null, true);
};

const server = new mosca.Server({ ...settings, authenticate, authorizePublish, authorizeSubscribe });

server.on('ready', () => {
  console.log(`Mosca broker is up and running on port ${settings.port}`);
});

server.on('clientConnected', (client) => {
  console.log('Client connected:', client.id);
});

server.on('clientDisconnected', (client) => {
  console.log('Client disconnected:', client.id);
});

// Log received messages
server.on('published', (packet, client) => {
  if (client) {
    console.log(`Received message from ${client.id} on topic ${packet.topic}: ${packet.payload.toString()}`);
  }
});
