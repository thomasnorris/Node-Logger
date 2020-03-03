
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _mysql = require('mysql');
var _pool = _mysql.createPool(_cfg.sql.connection);

// catch uncaught exceptions
process.on('uncaughtException', (exception) => {
    console.log(exception);
    executeLog('Uncaught exception', exception.stack || exception, _cfg.log_types.critical)
        .then(() => {
            process.exit(0);
        })
        .catch(() => {
            process.exit(0);
        });
});

// catch unhandled rejections
process.on('unhandledRejection', (rejection) => {
    console.log(rejection);
    executeLog('Unhandled promise rejection', rejection.stack || rejection, _cfg.log_types.critical)
        .then(() => {
            process.exit(0);
        })
        .catch(() => {
            process.exit(0);
        });
});

// Log that the app has started
executeLog(_cfg.messages.init, '', _cfg.log_types.init);

module.exports = {
    Init: {
        Async: function(message, details) {
            this.Sync(message, details)
                .then(() => {
                })
                .catch(() => {
                });
        },
        Sync: async function(message, details) {
            return new Promise((resolve, reject) => {
                executeLog(message, details, _cfg.log_types.init)
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
    Debug: {
        Async: function(message, details) {
            this.Sync(message, details)
                .then(() => {
                })
                .catch(() => {
                });
        },
        Sync: async function(message, details) {
            return new Promise((resolve, reject) => {
                executeLog(message, details, _cfg.log_types.debug)
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
        Async: function(message, details) {
            this.Sync(message, details)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message, details) {
            return new Promise((resolve, reject) => {
                executeLog(message, details, _cfg.log_types.info)
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
        Async: function(message, details) {
            this.Sync(message, details)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message, details) {
            return new Promise((resolve, reject) => {
                executeLog(message, details, _cfg.log_types.warning)
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
        Async: function(message, details) {
            this.Sync(message, details)
                .then((msg) => {
                })
                .catch((err) => {
                });
        },
        Sync: async function(message, details) {
            return new Promise((resolve, reject) => {
                executeLog(message, details, _cfg.log_types.error)
                    .then((msg) => {
                        if (_cfg.debug_mode)
                            console.log(msg);
                        resolve(msg);
                    })
                    .catch((err) => {
                        if (_cfg.debug_mode)
                            console.log(err);
                        reject(err);
                    });
            });
        }
    },
}

async function executeLog(message = _cfg.messages.default, details = '', logTypeID = _cfg.log_types.debug) {
    return new Promise((resolve, reject) => {
        (async () => {
            _pool.getConnection((err, connection) => {
                if (err)
                    resolve(err);
                else {
                    var query = 'call ' + _cfg.sql.connection.database + '.' + _cfg.sql.sp.log_node_app + '(';
                    query += connection.escape(_cfg.app_ID) + ', ' + connection.escape(logTypeID) + ', ';
                    query += connection.escape(message) + ', ' + connection.escape(details)  + ');';

                    connection.query(query, (err, res, fields) => {
                        connection.release();
                        if (err)
                            resolve(err);
                        else
                            resolve(res);
                    });
                }
            });
        })();
    });
}

function readJson(filePath) {
    var fs = require('fs');
    var path = require('path');
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
}