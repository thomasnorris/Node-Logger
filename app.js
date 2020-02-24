
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _sql = require('mssql');
var _pool = new _sql.ConnectionPool(_cfg.sql.connection);

var _exports = module.exports = {
    Init: {
        Async: function() {
            this.Sync()
                .then((msg) => {
                    console.log(msg);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        Sync: async function() {
            if (_cfg.debug_mode)
                this.Debug.Async(_cfg.messages.debug_mode_enabled);
            return executeLog(_cfg.messages.init, _cfg.log_types.info);
        }
    },
    Debug: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                    console.log(msg);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        Sync: async function(message) {
            return executeLog(message, _cfg.log_types.debug);
        }
    },
    Info: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                    console.log(msg);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        Sync: async function(message) {
            return executeLog(message, _cfg.log_types.info);
        }
    },
    Warning: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                    console.log(msg);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        Sync: async function(message) {
            return executeLog(message, _cfg.log_types.warning);
        }
    },
    Error: {
        Async: function(message) {
            this.Sync(message)
                .then((msg) => {
                    console.log(msg);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        Sync: async function(message) {
            return executeLog(message, _cfg.log_types.error);
        }
    },
}

if (_cfg.enable_uncaught_exception_binding) {
    _exports.Debug.Async(_cfg.messages.uncaught_exception_binding.enabled);
    process.on('uncaughtException', (exception) => {
        executeLog(exception, _cfg.log_types.uncaught_exception)
            .then((msg) => {
                throw(exception);
            })
            .catch((err) => {
                throw(exception);
            });
    });
}
else
    _exportsDebug.Async(_cfg.messages.uncaught_exception_binding.disabled);

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
                                    resolve('Logging successful.');
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