
var _path = require('path');
const CFG_FILE = _path.resolve(__dirname, 'config', 'config.json');
var _cfg = readJson(CFG_FILE);

var _mysql = require('mysql');
var _pool = _mysql.createPool(_cfg.sql.connection);

// override console.log function UNLESS we are in debug mode
// otherwise there will be an infinite loop of console.log calls
// taken from here: https://stackoverflow.com/a/39049036
var cl = console.log;
console.log = async function(...args) {
    if (!_cfg.debug_mode) {
        return new Promise((resolve, reject) => {
            var str = args.toString().split(',').join(' ');
            cl.apply(console, args);
            module.exports.Debug.Sync('console.log called', str)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    cl.apply(console, args);
}

// catch uncaught exceptions and log them
process.on('uncaughtException', (exception) => {
    console.log(exception);
    executeLog(_cfg.messages.uncaught_exception, exception.stack || exception, _cfg.log_types.critical)
        .then(() => {
            process.exit(0);
        })
        .catch(() => {
            process.exit(0);
        });
});
// catch unhandled rejections and log them
process.on('unhandledRejection', (rejection) => {
    console.log(rejection);
    executeLog(_cfg.messages.unhandled_rejection, rejection.stack || rejection, _cfg.log_types.critical)
        .then(() => {
            process.exit(0);
        })
        .catch(() => {
            process.exit(0);
        });
});

module.exports = {
    Init: function(cb) {
        if (_cfg.debug_mode)
            console.log(_cfg.messages.debug_mode_enabled);

        return executeLog(_cfg.messages.init, '', _cfg.log_types.info);
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