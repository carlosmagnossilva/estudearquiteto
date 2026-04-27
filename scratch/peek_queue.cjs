const { ServiceBusClient } = require("@azure/service-bus");
require('dotenv').config({ path: './hub-core/.env' });

async function main() {
  const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
  const queueName = "fila_sgo_local";
  
  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(queueName);
  
  try {
    console.log(`Peeking messages from ${queueName}...`);
    const messages = await receiver.peekMessages(10);
    console.log(`Found ${messages.length} messages.`);
    for (const msg of messages) {
      console.log(`- Message ID: ${msg.messageId}`);
      console.log(`  Body: ${JSON.stringify(msg.body).substring(0, 100)}...`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sbClient.close();
  }
}

main();
