export default class Observe<T> {
    promise: Promise<T>;
    result: T | undefined;
    constructor(promise: Promise<T>) {
        this.promise = promise.then((res: T) => {
            this.result = res;
            return res;
        });
    }
    then(func: any): Observe<T> {
        if (this.result !== undefined) {
            func(this.result);
        }
        else {
            this.promise.then(() => {
                func(this.result);
            })
        }
        return this as any;
    }
    static observe<T>(promise: Promise<T>) {
        var observer = new Observe<T>(promise);
        return observer;
    }
}