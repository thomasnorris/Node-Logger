
var _sql = require('mssql');
var _fs = require('fs');

const CFG_FILE = './config/config.json';
var _cfg = readJson(CFG_FILE);

var _pool = new _sql.ConnectionPool(_cfg.connection);

module.exports = {
    Config: _cfg,
    Connect: async function() {
        return new Promise((resolve, reject) => {
            _pool.connect()
                .then(() => {
                    resolve('Connected.');
                }).catch((err) => {
                    reject(err);
                });
        });
    },
    Disconnect: async function() {
        return new Promise((resolve, reject) => {
            _pool.close()
                .then(() => {
                    resolve('Disconnected.');
                }).catch((err) => {
                    reject(err);
                });
        });
    },
    Log: async function(primaryAppName, message, logTypeID, secondaryAppName) {
        return new Promise((resolve, reject) => {
            (async () => {
                var sp = _cfg.sp.log_nodejs_app;
                var params = sp.params;
                var request = _pool.request();

                request.input(params.primary_app_name, _sql.VarChar(_sql.MAX), primaryAppName)
                    .input(params.message, _sql.VarChar(_sql.MAX), message)
                    .input(params.log_type_ID, _sql.Int, logTypeID || _cfg.log_types.info)
                    .input(params.secondary_app_name, _sql.VarChar(_sql.MAX), secondaryAppName || undefined);

                this.Connect()
                    .then(() => {
                        request.execute(sp.name)
                            .then(() => {
                                this.Disconnect()
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
}

function readJson(filePath) {
    return JSON.parse(_fs.readFileSync(filePath, 'utf8'));
}