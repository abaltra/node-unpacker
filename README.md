node-unpacker
=============
[![Build Status](https://travis-ci.org/abaltra/node-unpacker.svg?branch=master)](https://travis-ci.org/abaltra/node-unpacker)

> Simple unpacker for node that wraps UNZIP, UNTAR and UNRAR

## Installation
You must have the `7za` executable in your path or in the same directory as you `package.json`. Remember, `7zip`   requires the `rar` plugin to be installed to manage RAR files.

```
  sudo apt-get install -y 7zip-full 7zip-rar
  npm install node-unpacker --save
```
  
  
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
  * 0.4.0 Added support for GZ files
  * 0.2.0 Changed Zip management, added error management
  * 0.1.0 Initial release
