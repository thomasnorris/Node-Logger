
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _sql = require('mssql');
var _pool = new _sql.ConnectionPool(_cfg.sql.connection);

process.on('uncaughtException', (exception) => {
    console.log(exception);
    executeLog(exception, _cfg.log_types.debug)
        .then((msg) => {
            process.exit(0);
        })
        .catch((err) => {
            process.exit(0);
        });
});

process.on('unhandledRejection', (rejection) => {
    console.log(rejection);
    executeLog(rejection, _cfg.log_types.debug)
        .then((msg) => {
            process.exit(0);
        })
        .catch((err) => {
            process.exit(0);
        });
});

module.exports = {
    Init: function() {
        return executeLog(_cfg.messages.init, _cfg.log_types.info);
    },
    Debug: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message) {
            return new Promise((resolve, reject) => {
                executeLog(message, _cfg.log_types.debug)
                    .then((msg) => {
                        if (_cfg.debug_mode)
                            console.log(msg);
                        resolve(msg);
                    })
                    .catch((err) => {
                        if (_cfg.debug_mode)
                            console.log(err);
                        reject(msg);
                    });
            });
        }
    },
    Info: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message) {
            return new Promise((resolve, reject) => {
                executeLog(message, _cfg.log_types.info)
                    .then((msg) => {
                        if (_cfg.debug_mode)
                            console.log(msg);
                        resolve(msg);
                    })
                    .catch((err) => {
                        if (_cfg.debug_mode)
                            console.log(err);
                        reject(msg);
                    });
            });
        }
    },
    Warning: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message) {
            return new Promise((resolve, reject) => {
                executeLog(message, _cfg.log_types.warning)
                    .then((msg) => {
                        if (_cfg.debug_mode)
                            console.log(msg);
                        resolve(msg);
                    })
                    .catch((err) => {
                        if (_cfg.debug_mode)
                            console.log(err);
                        reject(msg);
                    });
            });
        }
    },
    Error: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message) {
            return new Promise((resolve, reject) => {
                executeLog(message, _cfg.log_types.error)
                    .then((msg) => {
                        if (_cfg.debug_mode)
                            console.log(msg);
                        resolve(msg);
                    })
                    .catch((err) => {
                        if (_cfg.debug_mode)
                            console.log(err);
                        reject(msg);
                    });
            });
        }
    },
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
            var sp = _cfg.sql.sp.log_node_app;
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
                                    resolve('Logged "' + message + '".');
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