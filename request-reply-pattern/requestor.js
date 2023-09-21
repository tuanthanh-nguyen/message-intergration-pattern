const replier = require('node:child_process').fork(__dirname + '/replier.js')
const request = require('./request')(replier)
request({a: 1, b: 2, delay: 500}, function(res) {
    console.log('1 + 2 = ', res.sum)
    replier.disconnect()
})
request({a: 6, b: 1, delay: 100}, function(res) {
    console.log('6 + 1 = ', res.sum)
})
