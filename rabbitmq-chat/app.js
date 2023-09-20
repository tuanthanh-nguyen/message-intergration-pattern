const getDb = require('./db')
const WebSocketServer = require('ws').Server
const http = require('node:http')
const ecstatic = require('ecstatic')
const amqp = require('amqplib')
const dbLocation = './msgHistory'
const httpPort = process.argv[2] || 3000

init()

async function init() {
    // create websocket server
    const server = http.createServer(
        ecstatic( {root: __dirname + '/www'} )
    )
    const wss = new WebSocketServer( {server} )
    try {
        // setup rabbitmq
        const conn = await amqp.connect('amqp://localhost:5673')
        const channel = await conn.createChannel()
        await channel.assertExchange('chat', 'fanout')
        const q = await channel.assertQueue('chat_srv_' + httpPort, {exclusive: true})
        await channel.bindQueue(q.queue, 'chat')

        // setup db
        const db = await getDb(dbLocation)

        // this listener will trigger when there is something pushed into queue
        await channel.consume(q.queue, (msg) => {
            const content = msg.content.toString();
            wss.clients.forEach(client => client.send(content))
            channel.ack(msg)
        })

        wss.on('connection', conn => {
            console.log('a client just connected')
            // retrieve every message the first time connect for this client
            db.all('SELECT * FROM message', (err, rows) => {
                if (err) {
                    return conn.send('cannot retrieve history')
                }
                conn.send(JSON.stringify(rows))
                conn.on('message', msg => {
                    return channel.publish('chat', '', Buffer.from(msg))
                })
            })
        })
        console.log(httpPort)
        server.listen(httpPort)
    } catch(err) {
        console.error(err);
    };
}

