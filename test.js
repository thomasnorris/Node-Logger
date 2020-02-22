
var _logger = require('./app.js');

(function() {

    _logger.LogDebug('testing debug')
        .then(() => {
            _logger.LogError('testing error');
        });

})();