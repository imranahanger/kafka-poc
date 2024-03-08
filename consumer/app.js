const { Kafka } = require('kafkajs');
const { promises: fs } = require('fs');
const axios = require('axios')

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'my-group' });



const offsetFilePath = 'offset.txt';

const getStoredOffset = async () => {
  try {
    const offset = await fs.readFile(offsetFilePath, 'utf-8');
    return parseInt(offset, 10);
  } catch (error) {
    // If the file doesn't exist or there's an error, return null
    return null;
  }
};

const storeOffset = async (offset) => {
  await fs.writeFile(offsetFilePath, offset.toString());
};

const consumeMessages = async () => {
  await consumer.connect();
  const topic = 'process-payment';

  const storedOffset = await getStoredOffset();

  await consumer.subscribe({ topic, fromBeginning: false, partition: 0, offset: storedOffset });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Check if the message offset is greater than the stored offset
      const paymentData = JSON.parse(message.value.toString());
      try {
        // Call your payment API here using Axios or any HTTP library
        const paymentResponse = await axios.post('http://localhost:3000/processpayment', paymentData);

        // Check the response status or handle the payment processing result
        if (paymentResponse.status === 200) {
          console.log(`Payment processed successfully: ${paymentResponse.data}`);
        } else {
          console.error(`Payment processing failed: ${paymentResponse.statusText}`);
        }
        if (message.offset > storedOffset) {
          // Process the message here (e.g., call payment API)
          // ...

          // Store the offset after processing the message
          await storeOffset(message.offset);
        }
        await consumer.commitOffsets([{ topic, partition, offset: message.offset + 1 }]);
      } catch (error) {
        console.error('Error processing payment:', error.message);
      }
      //console.log(paymentData)

    },
  });
};

consumeMessages();
