const WebSocketServer = require('ws').Server
const http = require('node:http')
const ecstatic = require('ecstatic')

const server = http.createServer(
    ecstatic( {root: __dirname + '/www'} )
)

const wss = new WebSocketServer( {server} )
wss.on('connection', conn => {
    console.log('a client just connected')
    conn.on('message', msg => {
        boardcast(msg.toString())
    })
})

function boardcast(msg) {
    wss.clients.forEach(c => {
        c.send(msg)
    })
}

server.listen(process.argv[2] || 3000)
