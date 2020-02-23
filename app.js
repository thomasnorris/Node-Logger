
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _sql = require('mssql');
var _pool = new _sql.ConnectionPool(_cfg.sql.connection);

module.exports = {
    InitPromise: async function() {
        return new Promise((resolve, reject) => {
            this.DebugPromise(_cfg.messages.init)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    Init: function() {
        this.InitPromise()
            .then((msg) => {
                console.log(msg);
            })
            .catch((err) => {
                console.log(err);
            });
    },
    DebugPromise: async function(message) {
        return new Promise((resolve, reject) => {
            executeLog(message, _cfg.log_types.debug)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    Debug: function(message) {
        this.DebugPromise(message)
            .then((msg) => {
                console.log(msg);
            })
            .catch((err) => {
                console.log(err);
            });
    },
    InfoPromise: async function(message) {
        return new Promise((resolve, reject) => {
            executeLog(message, _cfg.log_types.info)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    Info: function(message) {
        this.InfoPromise(message)
            .then((msg) => {
                console.log(msg);
            })
            .catch((err) => {
                console.log(err);
            });
    },
    WarningPromise: async function(message) {
        return new Promise((resolve, reject) => {
            executeLog(message, _cfg.log_types.warning)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    Warning: function(message) {
        this.WarningPromise(message)
            .then((msg) => {
                console.log(msg);
            })
            .catch((err) => {
                console.log(err);
            });
    },
    ErrorPromise: async function(message) {
        return new Promise((resolve, reject) => {
            executeLog(message, _cfg.log_types.error)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    Error: function(message) {
        this.ErrorPromise(message)
            .then((msg) => {
                console.log(msg);
            })
            .catch((err) => {
                console.log(err);
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

async function executeLog(message = _cfg.messages.default, logTypeID = _cfg.log_types.debug) {
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