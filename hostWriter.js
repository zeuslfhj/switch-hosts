const fs = require('fs');

const header  = "##################### host switcher's header ####################";
const comment = "# Please don't change the content from the header to the footer #";
const footer  = "##################### host switcher's footer ####################";

/**
 * write the configs to hosts file
 * @param  {string} hostFilePath path of the hosts file
 * @param  {Array}  configs      config values for writing
 * @return {Promise}             promise instance
 */
function writeToHost(hostFilePath, configs) {
    // read file
    return new Promise(function(resolve, reject){
        fs.stat(hostFilePath, (err, status) => {
            if (err || !status.isFile()) {
                resolve({configs});
            } else {
                resolve(readHostFile(hostFilePath, configs));
            }
        })
    })
    // process string
    .then(({configs, data}) => {
        let startIdx = -1;
        let endIdx = -1;

        if (data) {
            startIdx = data.indexOf(header);
            endIdx = data.lastIndexOf(footer);
        } else {
            data = "";
        }

        let cfgStr = "";
        if (configs) {
            cfgStr = configs.join("\n");
        }

        // generate the string
        let nStr = "\n" + [header, comment, cfgStr, footer].join("\n");
        if (startIdx == -1) {
            data += nStr;
        } else {
            data = data.substring(0, startIdx - 1) + nStr + data.substring(endIdx + footer.length);
        }

        return data;
    })
    .then((newFileStr) => {
        return new Promise(function (resolve, reject) {
            console.log("start write file");
            fs.writeFile(hostFilePath, newFileStr, {encoding: "utf8"}, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("write file success");
                    resolve();
                }
            });
        });
    });
};

/**
 * read the host file
 * @param  {String}   hostFilePath path of the hosts file
 * @param  {Array}    configs      config values for writing
 * @param  {Function} resolve      resolve callback after invoking
 * @param  {Function} reject       reject callback after invoking
 * @return {Promise}               promise instance
 */
function readHostFile(hostFilePath, configs, resolve, reject) {
    return new Promise((resolve, reject) => {
        fs.readFile(hostFilePath, {encoding:"utf8"}, (err, data) => {
            console.log("end read file");
            if (err) {
                reject(err);
                return;
            }

            resolve({configs, data});
        });
    })
}

module.exports = writeToHost;
