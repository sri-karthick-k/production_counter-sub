const mqtt = require('mqtt');
const { Client } = require('pg');

const client = mqtt.connect('mqtt://localhost:1885', {
  clientId: 'HI', // Choose a unique client ID
  username: 'counter',
  password: 'counter',
});

// PostgreSQL connection configuration
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'counterdb',
  password: 'production_counter',
  port: 5432, // Change if your PostgreSQL server is running on a different port
};

const pgClient = new Client(pgConfig);

client.on('connect', () => {
  console.log('Subscriber connected to broker');

  // Subscribe to the 'demo' topic
  client.subscribe('demo', (err, granted) => {
    if (err) {
      console.error('Error subscribing to topic:', err);
    } else {
      console.log('Subscribed to topic:', granted[0].topic);
    }
  });
});

// Fired when a message is received
client.on('message', (topic, message) => {
  const mqttMessage = message.toString();

  console.log(`Received message on topic ${topic}: ${mqttMessage}`);

  // Parse the JSON message
  try {
    const data = JSON.parse(mqttMessage);

    // Store the data in PostgreSQL
    pgClient.connect()
      .then(() => {
        const query = {
          text: 'INSERT INTO device_values(mac_address, timestamp, count) VALUES($1, $2, $3)',
          values: [data['mac_address'], data['Time_stamp'], data.Count],
        };

        return pgClient.query(query);
      })
      .then(() => console.log('Data stored in PostgreSQL'))
      .catch(error => console.error('Error storing data in PostgreSQL:', error))
      .finally(() => pgClient.end());
  } catch (error) {
    console.error('Error parsing JSON message:', error);
  }
});

client.on('close', () => {
  console.log('Subscriber disconnected from broker');
});
