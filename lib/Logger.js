/**
 * Created by ben on 11/6/15.
 */
'use strict';

const bunyan = require('bunyan');
const mkdirp = require('mkdirp');
const path = require('path')
const cluster = require('cluster');

const LOGGER = Symbol();

const LOG_LEVELS = [
    {name: 'trace', level: 10},
    {name: 'debug', level: 20},
    {name: 'info', level: 30},
    {name: 'warn', level: 40},
    {name: 'error', level: 50},
    {name: 'fatal', level: 60}
]

module.exports = class Logger {
    constructor(options){
        if(options == null) {
            options = {};
        }
        
        let t = options.level || 'debug';
        this.level = 20;
        for(let l of LOG_LEVELS) {
            if(l.name == t) {
                this.level = l.level;
                break;
            }
        }

        let logger = null;

        if(options.sendToMaster === true && cluster.isWorker === true) {
            let masterLog = (msg) => {
                process.send(msg);
            }

            this.trace = (msg) => {
                if(this.level <= 10) {
                    msg.lvl = 'trace';
                    process.send(msg);
                }
            };
            this.debug = (msg) => {
                if(this.level <= 20) {
                    msg.lvl = 'debug';
                    process.send(msg);
                }
            };;
            this.info = (msg) => {
                if(this.level <= 30) {
                    msg.lvl = 'info';
                    process.send(msg);
                }
            };;
            this.warn = (msg) => {
                if(this.level <= 40) {
                    msg.lvl = 'warn';
                    process.send(msg);
                }
            };;
            this.error = (msg) => {
                if(this.level <= 50) {
                    msg.lvl = 'error';
                    process.send(msg);
                }
            };;
            this.fatal = (msg) => {
                if(this.level <= 60) {
                    msg.lvl = 'fatal';
                    process.send(msg);
                }
            };;
        } else {            
            let useStdOut = options.useStdOut || false;
            let logPath = options.path || path.resolve('./logs');
            let period = options.period || '1d';
            let level = options.level || 'debug';
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
                    level: this.level,
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