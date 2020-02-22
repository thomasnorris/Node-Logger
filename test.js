
var _logger = require('./app.js');

(async () => {
    _logger.Log('Test.js', 'testing logging from app')
        .then((msg) => {
            console.log(msg);
        })
        .catch((err) => {
            console.log(err);
        });

})();
