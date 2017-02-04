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
    if (!data || typeof data != "string" || !envTags || !(envTags instanceof Array)) {
        return null;
    }

    var lines = data.split("\n");
    if (lines.length == 0) {
        return null;
    }

    var ipRecords = [];
    var recordsMap = {};
    lines.forEach(line => {
        line = line.trim();
        var tag = validLine(envTags, line);

        if (tag) {
            var arr = findOrCreateArrayFrom(recordsMap, tag);
            arr.push(line);
        }
    });

    envTags.forEach(tag => {
        var arr = recordsMap[tag];
        if (!arr) 
            return;

        ipRecords.push(arr);
    });

    return Array.prototype.concat.apply([], ipRecords);
}

/**
 * find the array by key
 * if array was not existed, then create and save it
 * @param  {Object} map array map
 * @param  {String} key key for getting or saving the array
 * @return {Array}      result
 */
function findOrCreateArrayFrom(map, key) {
    var arr = map[key];

    if (!arr) {
        arr = [];
        map[key] = arr;
    }

    return arr;
}

/**
 * valid the tag of line is in envTags
 *
 * @param  {Array}  envTags tags for matching
 * @param  {String} line    string value for matching
 * @return {String}         matched tag
 */
function validLine(envTags, line) {
    if (!line) {
        return null;
    }

    if (line.startsWith("#")) {
        return null;
    }

    if (envTags.indexOf(COMMON_ENV.ALL) >= 0) {
        return COMMON_ENV.ALL;
    }

    let rets = envPicker.exec(line);

    if (rets && rets.length >= 2) {
        var ret = envTags.indexOf(rets[1]);

        if (ret >= 0) {
            return envTags[ret];
        }
    }

    return null;
}

module.exports = readConfig;
