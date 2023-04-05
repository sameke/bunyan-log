import * as bunyan from 'bunyan';
import { ILoggerOptions, LOG_LEVELS as ExtLogLevels, LogLevel } from './ILoggerOptions';
import { stringify, parse } from 'flatted';
import { mkdirpSync } from 'fs-extra';
import * as path from 'path';
import { IIpcLogMessage } from './IIpcLogMessage';
import cluster from 'cluster';

const LOG_LEVELS = {
    trace: bunyan.TRACE,
    debug: bunyan.DEBUG,
    info: bunyan.INFO,
    warn: bunyan.WARN,
    error: bunyan.ERROR,
    fatal: bunyan.FATAL
};

export class Logger {
    private _logLevel: number;
    private _options: ILoggerOptions;
    private _isMaster: boolean = cluster.isMaster;
    private _logger: bunyan;

    public constructor(options: ILoggerOptions) {
        if (options == null ||
            options.name == null) {
            throw new Error('options object with name required');
        }

        if (options.level == null) {
            this._logLevel = LOG_LEVELS.info;
        } else {
            this._logLevel = LOG_LEVELS[options.level];
        }

        if (options.logToParent == null) {
            options.logToParent = true;
        }

        let appendedFields = Object.assign({}, options);
        this.removeDefaultFields(appendedFields);

        if (this._isMaster != true && process.send != null && options.logToParent === true) {
            this.trace = (msg: any) => {
                if (this._logLevel <= LOG_LEVELS.trace) {
                    msg = Logger.transformError(msg);
                    this.sendMessage(msg, ExtLogLevels.TRACE as LogLevel);
                }
            };

            this.debug = (msg: any) => {
                if (this._logLevel <= LOG_LEVELS.debug) {
                    msg = Logger.transformError(msg);
                    this.sendMessage(msg, ExtLogLevels.DEBUG as LogLevel);
                }
            };

            this.info = (msg: any) => {
                if (this._logLevel <= LOG_LEVELS.info) {
                    msg = Logger.transformError(msg);
                    this.sendMessage(msg, ExtLogLevels.INFO as LogLevel);
                }
            };

            this.warn = (msg: any) => {
                if (this._logLevel <= LOG_LEVELS.warn) {
                    msg = Logger.transformError(msg);
                    this.sendMessage(msg, ExtLogLevels.WARN as LogLevel);
                }
            };

            this.error = (msg: any) => {
                if (this._logLevel <= LOG_LEVELS.error) {
                    msg = Logger.transformError(msg);
                    this.sendMessage(msg, ExtLogLevels.ERROR as LogLevel);
                }
            };

            this.fatal = (msg: any) => {
                if (this._logLevel <= LOG_LEVELS.fatal) {
                    msg = Logger.transformError(msg);
                    this.sendMessage(msg, ExtLogLevels.FATAL as LogLevel);
                }
            };

            this.child = (opts: any) => {
                this.removeDefaultFields(opts);
                let childOptions = Object.assign({}, this._options, opts);
                return new Logger(childOptions);
            }
        } else {
            let useStdOut = options.useStdOut === true ? true : false;
            let logPath = options.path || './logs';
            logPath = path.resolve(logPath);
            let period = options.period || '1d';
            let maxLogs = options.maxLogs != null ? options.maxLogs : 10;
            let src = options.src === true ? true : false;
            let useFile = options.useFile !== false ? true : false;
            let name = options.name.trim();

            if (name.indexOf('.log') < 0) {
                name = `${name}.log`;
            }

            mkdirpSync(logPath);

            let streams: bunyan.Stream[] = [];

            if (useFile === true) {
                streams.push({
                    type: 'rotating-file',
                    path: path.join(logPath, name),
                    level: this._logLevel,
                    period: period as string,
                    count: maxLogs
                });
            }

            if (useStdOut === true) {
                streams.push({
                    level: this._logLevel,
                    stream: process.stdout
                });
            }

            let logOpts: bunyan.LoggerOptions = {
                name: options.name,
                serializers: bunyan.stdSerializers,
                streams: streams,
                level: this._logLevel,
                src: src
            };

            logOpts = Object.assign(logOpts, appendedFields);

            this._logger = bunyan.createLogger(logOpts);

            this.trace = this._logger.trace.bind(this._logger);
            this.debug = this._logger.debug.bind(this._logger);
            this.info = this._logger.info.bind(this._logger);
            this.warn = this._logger.warn.bind(this._logger);
            this.error = this._logger.error.bind(this._logger);
            this.fatal = this._logger.fatal.bind(this._logger);
            this.child = this._logger.child.bind(this._logger);
            this.addStream = this._logger.addStream.bind(this._logger);

            cluster.on('fork', (worker: any) => {
                worker.on('message', (message: any) => {
                    if (message != null && message.isLog === true) {
                        let logMessage: IIpcLogMessage = message;

                        let level = logMessage.level;
                        let messageContents = parse(logMessage.contents);

                        this[level](messageContents);
                    }
                });

                worker.on('exit', () => {
                    worker.removeAllListeners(); // may have issues here removing listeners we do not own...
                });
            });
        }
    }

    public trace: (msg: any) => void;
    public debug: (msg: any) => void;
    public info: (msg: any) => void;
    public warn: (msg: any) => void;
    public error: (msg: any) => void;
    public fatal: (msg: any) => void;
    public child: (opts: any) => Logger;
    public addStream: (stream: bunyan.Stream) => void = (stream: bunyan.Stream) => {
        if (this._isMaster !== true) {
            throw new Error('streams must be added on the master process');
        }
    };

    private removeDefaultFields(obj: ILoggerOptions) {
        delete obj.name;
        delete obj.level;
        delete obj.path;
        delete obj.maxLogs;
        delete obj.period;
        delete obj.useStdOut;
        delete obj.useFile;
        delete obj.src;
    }

    private static transformError(error: any) {
        if (error == null) {
            error = {};
        }

        if (error instanceof Error) {
            let retVal: any = {
                message: error.message,
                name: error.name,
                stack: error.stack
            };

            let keys = Object.keys(error);
            for (let k of keys) {
                if (retVal[k] == null) {
                    retVal[k] = (<any>error)[k];
                }
            }

            return retVal;
        }

        return error;
    }

    private sendMessage(msg: any, level: LogLevel) {
        try {
            if (process.send != null) {
                // flatten object in case of circular references        
                let m = stringify(msg);
                let t: IIpcLogMessage = {
                    isLog: true,
                    level: level,
                    contents: m
                };
                process.send(t);
            }
        } catch (ex) {
            // we have a problem... an error in the logger
            console.log(ex);
            throw ex;
        }
    }
}