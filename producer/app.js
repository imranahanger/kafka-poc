const express = require('express');
const { Kafka } = require('kafkajs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const kafka = new Kafka({
    clientId: 'my-producer',
    brokers: ['localhost:9092'], // Use the internal Kafka container address
});

const producer = kafka.producer();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post('/', async (req, res) => {

    const payments = [
        {
            "mobileNumber": "1313123213",
            "trasactionId": "112321321",
            "amount": 913
        },
        {
            "mobileNumber": "2313123213",
            "trasactionId": "122321321",
            "amount": 914
        },
        {
            "mobileNumber": "3313123213",
            "trasactionId": "132321321",
            "amount": 915
        }
    ]
    const produceMessages = async () => {
        await producer.connect();

        const topic = 'process-payment';

        await producer.send({
            topic,
            messages: payments.map(payment => ({ value: JSON.stringify(payment) })),
        });

        await producer.disconnect();
    };

    produceMessages();

    res.send('Message sent to Kafka!');
});
app.post('/approach2', async (req, res) => {
    const payments = [
        {
            "mobileNumber": "1313123213",
            "transactionId": "112321321",
            "amount": 916
        },
        {
            "mobileNumber": "2313123213",
            "transactionId": "122321321",
            "amount": 917
        },
        {
            "mobileNumber": "3313123213",
            "transactionId": "132321321",
            "amount": 918
        }
    ];

    const produceMessage = async (payment) => {
        await producer.connect();

        const topic = 'process-payment';

        try {
            await producer.send({
                topic,
                messages: [{ value: JSON.stringify(payment) }],
            });
            console.log(`Message sent: ${JSON.stringify(payment)}`);
        } catch (error) {
            console.error(`Error sending message: ${error.message}`);
        } finally {
            await producer.disconnect();
        }
    };

    const produceAllMessages = async () => {
        for (const payment of payments) {
            await produceMessage(payment);
            // Optional: Add a delay between messages if needed
            // await delay(100);
        }
    };

    produceAllMessages();

    res.send('Messages sent to Kafka!');
});
app.post('/processpayment', async (req, res) => {
    console.log("----------------------------------")
    console.log(req.body)
    console.log("----------------------------------")
    await delay(5000)
    res.send('done')
})
app.listen(port, () => {
    console.log(`Producer app listening at http://localhost:${port}`);
});
