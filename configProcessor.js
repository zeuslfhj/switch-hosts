const fs = require('fs');

const COMMON_ENV = {
    ALL: "all"
};

var envPicker = /#([^#]*)?$/;

/**
 * read the config file
 * filter the data after loading the file
 * returning the promise object and making ips as parameter
 * when using its callback chain
 *
 * @param  {string} cfgFilePath config file path
 * @param  {Array}  envTags     tags for matching the records in the config file;
 * @return {Promise}            returning the promise object
 */
function readConfig(cfgFilePath, envTags) {
    return new Promise((resolve, reject)=>{
        console.log("start read config file");
        fs.readFile(cfgFilePath, {encoding: "UTF-8"}, (err, data)=>{
            if (err) {
                reject(err);
                return;
            }

            let ipArr = filterIPsFrom(envTags, data);

            if (!ipArr || ipArr.length <= 0) {
                reject(new Error("couldn't found the ip from config file"))
                return;
            }

            resolve(ipArr);
        });
    });
}

/**
 * filter the IPs matched envTags from all records in config file
 * and then returning them
 *
 * @param  {Array}  envTags tags for matching the records in the config file
 * @param  {String} data    config file's data
 * @return {Array}          IP record array
 */
function filterIPsFrom(envTags, data) {
    if (!data || typeof data != "string") {
        return null;
    }

    var lines = data.split("\n");
    if (lines.length == 0) {
        return null;
    }

    var ipRecords = [];
    lines.forEach(line => {
        line = line.trim();
        var isMatch = validLine(envTags, line);
        if (isMatch) {
            ipRecords.push(line);
        }
    });

    return ipRecords;
}

/**
 * valid the tag of line is in envTags
 *
 * @param  {Array}  envTags tags for matching
 * @param  {String} line    string value for matching
 * @return {boolean}        whether the line is matched tag or not
 */
function validLine(envTags, line) {
    if (!line || !envTags || !(envTags instanceof Array)) {
        return false;
    }

    if (line.startsWith("#")) {
        return false;
    }

    if (envTags.indexOf(COMMON_ENV.ALL) >= 0) {
        return true;
    }

    let rets = envPicker.exec(line);

    if (rets && rets.length >= 2) {
        return envTags.indexOf(rets[1]) >= 0;
    }

    return false;
}

module.exports = readConfig;
