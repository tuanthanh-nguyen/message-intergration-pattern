const amqp = require('amqplib')

async function connect() {
    try {
        const connection = await amqp.connect('amqp://localhost:5673')
        console.log('Connected to rabbitmq')
    } catch (e) {
        console.error('stuff', e)
    }
}
connect()
