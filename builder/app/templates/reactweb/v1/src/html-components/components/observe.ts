export default class Observe<T> {
    promise: Promise<T>;
    result: T | undefined;
    retryFunc: any;
    completed: boolean;
    attempts: number = 10;
    constructor(promise: Promise<T>, retry?: any) {
        this.completed = false;
        this.retryFunc = retry;
        this.promise = promise.then((res: T) => {
            this.result = res;
            if (res === undefined) {
                this.completed = true;
                this.doRetry();
            }
            return res;
        });
    }
    doRetry() {
        if (this.attempts && this.retryFunc) {
            this.attempts--;
            this.promise = this.retryFunc();
        }
    }
    then(func: any): Observe<T> {
        if (this.result !== undefined) {
            func(this.result);
        }
        else if (this.completed === false) {
            this.promise.then(() => {
                func(this.result);
                return this.result;
            })
        }
        return this as any;
    }
    static observe<T>(promise: Promise<T>) {
        var observer = new Observe<T>(promise);
        return observer;
    }
    static produce<T>(func: () => Promise<T>) {
        let promise = func();
        var observer = new Observe<T>(promise, func);
        return observer;
    }
}