const reply = require('./reply')

const registerHandler = reply(process)
registerHandler(handler)

function handler(req, callback) {
    setTimeout(function() {
        callback({sum: req.a + req.b})
    }, req.delay)
}
