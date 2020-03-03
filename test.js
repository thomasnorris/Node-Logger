
var _logger = require('./app.js');

(async () => {
    await _logger.Init.Sync('Init');
    await _logger.Debug.Sync('Debug');
    await _logger.Info.Sync('Info');
    await _logger.Warning.Sync('Warning');
    await _logger.Error.Sync('Error');
    process.exit(0);
})();
