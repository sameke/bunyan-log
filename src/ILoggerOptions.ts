export const LOG_LEVELS = {
    TRACE: 'trace',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ILoggerOptions {
    /**
     * name of the log file
     */
    name: string;

    /**
     * minimum level to log
     */
    level: LogLevel;

    /**
     * path where log files are to be stored
     */
    path: string;

    /**
     * specifies whether to use file stream by default
     */
    useFile: boolean;

    /**
     * max number of log files to retain before rotating files
     */
    maxLogs: number;

    /**
     * period of time in which to rotate log files
     */
    period: number;

    /**
     * whether to log to standard out by default
     */
    useStdOut: boolean;

    /**
     * whether to log source line (NOTE: this is slow so not recommended in production)
     */
    src: boolean;
}