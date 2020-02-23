
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _sql = require('mssql');
var _pool = new _sql.ConnectionPool(_cfg.sql.connection);

module.exports = {
    Init: async function(message = null) {
        return new Promise((resolve, reject) => {
            this.LogInfo(message || _cfg.init_message)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogDebug: async function(message) {
        return new Promise((resolve, reject) => {
            executeLogging(message, _cfg.sql.log_types.debug)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogInfo: async function(message) {
        return new Promise((resolve, reject) => {
            executeLogging(message, _cfg.sql.log_types.info)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogWarning: async function(message) {
        return new Promise((resolve, reject) => {
            executeLogging(message, _cfg.sql.log_types.warning)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogError: async function(message) {
        return new Promise((resolve, reject) => {
            executeLogging(message, _cfg.sql.log_types.error)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

async function disconnectDB() {
    return new Promise((resolve, reject) => {
        _pool.close()
            .then(() => {
                resolve('Disconnected.');
            }).catch((err) => {
                reject(err);
            });
    });
}

async function connectDB() {
    return new Promise((resolve, reject) => {
        _pool.connect()
            .then(() => {
                resolve('Connected.');
            }).catch((err) => {
                reject(err);
            });
    });
}

async function executeLogging(message, logTypeID) {
    return new Promise((resolve, reject) => {
        (async () => {
            var sp = _cfg.sql.sp.log_nodejs_app;
            var params = sp.params;

            // build a request that will execute sp with params
            var request = _pool.request();
            request.input(params.app_name, _sql.VarChar(_sql.MAX), _cfg.app_name)
                .input(params.message, _sql.VarChar(_sql.MAX), message)
                .input(params.log_type_ID, _sql.Int, logTypeID)

            connectDB()
                .then(() => {
                    request.execute(sp.name)
                        .then(() => {
                            disconnectDB()
                                .then(() => {
                                    resolve('Execution successful.');
                                })
                                .catch((err) => {
                                    reject('Disconnect error: ' + err);
                                });
                        })
                        .catch((err) => {
                            reject('SP execution error: ' + err);
                        });
                })
                .catch((err) => {
                    reject('Connection error: ' + err);
                });
        })();
    });
}

function readJson(filePath) {
    var fs = require('fs');
    var path = require('path');
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
}