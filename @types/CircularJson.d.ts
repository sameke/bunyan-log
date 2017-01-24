declare module 'circular-json' {
    export function stringify(obj: any): string;
    export function parse(value: string): any;
}