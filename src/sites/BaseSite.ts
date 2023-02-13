import FanficHandler from "../FanficHandler";
import { UrlTypeRequired } from "../GlobalEnums";
import * as Cheerio from "cheerio";
import Chapter from "../Chapter";
import QueueMgr from "../QueueMgr";
import * as FanficSite from "../FanficSites";
import Config from "../_Config";
import Warning from "../Warning"

export abstract class BaseSite {
	protected _baseUrl: string
	protected _site: FanficSite.Sites;
	protected _id: number;
	protected _uuid: string;
	protected _title: string;
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
	protected _warnings: Warning[]  = [];
	protected _errors: Error[] = [];

	protected chapterSource: string[] = [];
	protected parsedSource: Cheerio.CheerioAPI[] = [];
	protected _chapters: Chapter[] = [];
	protected _progress: number = 0;
	protected _queue: QueueMgr;


	constructor(handler: FanficHandler) {
		this._id = handler.id;
		this._uuid = handler.UUID;
		this._queue = new QueueMgr(Config.Scraper.maxAsync, (Config.Scraper.timeoutMS * Config.Scraper.maxRetry)*1.5, 300);
	}

	public abstract getUrl(urlRequired?: UrlTypeRequired, chapNum?: number): string;

	public abstract getPageSource(chapNum: number, lightVersion: boolean): Promise<string | null>; // chapNum = 0 is considered to be the title page
	public async getParsedPageSource(chapNum: number, lightVersion: boolean): Promise<Cheerio.CheerioAPI | null> {
		if (this.parsedSource[chapNum]) {
			return this.parsedSource[chapNum];
		}

		if (this.chapterSource[chapNum]) {
			this.parsedSource[chapNum] = Cheerio.load(this.chapterSource[chapNum]);
			return this.parsedSource[chapNum];
		}

		const source = await this.getPageSource(chapNum, lightVersion);
		this.parsedSource[chapNum] = Cheerio.load(source);

		if (!this.parsedSource[chapNum]) {
			throw new Error("Couldn't parse html for chapter #"+ chapNum);
		}
		return this.parsedSource[chapNum];
	};

	protected async getChapters() {
		// Adding a queue so it doesn't just flood the scraper with like 800 request at the same time preventing other request being processed.
		for (let i = 1; i <= this.chapCount; i++) {
			if (this.chapters[i]) {
				continue;
			}
			this._queue.push(async (index: number) => {   
				const element = await this.getParsedPageSource(index, true)
				if (!element) {
					throw new Error("No parsed source.");
				}
				this._progress++;
				this.chapters[index] = this.findChapterData(index, element);
			}, i);
		}
	}

	
	// Step 1
	protected abstract findTitle(parsedSource: Cheerio.CheerioAPI): string;
	protected abstract findAuthor(parsedSource: Cheerio.CheerioAPI): { authorName: string, authorId: number };
	protected abstract findFicType(parsedSource: Cheerio.CheerioAPI): string;
	protected abstract findSummary(parsedSource: Cheerio.CheerioAPI): string;
	protected abstract findDates(parsedSource: Cheerio.CheerioAPI): { published: number, updated: number };
	protected abstract findWordsCount(parsedSource: Cheerio.CheerioAPI): number;
	protected abstract findChapCount(parsedSource: Cheerio.CheerioAPI): number;
	protected abstract findIsCompleted(parsedSource: Cheerio.CheerioAPI): boolean;
	protected abstract findAddInfos(parsedSource: Cheerio.CheerioAPI): string;

	// Step 2
	protected abstract findChapterData(chapNum: number, parsedSource: Cheerio.CheerioAPI): Chapter;

	public async populateData(): Promise<void> {
		const parsedSource = await this.getParsedPageSource(0, false);

		if (!parsedSource) {
			throw new Error("Couldn't fetch source pour title page.");
		}

		this.findTitle(parsedSource);
		this.findAuthor(parsedSource);
		this.findFicType(parsedSource);
		this.findSummary(parsedSource);
		this.findDates(parsedSource);
		this.findWordsCount(parsedSource);
		this.findChapCount(parsedSource);
		this.findIsCompleted(parsedSource);
		this.findAddInfos(parsedSource);

		this.getChapters();
	}

	public addWarning(warnText: string) {
		this._warnings.push(new Warning(warnText));
	}

	public addError(error: Error) {
		this._errors.push(error);
	}

	// Getters
	get domain() {
		return FanficSite.getDomain(this.site);
	}

	get baseUrl() {
		return this._baseUrl;
	}

	get site() {
		return this._site;
	}

	get id() {
		return this._id;
	}

	get uuid() {
		return this._uuid;
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

	get getProgress() {
		return this._progress;
	}

	get warnings(): Warning[] {
		return this._warnings.splice(0, this._warnings.length);
	}

	get errors(): Error[] {
		return this._errors;
	}

	get chapters() {
		return this._chapters;
	}

	getChapter(num: number) {
		return this.chapters[num];
	}

	get queueMgr(): QueueMgr {
		return this._queue;
	} 

	// Setters

	set site(site: FanficSite.Sites) {
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
