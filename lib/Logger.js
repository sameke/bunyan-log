"use strict";
const bunyan = require("bunyan");
const mkdirp = require("mkdirp");
const path = require("path");
const cluster = require("cluster");
const CJSON = require("circular-json");
const LOG_LEVELS = [
    { name: 'trace', level: bunyan.TRACE },
    { name: 'debug', level: bunyan.DEBUG },
    { name: 'info', level: bunyan.INFO },
    { name: 'warn', level: bunyan.WARN },
    { name: 'error', level: bunyan.ERROR },
    { name: 'fatal', level: bunyan.FATAL }
];
function removeDefaultFields(obj) {
    delete obj.name;
    delete obj.level;
    delete obj.stream;
    delete obj.streams;
    delete obj.serializers;
    delete obj.src;
    delete obj.path;
    delete obj.useStdOut;
    delete obj.period;
    delete obj.logType;
    delete obj.maxLogs;
    delete obj.isNewProcess;
    delete obj.sendToParent;
}
function transformError(error) {
    if (error == null) {
        error = {};
    }
    if (error instanceof Error) {
        let retVal = {
            message: error.message,
            name: error.name,
            stack: error.stack
        };
        let keys = Object.keys(error);
        for (let k of keys) {
            if (retVal[k] == null) {
                retVal[k] = error[k];
            }
        }
        return retVal;
    }
    return error;
}
function sendMessage(msg) {
    try {
        process.send(msg);
    }
    catch (ex) {
        //more than likely a circular object exception        
        let m = CJSON.stringify(msg);
        let t = {
            isCircular: true,
            isLog: true,
            obj: m
        };
        process.send(t);
    }
}
module.exports = class Logger {
    set Level(value) {
        for (let l of LOG_LEVELS) {
            if (l.name == value || l.level == value) {
                this._level = l.level;
                break;
            }
        }
    }
    get Level() {
        return this._level;
    }
    constructor(options) {
        options = options || {};
        if (!(options instanceof Object) || options.name == null) {
            throw new Error('name property required');
        }
        options.isNewProcess = options.isNewProcess === true ? true : cluster.isMaster;
        options.sendToParent = options.sendToParent === true ? true : false;
        let t = options.level || 'info';
        this._level = bunyan.INFO;
        for (let l of LOG_LEVELS) {
            if (l.name == t || l.level == t) {
                this._level = l.level;
                break;
            }
        }
        let appendFields = Object.assign({}, options);
        removeDefaultFields(appendFields);
        if ((cluster.isWorker === true && options.isNewProcess === false) || options.sendToParent === true) {
            this.trace = (msg) => {
                if (this._level <= bunyan.TRACE) {
                    msg = transformError(msg);
                    if (typeof msg == 'string') {
                        msg = {
                            msg: msg
                        };
                    }
                    msg.level = 'trace';
                    msg.isLog = true;
                    msg = Object.assign(msg, appendFields);
                    sendMessage(msg);
                }
            };
            this.debug = (msg) => {
                if (this._level <= bunyan.DEBUG) {
                    msg = transformError(msg);
                    if (typeof msg == 'string') {
                        msg = {
                            msg: msg
                        };
                    }
                    msg.level = 'debug';
                    msg.isLog = true;
                    msg = Object.assign(msg, appendFields);
                    sendMessage(msg);
                }
            };
            this.info = (msg) => {
                if (this._level <= bunyan.INFO) {
                    msg = transformError(msg);
                    if (typeof msg == 'string') {
                        msg = {
                            msg: msg
                        };
                    }
                    msg.level = 'info';
                    msg.isLog = true;
                    msg = Object.assign(msg, appendFields);
                    sendMessage(msg);
                }
            };
            this.warn = (msg) => {
                if (this._level <= bunyan.WARN) {
                    msg = transformError(msg);
                    if (typeof msg == 'string') {
                        msg = {
                            msg: msg
                        };
                    }
                    msg.level = 'warn';
                    msg.isLog = true;
                    msg = Object.assign(msg, appendFields);
                    sendMessage(msg);
                }
            };
            this.error = (msg) => {
                if (this._level <= bunyan.ERROR) {
                    msg = transformError(msg);
                    if (typeof msg == 'string') {
                        msg = {
                            msg: msg
                        };
                    }
                    msg.level = 'error';
                    msg.isLog = true;
                    msg = Object.assign(msg, appendFields);
                    sendMessage(msg);
                }
            };
            this.fatal = (msg) => {
                if (this._level <= bunyan.FATAL) {
                    msg = transformError(msg);
                    if (typeof msg == 'string') {
                        msg = {
                            msg: msg
                        };
                    }
                    msg.level = 'fatal';
                    msg.isLog = true;
                    msg = Object.assign(msg, appendFields);
                    sendMessage(msg);
                }
            };
            this.child = (opts) => {
                removeDefaultFields(opts);
                let childOptions = Object.assign({}, options, opts);
                return new Logger(childOptions);
            };
        }
        else {
            let useStdOut = options.useStdOut || false;
            let logPath = options.path || './logs';
            logPath = path.resolve(logPath);
            let period = options.period || '1d';
            let level = options.level || 'info';
            let logType = options.type || 'rotating-file';
            let maxLogs = options.maxLogs || 10;
            let appId = process.env.WORKER_ID;
            let name = options.name;
            let src = options.src || (process.env.NODE_ENV === 'development');
            let useFile = options.useFile || true;
            try {
                mkdirp.sync(logPath);
                if (appId != null) {
                    logPath = path.join(logPath, (name + '.' + appId + '.log'));
                }
                else {
                    logPath = path.join(logPath, (name + '.log'));
                }
                let streams = [];
                if (useFile == true) {
                    //set up file logging
                    streams.push({
                        type: logType,
                        path: logPath,
                        level: level,
                        period: period,
                        count: maxLogs
                    });
                }
                if (useStdOut === true) {
                    //use stdout logging
                    streams.push({
                        level: level,
                        stream: process.stdout
                    });
                }
                let logOpts = {
                    name: name,
                    serializers: bunyan.stdSerializers,
                    streams: streams,
                    level: level,
                    src: src
                };
                logOpts = Object.assign(logOpts, appendFields);
                let logger = bunyan.createLogger(logOpts);
                this.trace = logger.trace.bind(logger);
                this.debug = logger.debug.bind(logger);
                this.info = logger.info.bind(logger);
                this.warn = logger.warn.bind(logger);
                this.error = logger.error.bind(logger);
                this.fatal = logger.fatal.bind(logger);
                this.child = logger.child.bind(logger);
                //intercept worker logs
                cluster.on('fork', (worker) => {
                    worker.on('message', (message) => {
                        if (message != null && message.isLog == true) {
                            if (message.isCircular === true) {
                                let orig = CJSON.parse(message.obj);
                                message = orig;
                            }
                            let l = message.level;
                            let msg = message.msg || message.message || "";
                            delete message.msg;
                            delete message.level;
                            delete message.isLog;
                            if (this[l] != null) {
                                if (Object.keys(message).length > 0) {
                                    this[l](message, msg);
                                }
                                else {
                                    this[l](msg);
                                }
                            }
                        }
                    });
                });
            }
            catch (e) {
                throw e;
            }
        }
    }
};
