
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

module.exports = {};

// Log that the app has started
executeLog(_cfg.messages.init, '', _cfg.log_types.init);

// build the functions for each Sync and Async method
let types = Object.keys(_cfg.log_types);
types.forEach((type, i) => {
    let prop = {};
    let name = type.slice(0, 1).toUpperCase() + type.slice(1, type.length);

    prop[name] = {
        type: _cfg.log_types[type],
        Async: function(message, details) {
            this.Sync(message, details)
            .then(() => {
            })
            .catch(() => {
            });
        },
        Sync: function(message, details) {
            return new Promise((resolve, reject) => {
                executeLog(message, details, this.type)
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
    };

    Object.assign(module.exports, prop);
});

function executeLog(message = _cfg.messages.default, details = '', logTypeID = _cfg.log_types.debug) {
    return new Promise((resolve, reject) => {
        if (details)
            details = JSON.stringify(details);

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
    });
}

function readJson(filePath) {
    var fs = require('fs');
    var path = require('path');
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf8'));
}