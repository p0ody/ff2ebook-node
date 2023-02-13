import { BaseSite } from "./BaseSite";
import { UrlTypeRequired } from "../GlobalEnums";
import * as SourceFetcher from "../SourceFetcher";
import * as Cheerio from "cheerio";
import Chapter from "../Chapter";
import * as FanficSite from "../FanficSites";

export default class extends BaseSite {
	_site = FanficSite.Sites.FFNET;
	_baseUrl = "https://www."+ this.domain;
	
	getUrl(urlRequired?: UrlTypeRequired, chapNum: number = 1): string {
		switch(urlRequired) {
			case UrlTypeRequired.titlePage:
				return this.baseUrl +"/s/"+ this.id;
			
			case UrlTypeRequired.chapter:
				return this.baseUrl + "/s/" + this.id +"/"+ chapNum;

			case UrlTypeRequired.author:
				return this.baseUrl + "/u/" + this.authorId;

			default:
				return this.baseUrl;
		}
	}

	async getPageSource(chapNum: number = 0, lightVersion: boolean = false): Promise<string | null> {
		if (this.chapterSource[chapNum]) {
			return this.chapterSource[chapNum];
		}

		let lookupChapNum = chapNum;

		if (chapNum === 0 ) {
			lookupChapNum = 1;
		}

		let url = this.getUrl(UrlTypeRequired.chapter, lookupChapNum);
		if (lightVersion) {
			url = url.replace("www", "m");
		}
		const source = await SourceFetcher.useScraper(url , (response) => {
			if (chapNum < 1) {
				return true;
			}
			try {
				this.chapterSource[chapNum] = response.data;
				this.parsedSource[chapNum] = Cheerio.load(response.data);
				this.findChapterData(chapNum, this.parsedSource[chapNum]);
				// Check if an error happen when trying to find chapter data.
			} catch (err) {
				console.log("Error in checking chapter data: %s", err);
				return false;
			}
			return true;
		});

		if (!source) {
			throw new Error("Couldn't fetch source.");
		}

		this.chapterSource[chapNum] = source;
		this.parsedSource[chapNum] = Cheerio.load(source);
		return source;
	}

	protected findTitle(parsedSource: Cheerio.CheerioAPI): string {
		const title = parsedSource("b.xcontrast_txt");
		if (title.length === 0) {
			throw new Error("Couldn't find title.");
		}

		this.title = title.text();
		return title.text();
	}

	protected findAuthor(parsedSource: Cheerio.CheerioAPI): { authorName: string, authorId: number } {
		const author = parsedSource("#profile_top > a[href*=/u/]");
		if (author.length === 0) {
			throw new Error("Couldn't find author information");
		}


		this.authorName = author.text();
		const regex = /\/u\/([0-9]+)/si;
		this.authorId = parseInt(regex.exec(author.attr("href"))[1]);
		return { authorName: this.authorName, authorId: this.authorId };
	}

	protected findFicType(parsedSource: Cheerio.CheerioAPI): string {
		const ficType = parsedSource("#pre_story_links > span.lc-left");
		if (ficType.length === 0) {
			this.addWarning("Couldn't find fic type.");
		}

		this.ficType = ficType.text();
		return ficType.text();
	}

	protected findSummary(parsedSource: Cheerio.CheerioAPI): string {
		const summary = parsedSource("#profile_top > div.xcontrast_txt");
		if (summary.length === 0) {
			this.addWarning("Couldn't find summary.");
		}
		
		this.summary = summary.text();
		return summary.text();
	}

	protected findDates(parsedSource: Cheerio.CheerioAPI): { published: number, updated: number } {
		const selected = parsedSource("#profile_top > span > span[data-xutime]");
		//const updated = parsedSource.querySelector("#profile_top > div.xcontrast_txt");

		if (selected.length === 0) {
			throw new Error("Couldn't find published date.");
		}

		// if more than on element is found.
		if (selected.length > 1) {
			this.publishedDate = parseInt(selected.eq(1).attr("data-xutime")); // Second element found id published date
			this.updatedDate = parseInt(selected.eq(0).attr("data-xutime")); // First element is updated date
		}
		else { // If updated time is not available, use published time.
			const date = parseInt(selected.attr("data-xutime"));
			this.publishedDate = date;
			this.updatedDate = date;
		}
		
		return { published: this.publishedDate, updated: this.updatedDate };
	}

	protected findWordsCount(parsedSource: Cheerio.CheerioAPI): number {
		const selected = parsedSource("#profile_top > span.xgray");

		if (selected.length === 0) {
			this.addWarning("Couldn't find words count.");
		}

		const regex = /Words: (.+?) -/si;
		const result = regex.exec(selected.text());
		if (!result) {
			this.addWarning("Couldn't find words count.");
		}
		const count = parseInt(result[1].replace(",", ""));
		this.wordsCount = count;
		return count;
	}

	protected findChapCount(parsedSource: Cheerio.CheerioAPI): number {
		const selected = parsedSource("#chap_select").eq(0);
		let count = 1; // If we dont find the chapter selection, assume it has only one chapter.
		if (selected.length > 0) {
			count = selected.children().length;
		}

		this.chapCount = count;
		return count;
	}

	protected findIsCompleted(parsedSource: Cheerio.CheerioAPI): boolean {
		const selected = parsedSource("#profile_top > span.xgray");

		if (selected.length === 0) {
			return false;
		}

		this.isCompleted = selected.text().includes("Status: Complete");
		return this.isCompleted;
	}

	/** Additionals information such as character or pairing */
	protected findAddInfos(parsedSource: Cheerio.CheerioAPI): string {
		const selected = parsedSource("#profile_top > span.xgray");

		if (selected.length === 0) {
			return null;
		}

		// ex:		Fiction M - English - Horror/Supernatural - Harry P. - Chapters: 10
		const regex = /.+?-.+?- (.+?) - (?:Chapters|Words)/si;
		let infos = regex.exec(selected.text());
		if (infos) {
			this.addInfos = infos[1];
			return infos[1];
		}

		return null;
	}

	protected findChapterData(chapNum:number, parsedSource: Cheerio.CheerioAPI): Chapter {
		const titleElement = parsedSource("#content");

		if (titleElement.length === 0) {
			throw new Error(`Couldn't find chapter #${chapNum} data.`);
		}

		const titleRegex = /Chapter [0-9]+(?:\: )*(.*)/si
		const result = titleRegex.exec(titleElement.text());

		let chapTitle = null;
		if (!result || result[1].length === 0) {
			this.addWarning("Couldn't find chapter #"+ chapNum +" title.");
		}
		else {
			chapTitle = result[1];
		}

		if (!chapTitle) { // If no title found, create a generic chapter name
			chapTitle = `Chapter ${chapNum}`;
		}

		const text = parsedSource("#storycontent");
		return { num: chapNum, title: chapTitle, text: text.html() };
	}
}
