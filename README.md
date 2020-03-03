## Installation
- Add to another project as a submodule using the instructions [here](https://git-scm.com/book/en/v2/Git-Tools-Submodules) if not done so already.
- From the `Node-Logger` submodule:
  - In the `config` folder:
    - Copy/rename `config_template.json` to `config.json` and fill in appropriate settings.
  - In the `root` folder:
    - Run `npm install` to install required packages.
    - Run/edit `test.js` to make sure that all connections are good to go.
## Usage
- Import at the very top of the file, before anything else:
    ```javascript
      var _path = require('path');
      var _logger = require(_path.resolve(__dirname, 'Node-Logger', 'app.js'));

      // rest of program code here
    ```
- `_logger.MethodName.Async(...);` to log fire-and-forget events.
- `[await] _logger.MethodName.Sync(...).then(...).catch(...);` to log events that must be synchronous.
