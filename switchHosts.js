#!/usr/bin/env node

const fs = require('fs');
const readConfig = require('./configProcessor');
const writeToHost = require('./hostWriter');
const openFileEditor = require('./openFileEditor');
const exec = require('child_process').exec;
const argv = require('yargs')
    .usage('Usage: $0 -t tag1 tag2 or $0 -e')
    .option('t', {
        alias: "tag",
        describe: "tag of IPs",
        type: "array"
    })
    .option('e', {
        type: "boolean",
        default: true,
        alias: "edit",
        describe: "edit config file"
    })
    .option('c', {
        type: "boolean",
        default: false,
        alias: "clear",
        describe: "clear host"
    })
    .argv;

// config file path
const configFilePath = __dirname + '\\host.cfg';
// hosts file path
const hostsFilePath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'
// const hostsFilePath = './hosts';

if (argv.t) {
    // console.log('switchHost', argv.t);
    switchHost(argv.t);
} else if(argv.c) {
    clearHost();
} else {
    openFileEditor(configFilePath);
}
// if (envName == null) {
//     console.error("plz enter the enviorment name of the host");
// }

/**
 * switch host command implement
 * @param  {Array}  envTags target tags to switch
 */
function switchHost(envTags) {
    let statProm = new Promise((resolve, reject) => {
            fs.stat(configFilePath, (err, stat) => {
                if (err || !stat.isFile()) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
        .then((stat) => {
            return readConfig(configFilePath, envTags);
        })
        .then((config) => {
            return writeToHost(hostsFilePath, config);
        })
        .then((ret) => {
            flushSysDns();
            return ret;
        })
        .catch((err) => {
            console.error(
                "switch host failed, you can use --log to display error information",
                err);
        });
}

function clearHost() {
    var promise = writeToHost(hostsFilePath);

    promise.then(() => {console.log('clear success');})
            .then(() => {flushSysDns();})
            .catch((err) => {console.error('clear failed', err);})
}

function flushSysDns() {
    exec('ipconfig /flushdns');
    console.log('flush dns success');
}