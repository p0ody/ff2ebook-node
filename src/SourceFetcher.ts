import Config from "./_Config";
import Axios from "axios";
import Retry from "./Retry"
import * as ScraperMgr from "./ScraperMgr";

export async function useScraper(url: string, retry = Config.Scraper.maxRetry, scraper?: ScraperMgr.Scraper): Promise<string | null> {
	if (!scraper) {
		scraper = ScraperMgr.getBestScraper();
	}

	const res = await Retry(retry, async () => {
		const getUrl = scraper.url + url;
		const res = await Axios.get(getUrl).catch((err) => {
			console.error("Axios: Error getting url: %s", getUrl);
			return null;
		});	
		if (!res || res.status != 200 || res.data.includes("404 oops: file not found")) {
			return null;
		}	
		return res
	});

	return res.data;
}
