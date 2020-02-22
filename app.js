
var _sql = require('mssql');
var _fs = require('fs');

const CFG_FILE = './config/config.json';
var _cfg = readJson(CFG_FILE);

var _pool = new _sql.ConnectionPool(_cfg.connection);

var _exports = module.exports = {
    LogDebug: async function(primaryAppName, message, secondaryAppName) {
        return new Promise((resolve, reject) => {
            executeLogging(primaryAppName, message, _cfg.log_types.debug, secondaryAppName)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogInfo: async function(primaryAppName, message, secondaryAppName) {
        return new Promise((resolve, reject) => {
            executeLogging(primaryAppName, message, _cfg.log_types.info, secondaryAppName)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogWarning: async function(primaryAppName, message, secondaryAppName) {
        return new Promise((resolve, reject) => {
            executeLogging(primaryAppName, message, _cfg.log_types.warning, secondaryAppName)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogError: async function(primaryAppName, message, secondaryAppName) {
        return new Promise((resolve, reject) => {
            executeLogging(primaryAppName, message, _cfg.log_types.error, secondaryAppName)
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

// if secondaryAppName === undefined, the record will insert NULL
async function executeLogging(primaryAppName, message, logTypeID, secondaryAppName) {
    return new Promise((resolve, reject) => {
        (async () => {
            var sp = _cfg.sp.log_nodejs_app;
            var params = sp.params;
            var request = _pool.request();

            request.input(params.primary_app_name, _sql.VarChar(_sql.MAX), primaryAppName)
                .input(params.message, _sql.VarChar(_sql.MAX), message)
                .input(params.log_type_ID, _sql.Int, logTypeID)
                .input(params.secondary_app_name, _sql.VarChar(_sql.MAX), secondaryAppName);

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
    return JSON.parse(_fs.readFileSync(filePath, 'utf8'));
}