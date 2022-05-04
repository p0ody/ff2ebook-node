import { BaseSite} from "./BaseSite";
import { UrlTypeRequired } from "../GlobalEnums";
import * as SourceFetcher from "../SourceFetcher";
import Parser, { HTMLElement } from "node-html-parser";
import { Warning, FatalError } from "../ErrorTypes";
import { parse } from "path";

export default class extends BaseSite {
	baseUrl = "https://www.fanfiction.net";
	

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

	async getPageSource(chapNum: number = 0): Promise<string | null> {
		if (this.chapterSource[chapNum]) {
			return this.chapterSource[chapNum];
		}

		if (chapNum === 0 ) {
			chapNum = 1;
		}
		const source = await SourceFetcher.useScraper(this.getUrl(UrlTypeRequired.chapter, chapNum));

		if (!source) {
			throw new FatalError("Couldn't fetch source.");
		}

		this.chapterSource[chapNum] = source;
		this.parsedSource[chapNum] = Parser(source);
		return source;
	}

	protected findTitle(parsedSource: HTMLElement): string {
		const title = parsedSource.querySelector("b.xcontrast_txt");
		if (!title) {
			throw new FatalError("Couldn't find title.");
		}

		this.title = title.innerText;
		return title.innerText;
	}

	protected findAuthor(parsedSource: HTMLElement): { authorName: string, authorId: number } {
		const author = parsedSource.querySelector("#profile_top > a[href*=/u/]");
		if (!author) {
			throw new FatalError("Couldn't find author information");
		}


		this.authorName = author.innerText;
		const regex = /\/u\/([0-9]+)/si;
		this.authorId = parseInt(regex.exec(author.attributes.href)[1]);
		return { authorName: this.authorName, authorId: this.authorId };
	}

	protected findFicType(parsedSource: HTMLElement): string {
		const ficType = parsedSource.querySelector("#pre_story_links > span.lc-left");
		if (!ficType) {
			throw new Warning("Couldn't find fic type.");
		}

		this.ficType = ficType.innerText;
		return ficType.innerText;
	}

	protected findSummary(parsedSource: HTMLElement): string {
		const summary = parsedSource.querySelector("#profile_top > div.xcontrast_txt");
		if (!summary) {
			throw new Warning("Couldn't find summary.");
		}
		
		this.summary = summary.innerText;
		return summary.innerText;
	}

	protected findDates(parsedSource: HTMLElement): { published: number, updated: number } {
		const selected = parsedSource.querySelectorAll("#profile_top > span > span[data-xutime]");
		//const updated = parsedSource.querySelector("#profile_top > div.xcontrast_txt");

		if (!selected) {
			throw new FatalError("Couldn't find published date.");
		}

		this.publishedDate = parseInt(selected[0].attributes["data-xutime"]);
		this.updatedDate = selected[1] ? parseInt(selected[1].attributes["data-xutime"]) : this.publishedDate; // If updated time is not available, use published time.
		
		return { published: this.publishedDate, updated: this.updatedDate };
	}

	protected findWordsCount(parsedSource: HTMLElement): number {
		const selected = parsedSource.querySelector("#profile_top > span.xgray");

		if (!selected) {
			throw new Warning("Couldn't find words count.");
		}

		const regex = /Words: (.+?) -/si;
		const result = regex.exec(selected.innerText);
		if (!result) {
			throw new Warning("Couldn't find words count.");
		}
		const count = parseInt(result[1].replace(",", ""));
		this.wordsCount = count;
		return count;
	}

	protected findChapCount(parsedSource: HTMLElement): number {
		const selected = parsedSource.getElementById("chap_select");
		let count = 1; // If we dont find the chapter selection, assume it has only one chapter.
		if (selected) {
			count = selected.childNodes.length;
		}

		this.chapCount = count;
		return count;
	}

	protected findIsCompleted(parsedSource: HTMLElement): boolean {
		const selected = parsedSource.querySelector("#profile_top > span.xgray");

		if (!selected) {
			return false;
		}

		this.isCompleted = selected.innerText.includes("Status: Complete");
		return this.isCompleted;
	}

	/** Additionals information such as character or pairing */
	protected findAddInfos(parsedSource: HTMLElement): string {
		const selected = parsedSource.querySelector("#profile_top > span.xgray");

		if (!selected) {
			return null;
		}
		
		// ex:		Fiction M - English - Horror/Supernatural - Harry P. - Chapters: 10
		const regex = /.+?-.+?- (.+?) - (?:Chapters|Words)/si;
		let infos = regex.exec(selected.innerText);
		if (infos) {
			this.addInfos = infos[1];
			return infos[1];
		}

		return null;
	}
}
