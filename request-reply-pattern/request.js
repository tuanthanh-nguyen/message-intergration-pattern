const uuid = require('uuid')
module.exports = function(channel) {
    const idToCallbackMap = {} //[1]
    channel.on('message', function(message) { //[2]
        const handler = idToCallbackMap[message.inReplyTo]
        if(handler) {
            handler(message.data)
        }
    })
    return function sendRequest(req, callback) { //[3]
        const correlationId = uuid.v4()
        idToCallbackMap[correlationId] = callback
        channel.send({
            type: 'request',
            data: req,
            id: correlationId
        })
    }
}
