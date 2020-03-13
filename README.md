## Installation
- Add to another project as a submodule using the instructions [here](https://git-scm.com/book/en/v2/Git-Tools-Submodules) if not done so already.
- From the `Node-Logger` submodule:
  - In the `config` folder:
    - Copy/rename `config_template.json` to `config.json` and fill in appropriate settings.
  - In the `root` folder:
    - Run `npm install` to install required packages.
    - Run/edit `test.js` to make sure that all connections are good to go.
## Usage
- Import after all other submodules but before any program code:
    ```javascript
      var _path = require('path');

      // import other submodules first

      var _logger = require(_path.resolve(__dirname, 'Node-Logger', 'app.js'));

      // rest of program code goes here
    ```
- `_logger.MethodName.Async(...);` to log fire-and-forget events.
- `[await] _logger.MethodName.Sync(...).then(...).catch(...);` to log events that must be synchronous.
- It can also be wrapped in an anonymous `async` function for certain uses (like inside of another callback, shown here)
  ``` javascript
  function myFunction(callback(value) => {
    // some callback code

    (async () => {
      // [await] _logger.MethodName.Sync(...).then(...).catch(...);

      // more code to be called once logging is done
    })();
  });
  ```
