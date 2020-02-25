
var _logger = require('./app.js');

(async () => {
    await _logger.Init();
    _logger.Debug.Async('hello');
    console.log('hello');
    process.exit(0);
})();
