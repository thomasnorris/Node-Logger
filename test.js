
var _logger = require('./app.js');

(async function() {
    await _logger.Init();
    _logger.Debug.Async('testing debugging');
    _logger.Warning.Async('testing debugging');
    _logger.Error.Async('testing debugging');
    _logger.Info.Async('testing debugging');
})();