declare const _default: {
    new (options: any): {
        _level: number;
        Level: string | number;
        trace: (msg: any) => void;
        debug: (msg: any) => void;
        info: (msg: any) => void;
        warn: (msg: any) => void;
        error: (msg: any) => void;
        fatal: (msg: any) => void;
        child: (opts: any) => any;
    };
};
export = _default;
