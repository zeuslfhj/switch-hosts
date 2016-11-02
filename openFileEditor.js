const fs = require('fs');
const exec = require('child_process').exec;

function openFileEditor(configFilePath) {
    fs.stat(configFilePath, (err, stat) => {
        if (!err && stat.isFile()) {
            openFileByCommand(configFilePath);
        } else {
            createFile(configFilePath).then((path) => {
                openFileByCommand(path);
            })
            .catch((err) => {
                console.error("open file in editor failed", err);
            });
        }
    });
}

/**
 * create file by path
 * @param  {String}  path path value
 * @return {Promise}      Promise instance
 */
function createFile(path) {
    return new Promise((resolve, reject) => {
        fs.open(path, 'w', (err, file) => {
            if (err) {
                console.error("create file with error", err);
                return;
            }

            fs.close(file, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(path);
            });
        })
    });
}

/**
 * get the command by running platform
 */
function getCommandLine() {
   switch (process.platform) {
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}

/**
 * open file by command
 * @return {[type]} [description]
 */
function openFileByCommand(configFilePath) {
    var command = getCommandLine();
    exec(command + ' ' + configFilePath, (err, data) => {
        if (err) {
            console.error("couldn't open config file", err);
        }
    });
}

module.exports = openFileEditor;
