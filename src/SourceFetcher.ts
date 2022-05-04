import Config from "./_Config";
import Axios from "axios";

export async function useScraper(url: string): Promise<string | null> {
	const scraperUrl = Config.App.scraperUrl + url;
	const res = await Axios.get(scraperUrl);

	if (res.status != 200) {
		return null;
	}

	return res.data;
}
