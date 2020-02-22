
const CFG_FILE = './config/config.json';
var _cfg = readJson(CFG_FILE);
var _repoName = require('git-repo-name').sync();


var _sql = require('mssql');
var _pool = new _sql.ConnectionPool(_cfg.connection);

module.exports = {
    LogDebug: async function(message, primaryAppName = null, secondaryAppName = null) {
        return new Promise((resolve, reject) => {
            executeLogging(message, primaryAppName, secondaryAppName, _cfg.log_types.debug)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogInfo: async function(message, primaryAppName = null, secondaryAppName = null) {
        return new Promise((resolve, reject) => {
            executeLogging(message, primaryAppName, secondaryAppName, _cfg.log_types.info)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogWarning: async function(message, primaryAppName = null, secondaryAppName = null) {
        return new Promise((resolve, reject) => {
            executeLogging(message, primaryAppName, secondaryAppName, _cfg.log_types.warning)
                .then((msg) => {
                    resolve(msg);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    LogError: async function(message, primaryAppName = null, secondaryAppName = null) {
        return new Promise((resolve, reject) => {
            executeLogging(message, primaryAppName, secondaryAppName, _cfg.log_types.error)
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

// if primaryAppName === undefined, the record will insert _repoName
// if secondaryAppName === undefined, the record will insert NULL
async function executeLogging(message, primaryAppName, secondaryAppName, logTypeID) {
    return new Promise((resolve, reject) => {
        (async () => {
            var sp = _cfg.sp.log_nodejs_app;
            var params = sp.params;

            // build a request that will execute sp with params
            var request = _pool.request();
            request.input(params.primary_app_name, _sql.VarChar(_sql.MAX), primaryAppName || _repoName)
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
    return JSON.parse(require('fs').readFileSync(filePath, 'utf8'));
}