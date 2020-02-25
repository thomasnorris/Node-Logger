
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _mysql = require('mysql');
var _pool = _mysql.createPool(_cfg.sql.connection);

process.on('uncaughtException', (exception) => {
    var msg = 'Uncaught exception: ""' + exception + '"".';
    console.log(msg);
    executeLog(msg, _cfg.log_types.critical)
        .then((msg) => {
            process.exit(0);
        })
        .catch((err) => {
            process.exit(0);
        });
});

process.on('unhandledRejection', (rejection) => {
    var msg = 'Unhandled promise rejection: ""' + rejection + '"".';
    console.log(msg);
    executeLog(msg, _cfg.log_types.critical)
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
                        reject(err);
                    });
            });
        }
    },
}

async function executeLog(message = _cfg.messages.default, logTypeID = _cfg.log_types.debug) {
    return new Promise((resolve, reject) => {
        (async () => {
            var query = 'call ' + _cfg.sql.connection.database + '.' + _cfg.sql.sp.log_node_app + '(';
            query += stringify(_cfg.app_name) + ', ' + logTypeID + ', ' + stringify(message) + ');';

            _pool.getConnection((err, connection) => {
                if (err)
                    reject(err);

                connection.query(query, (err, res, fields) => {
                    connection.release();
                    if (err)
                        reject(err);
                    else
                        resolve(res);
                });
            });
        })();
    });
}

function stringify(str) {
    return '"' + str + '"';
}

function readJson(filePath) {
    var fs = require('fs');
    var path = require('path');
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
}