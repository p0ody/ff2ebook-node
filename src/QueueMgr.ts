import Crypto from "crypto";

interface QueueElement {
	id: string,
	fn: Function,
	args: any[],
	result: any,
	done: boolean,
	startTime?: number,
}

export default class {
	private queue: Array<QueueElement>;
	private inProgress: Array<QueueElement>;
	private maxAsync: number;
	private timeout: number;
	private interval: number;

	constructor(maxAsync: number = 100, timeoutMS:number = 0, interval:number = 1000) {
		this.queue = [];
		this.inProgress = [];
		this.maxAsync = maxAsync;
		this.timeout = timeoutMS;
		this.interval = interval;

		setInterval(this.loop.bind(this), this.interval);
	}

	push(fn: Function, ...args: any[]) : string {
		let id = Crypto.randomUUID();
		this.queue.push({ 
			id: id, 
			fn: fn,
			args: args,
			result: null, 
			done: false });
		return id;
	}

	get complete(): QueueElement[] {
		return this.queue;
	}

	get isEmpty(): boolean {
		return this.queue.length == 0;
	}

	get next(): QueueElement {
		return this.queue.shift();
	}


	private async loop() {
		this.checkTimedOut();
		if (this.inProgress.length >= this.maxAsync) {
			return;
		}

		let element = this.next;
		if (!element) {
			return;
		}
		await this.setInProgress(element, true);1

		if (this.inProgress.length < this.maxAsync) {
			this.loop();
		}

		element.result = await element.fn(element.args);
		element.done = true; 
		await this.setInProgress(element, false);
	}
	
	async waitFor(id: string): Promise<any> {
		let waitFor: QueueElement | null = null;

		for (let element of this.queue) {
			if (element.id == id) {
				waitFor = element;
				break;
			}
		}

		if (!waitFor) {
			return null;
		}

		while (!waitFor.done) {
			await this.delay(this.interval);
			// Wait until the function is done executing
		} 
		await this.setInProgress(waitFor, false);
		return waitFor.result;
	}

	private async delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	private async setInProgress(element:QueueElement, inProgress: boolean) {
		if (inProgress) {
			element.startTime = Date.now();
			this.inProgress.push(element);
			return;
		}

		let index = this.inProgress.indexOf(element);

		if (index !== -1) {
			this.inProgress.splice(index, 1);
		}

	}

	private async checkTimedOut() {
		if (this.timeout === 0) {
			return;
		}
		for (let inProgress of this.inProgress) {
			if (!inProgress.startTime) {
				continue;
			}
			if ((Date.now() - inProgress.startTime) > this.timeout) {
				inProgress.result = null;
				inProgress.done = true;
			}
		}
	}

	public cancelAll() {
		this.queue = [];
		this.inProgress = [];
	}
}
