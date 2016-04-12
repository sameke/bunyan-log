/**
 * Created by ben on 11/6/15.
 */
'use strict';

const bunyan = require('bunyan');
const mkdirp = require('mkdirp');
const path = require('path')
const cluster = require('cluster');

const LOGGER = Symbol();

module.exports = class Logger {
    constructor(options){
        if(options == null) {
            options = {};
        }

        let logger = null;

        if(options.sendToMaster === true && cluster.isWorker === true) {
            this.trace = process.send;
            this.debug = process.send;
            this.info = process.send;
            this.warn = process.send;
            this.error = process.send;
            this.fatal = process.send;
        } else {
            let level = options.level || 'error';
            let useStdOut = options.useStdOut || false;
            let logPath = options.path || path.resolve('./logs');
            let period = options.period || '1d';
            let logType = options.type || 'rotating-file';
            let maxLogs = options.count || 10;
            let useWorkerId = options.useWorkerId != false ? true : false;
            let appId = process.env.WORKER_ID || process.id;
            let name = options.name || 'app';
            let src = options.src || (process.env.NODE_ENV === 'development');

            try {
                mkdirp.sync(logPath);

                if(useWorkerId === true) {
                    logPath = path.join(logPath, (name + '.' + appId + '.log'));
                } else {
                    logPath = path.join(logPath, (name + '.log'));
                }


                let streams = [];
                //set up file logging
                streams.push({
                    type: logType,
                    path: logPath,
                    level: level,
                    period: period,
                    count: maxLogs
                });

                if(useStdOut === true) {
                    //use stdout logging
                    streams.push({
                        level: level,
                        stream: process.stdout
                    });
                }

                var logOptions = {
                    name: name,
                    serializers: bunyan.stdSerializers,
                    streams: streams,
                    src: src
                };

                logger = bunyan.createLogger(logOptions);

                this.trace = logger.trace.bind(logger);
                this.debug = logger.debug.bind(logger);
                this.info = logger.info.bind(logger);
                this.warn = logger.warn.bind(logger);
                this.error = logger.error.bind(logger);
                this.fatal = logger.fatal.bind(logger);
            } catch(e) {
                throw e;
            }
        }

        this[LOGGER] = logger;
    }
};