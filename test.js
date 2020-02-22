
var _logger = require('./app.js');

(function() {
    // _logger.LogDebug('testing debug, no primary, no secondary');
    // _logger.LogError('testing error, no primary, no secondary');
    // _logger.LogInfo('testing info, no primary, no secondary');
    // _logger.LogWarning('testing warning, no primary, no secondary');

    _logger.LogDebug('testing debug, primary, no secondary', 'dummyPrimary')
        .then(() => {
            _logger.LogError('testing error, primary, no secondary', 'dummyPrimary');
        });
    // _logger.LogError('testing error, primary, no secondary', 'dummyPrimary');
    // _logger.LogInfo('testing info, primary, no secondary', 'dummyPrimary');
    // _logger.LogWarning('testing warning, primary, no secondary', 'dummyPrimary');

    // _logger.LogDebug('testing debug, primary, secondary', 'dummyPrimaryName', 'dummySecondary');
    // _logger.LogError('testing error, primary, secondary', 'dummyPrimary', 'dummySecondary');
    // _logger.LogInfo('testing info, primary, secondary', 'dummyPrimary', 'dummySecondary');
    // _logger.LogWarning('testing warning, primary, secondary', 'dummyPrimary', 'dummySecondary');

})();