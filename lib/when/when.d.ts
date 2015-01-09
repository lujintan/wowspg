/**
 * Created by lujintan on 11/27/14.
 */

declare module when{
    interface Promise{
        then(suc?: Function, fail?: Function): Promise;
        done(suc?: Function, fail?: Function): Promise;
    }

    interface Defer{
        resolve(...args: any[]): void;
        reject(...args: any[]): void;
        promise: Promise;
    }

    function defer(): Defer;
}

export = when;
