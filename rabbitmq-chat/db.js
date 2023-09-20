const sqlite3 = require('sqlite3').verbose()
function getDb(dbLocation) {
    return new Promise((res, rej) => {
        const db = new sqlite3.Database(dbLocation, (err) => {
            if (err) rej(`cannot connect to ${dbLocation}`)
            res(db)
        });
    })
}

module.exports = getDb
