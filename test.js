
var _log = require('./app.js');

(async () => {
    _log.Connect()
        .then((msg) => {
            console.log(msg);
        })
        .catch((err) => {
            console.log(err);
        });
})();
