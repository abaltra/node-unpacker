# node-unpacker
  Simple unpacker for node that wraps UNZIP, UNTAR and UNRAR

## Installation
  npm install node-unpacker --save
  
## Usage
  ```
  var inflator = require('node-unpacker');
  inflator.unpackFile('MY_FILE', 'OUTPUT_DIR', GENERATE_RANDOM_FOLDER).then(
    function (data) {
       // data contains the route to the new folder with the unpacked data
    },
    function (error) {
       // in case of whoops
    }
  )
  ```
## Tests
  ```
  npm test
  ```

## Contributing
  Feel free to contribute, let's just try to keep it readable :)

## Release History
  * 0.1.0 Initial release
