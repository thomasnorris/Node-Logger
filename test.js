
var _logger = require('./app.js');

(function() {

    _logger.LogDebugAsync('testing debug async');
    _logger.LogInfoAsync('testing info async');
    _logger.LogWarningAsync('testing warning async');
    _logger.LogErrorAsync('testing debug async');

})();