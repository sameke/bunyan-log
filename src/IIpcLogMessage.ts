import { LogLevel } from "./ILoggerOptions";

export interface IIpcLogMessage {
    isLog: boolean;
    level: LogLevel;
    contents: string;
}