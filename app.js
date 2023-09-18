const WebSocketServer = require('ws').Server
const http = require('node:http')
const ecstatic = require('ecstatic')
const {createClient} = require('redis')

const client = createClient()
const sub = client.duplicate()
const pub = client.duplicate()
const CHANNEL = 'chat_messages' 
const server = http.createServer(
    ecstatic( {root: __dirname + '/www'} )
)
const wss = new WebSocketServer( {server} )

async function init() {
    async function initRedis() {
        await sub.connect()
        await pub.connect()
        sub.on('error', err => console.log('Redis Sub Error', err))
        pub.on('error', err => console.log('Redis Pub Error', err))
    }
    await initRedis()

    wss.on('connection', conn => {
        console.log('a client just connected')
        conn.on('message', msg => {
            pub.publish(CHANNEL, msg.toString())
        })
    })

    sub.subscribe(CHANNEL,  msg => {
        wss.clients.forEach(c => {
            c.send(msg)
        })
    })

    server.listen(process.argv[2] || 3000)
}

init()
