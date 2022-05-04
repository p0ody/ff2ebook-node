import { FanficHandler, FanficSite } from "../FanficHandler";
import { UrlTypeRequired } from "../GlobalEnums";
import Parser, { HTMLElement } from "node-html-parser";
import { Warning, FatalError } from "../ErrorTypes";
import { parse } from "path";
import { throws } from "assert";

export abstract class BaseSite {
	protected _site: FanficSite;
	protected _id: number;
	protected _uuid: string;
	protected _title?: string = null;
	protected _author?: string = null;
	protected _authorId?: number = null;
	protected _ficType?: string = null;
	protected _summary?: string = null;
	protected _published: number = 0;
	protected _updated: number = 0;
	protected _wordsCount: number = 0;
	protected _chapCount: number = 1;
	protected _isComplete?: boolean = null;
	protected _addInfos?: string = null;
	protected _baseUrl: string;

	protected chapterSource: string[] = new Array();
	protected parsedSource: HTMLElement[] = new Array();


	constructor(handler: FanficHandler) {
		this._site = handler.getSite;
		this._id = handler.getId;
		this._uuid = handler.getUUID;
	}

	public abstract getUrl(urlRequired?: UrlTypeRequired, chapNum?: number): string;

	public abstract getPageSource(chapNum: number): Promise<string | null>; // chapNum = 0 is considered to be the title page
	public async getParsedPageSource(chapNum: number): Promise<HTMLElement | null> {
		if (this.parsedSource[chapNum]) {
			return this.parsedSource[chapNum];
		}

		if (this.chapterSource[chapNum]) {
			return Parser(this.chapterSource[chapNum]);
		}

		const source = await this.getPageSource(chapNum);
		this.parsedSource[chapNum] = Parser(source);
		return this.parsedSource[chapNum];
	};
	
	protected abstract findTitle(parsedSource: HTMLElement): string;
	protected abstract findAuthor(parsedSource: HTMLElement): { authorName: string, authorId: number };
	protected abstract findFicType(parsedSource: HTMLElement): string;
	protected abstract findSummary(parsedSource: HTMLElement): string;
	protected abstract findDates(parsedSource: HTMLElement): { published: number, updated: number };
	protected abstract findWordsCount(parsedSource: HTMLElement): number;
	protected abstract findChapCount(parsedSource: HTMLElement): number;
	protected abstract findIsCompleted(parsedSource: HTMLElement): boolean;
	protected abstract findAddInfos(parsedSource: HTMLElement): string;

	public async populateData(): Promise<void> {
		const parsedSource = await this.getParsedPageSource(0);

		if (!parsedSource) {
			throw new FatalError("Couldn't fetch source pour title page.");
		}

		this.findTitle(parsedSource);
		this.findAuthor(parsedSource);
		this.findFicType(parsedSource);
		this.findSummary(parsedSource);
		this.findDates(parsedSource);
		this.findWordsCount(parsedSource);
		this.findChapCount(parsedSource);
		this.findIsCompleted(parsedSource);
		this.findAddInfos(parsedSource))
	}

	// Getters
	get site() {
		return this._site;
	}

	get id() {
		return this._id;
	}

	get title() {
		return this._title;
	}

	get authorName() {
		return this._author;
	}

	get authorId() {
		return this._authorId;
	}

	get ficType() {
		return this._ficType;
	}

	get summary() {
		return this._summary;
	}

	get publishedDate() {
		return this._published;
	}

	get updatedDate() {
		return this._updated;
	}

	get wordsCount() {
		return this._wordsCount;
	}

	get chapCount() {
		return this._chapCount;
	}

	get isCompleted() {
		return this._isComplete;
	}

	get addInfos() {
		return this._addInfos;
	}


	// Setters
	set site(site: FanficSite) {
		this._site = site;
	}

	set id(id: number) {
		this._id = id;
	}

	set title(title: string) {
		this._title = title;
	}

	set authorName(name: string) {
		this._author = name;
	}

	set authorId(id: number) {
		this._authorId = id;
	}

	set ficType(type: string) {
		this._ficType = type;
	}

	set summary(summary: string) {
		this._summary = summary;
	}

	set publishedDate(date: number) {
		this._published = date;
	}

	set updatedDate(date: number) {
		this._updated = date;
	}

	set wordsCount(count: number) {
		this._wordsCount = count;
	}

	set chapCount(count: number) {
		this._chapCount = count;
	}

	set isCompleted(complete: boolean) {
		this._isComplete = complete;
	}

	set addInfos(infos: string) {
		this._addInfos = infos;
	}
}
