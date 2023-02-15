import Config from "./_Config";
import Axios, { AxiosResponse } from "axios";
import Retry from "./Retry"
import * as ScraperMgr from "./ScraperMgr";
import * as TC from "./TimeConversion";


export async function useScraper(url: string, checkFunction?: (response: AxiosResponse) => boolean, retry = Config.Scraper.maxRetry, scraper?: ScraperMgr.Scraper): Promise<string | null> {
	const useProvidedScraper = (scraper != null);
	const res = await Retry(retry, async () => {
		if (!useProvidedScraper) {
			scraper = ScraperMgr.getBestScraper();
		}

		updateQueueLength(scraper);
		const getUrl = `${scraper.url}/?url=${url}`;
		let timer = Date.now();
		scraper.queueLength = scraper.queueLength + 1; // Adding 1 to queue instead of relying on the endpoint request because at the start it just sent evenrything to the same scraper
		const res = await Axios.get(getUrl, { timeout: Config.Scraper.timeoutSec * TC.SECS_TO_MS }).catch((err) => {
			console.error("Axios Error : %s on url: %s", err.code, getUrl);
			scraper.isWorking = false;
		});	
		scraper.ping = Date.now() - timer;
		if (!res || res.status != 200) {
			scraper.isWorking = false;
			return null;
		}	
		if (res.data.includes("404 oops: file not found")) {
			return null;
		}
		scraper.isWorking = true;

		if (checkFunction) {
			if (!checkFunction(res)) {
				return null;
			}
		}

		return res;
	}).catch((err) => { console.log(err) });
	
	return res.data;
}

export async function updateQueueLength(scraper: ScraperMgr.Scraper): Promise<void> {
	const getUrl = `${scraper.url}/queue`;
	
	const res = await Axios.get(getUrl).catch((err) => {
		console.error("Axios: Error getting url: %s", getUrl);
	});	
	if (!res || res.status != 200) {
		return;
	}	

	const length = parseInt(res.data);
	if (Number.isNaN(length)) {
		return;
	}

	scraper.queueLength = length;
}
