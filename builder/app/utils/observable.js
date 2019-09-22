import { uuidv4 } from "./array";

// define a class
export default class RedObservable {
    // each instance of the Observer class
    // starts with an empty array of things (observers)
    // that react to a state change
    constructor(id) {
        this.observers = [];
        this.id = id;
        this.state = {};
        this.value = undefined;
        this.process = (x => x);
    }
    setProcess(process) {
        this.process = process;
        return this;
    }
    setArgs(args) {
        this.args = args;
        return this;
    }
    // add the ability to subscribe to a new object / DOM element
    // essentially, add something to the observers array
    subscribe(f) {
        this.observers.push(f);
        return this;
    }

    // add the ability to unsubscribe from a particular object
    // essentially, remove something from the observers array
    unsubscribe(f) {
        this.observers = this.observers.filter(subscriber => subscriber !== f);
        return this;
    }

    update(data, from) {
        this.state[from] = data;
        if (this.process && this.args && !Object.keys(this.args).some(t => !this.state.hasOwnProperty(t))) {
            let parameters = Object.keys(this.args).sort((a, b) => (this.args[a] - this.args[b])).map(v => this.state[v]);
            let data = this.process(...parameters);
            this.value = data;
            this.notify(data);
        }
    }
    // update all subscribed objects / DOM elements
    // and pass some data to each of them
    notify(data) {
        // console.log(`notifies ${this.id}`);
        this.observers.forEach(observer => observer.update(data, this.id));
    }
}