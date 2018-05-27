export declare class Logger {
    private _level;
    Level: number | string;
    trace: (msg: any) => void;
    debug: (msg: any) => void;
    info: (msg: any) => void;
    warn: (msg: any) => void;
    error: (msg: any) => void;
    fatal: (msg: any) => void;
    child: (opts: any) => Logger;
    constructor(options: any);
}
