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
