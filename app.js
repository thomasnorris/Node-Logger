
var _sql = require('mssql');
var _fs = require('fs');

const CFG_FILE = './config/config.json';
var _cfg = readJson(CFG_FILE);

var _pool = new _sql.ConnectionPool(_cfg.sql.connection);

module.exports = {
    Connect: async function() {
        return new Promise((resolve, reject) => {
            _pool.connect()
                .then(() => {
                    resolve('Connected.');
                }).catch((err) => {
                    reject(err);
                });
        });
    },
    Disconnect: async function() {
        return new Promise((resolve, reject) => {
            _pool.close()
                .then(() => {
                    resolve('Disconnected.');
                }).catch((err) => {
                    reject(err);
                });
        });
    },
    Log: async function() {
        return new Promise((resolve, reject) => {
        });
    }
}

function readJson(filePath) {
    return JSON.parse(_fs.readFileSync(filePath, 'utf8'));
}