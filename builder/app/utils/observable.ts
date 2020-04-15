// define a class
export default class RedObservable {
	observers: never[];
	id: any;
	state: { [k: string]: any };
	value: undefined;
	process: Function;
	args: any;
	// each instance of the Observer class
	// starts with an empty array of things (observers)
	// that react to a state change
	constructor(id: any) {
		this.observers = [];
		this.id = id;
		this.state = {};
		this.value = undefined;
		this.process = (x: any) => x;
	}
	setProcess(process: Function) {
		this.process = process;
		return this;
	}
	setArgs(args: any) {
		this.args = args;
		return this;
	}
	// add the ability to subscribe to a new object / DOM element
	// essentially, add something to the observers array
	subscribe(f: any) {
		this.observers.push(f);
		return this;
	}

	// add the ability to unsubscribe from a particular object
	// essentially, remove something from the observers array
	unsubscribe(f: any) {
		this.observers = this.observers.filter((subscriber) => subscriber !== f);
		return this;
	}

	update(data: any, from: any) {
		this.state[from] = data;
		if (this.process && this.args && !Object.keys(this.args).some((t) => !this.state.hasOwnProperty(t))) {
			let parameters = Object.keys(this.args)
				.sort((a, b) => this.args[a] - this.args[b])
				.map((v) => this.state[v]);
			let data = this.process(...parameters);
			this.value = data;
			this.notify(data);
		}
	}
	// update all subscribed objects / DOM elements
	// and pass some data to each of them
	notify(data: any) {
		// console.log(`notifies ${this.id}`);
		this.observers.forEach((observer: any) => observer.update(data, this.id));
	}
}
