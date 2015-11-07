/**
 * Created by ben on 11/6/15.
 */
'use strict';

const bunyan = require('bunyan');
const mkdirp = require('mkdirp');
const path = require('path');

module.exports = class Logger {
    constructor(options){
        let level = options.level || 'error';
        let useStdOut = options.useStdOut || false;
        let logPath = options.path || '../../../logs';
    }

};