import Config from "./_Config";
import * as SourceFetcher from "./SourceFetcher"

const TEST_URL = "https://www.fanfiction.net/s/6868583";

let scraperList: Scraper[] = [];
let lastScraper: Scraper;

export async function testScrapers() {
	let promises: Promise<any>[] = [];
	Config.Scraper.urls.forEach(async (url, index) => {
		if (!scraperList[index]) {
			scraperList[index] = new Scraper(url);
		}

		promises.push(scraperList[index].test());
	});

	await Promise.allSettled(promises);
}

export function getBestScraper(): Scraper {
	if (!Config.Scraper.urls[0]) {
		throw new Error("No scraper set.");
	}

	if (scraperList.length === 0) {
		return new Scraper(Config.Scraper.urls[0]);
	}
	
	sortScraperList();
	return scraperList[0];
}

function sortScraperList(): void {
	scraperList.sort((a, b) => {
		// If scraper is now working, put really low in the list
		if (!a.isWorking) {
			return 10;
		}
		// Then if the queues are equal, use the best ping.
		if (a.queueLength == b.queueLength) {
			if (a.ping < b.ping) {
				return -1;
			}
			if (a.ping > b.ping) {
				return 1;
			}
			return 0;
		}
		// Then choose the one with shortest queue
		if (a.queueLength < b.queueLength) {
			return -1;
		}
		if (a.queueLength > b.queueLength) {
			return 1;
		}

		return 0;
	});
}

export class Scraper {
	private _url: string;
	private _ping: number = 10000;
	private _isWorking: boolean;
	private _queueLength: number = 0;

	constructor(url: string) {
		if (!url) {
			throw new Error("No url provided for scraper.");
		}
		this._url = url;
	}

	async test(): Promise<boolean> {
		console.info("Testing scraper: %s", this.url);
		const startTime = Date.now();
		const res = await SourceFetcher.useScraper(TEST_URL, 3, this);
		if (!res) {
			console.info("FAILED %s", this.url);
			this.isWorking = false;
			return false;
		}
		const delay = Date.now() - startTime;
		console.info("PASSED %s with %s ms delay.", this.url, delay);
		this._ping = delay;
		return true;
	}

	set isWorking(work: boolean) {
		this._isWorking = work;
	}

	get url(): string {
		return this._url;
	}

	get ping(): number {
		return this._ping;
	}

	set ping(ping: number) {
		this._ping = ping;
	}
	
	get isWorking(): boolean {
		return this._isWorking;
	}

	get queueLength(): number {
		return this._queueLength;
	}

	set queueLength(length: number) {
		this._queueLength = length;
	}

}
