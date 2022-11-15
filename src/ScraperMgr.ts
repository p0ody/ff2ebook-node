import Config from "./_Config";
import * as SourceFetcher from "./SourceFetcher"

const TEST_URL = "https://www.fanfiction.net/s/6868583";

let scraperList: Scraper[] = [];

export async function testScrapers() {
	Config.Scraper.urls.forEach(async (url, index) => {
		if (!scraperList[index]) {
			scraperList[index] = new Scraper(url);
		}

		scraperList[index].test();
	});
}

export function getBestScraper(): Scraper {
	if (!Config.Scraper.urls[0]) {
		throw new Error("No scraper set.");
	}

	if (scraperList.length === 0) {
		return new Scraper(Config.Scraper.urls[0]);
	}

	let best: Scraper | null = null;
	scraperList.forEach((scraper) => {
		if (!best) {
			best = scraper;
		}

		if (scraper.ping < best.ping) {
			best = scraper;
		}
	});

	return best;
}

export class Scraper {
	private _url: string;
	private _ping: number;
	private _isWorking: boolean;

	constructor(url: string) {
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
	
	get isWorking(): boolean {
		return this._isWorking;
	}

}
