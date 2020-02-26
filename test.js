
var _logger = require('./app.js');

(async () => {
    await _logger.Init();
    await _logger.Debug.Sync('hello');
    await _logger.Info.Sync('hello');
    await _logger.Warning.Sync('hello');
    await _logger.Error.Sync('hello');
    process.exit(0);
})();
