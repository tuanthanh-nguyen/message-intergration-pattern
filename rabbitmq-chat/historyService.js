const getDb = require('./db')
const amqp = require('amqplib')
const http = require('node:http')
const dbLocation = './msgHistory'
const httpPort = process.argv[2] || 8090

init()

async function init() {
    try {
        // setup rabbitmq
        const conn = await amqp.connect('amqp://localhost:5673')
        const channel = await conn.createChannel('chat', 'fanout')
        await channel.assertExchange('chat', 'fanout')
        const q = await channel.assertQueue('chat_history')
        await channel.bindQueue(q.queue, 'chat')

        // setup db
        const db = await getDb(dbLocation)

        // this listener will trigger when there is something pushed into queue
        await channel.consume(q.queue, (msg) => {
            const content = msg.content.toString();
            console.log('Saving message: ' + content)
            db.serialize(() => {
                const date = (new Date()).toISOString().replace(/(.+)T(.+)\..+/, '$1 $2')
                db.exec( `insert into message (created_at, content) values ('${date}', '${content}') `, (_,err) => {
                    if (err) return console.error('cannot insert')
                    channel.ack(msg)
                })
            })
        })

        http.createServer( (req, res) => {
            db.serialize(() => {
                db.all("select * from message", (err, rows) => {
                    if (err) return console.error(err)
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(rows))
                })
            })
        }).listen(httpPort)
    } catch(err) {
        console.log(err);
    }
}
