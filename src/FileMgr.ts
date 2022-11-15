import { BaseSite } from "./sites/BaseSite";
import * as Cheerio from "cheerio";
import fs from "fs";
import { UrlTypeRequired } from "./GlobalEnums";
import Chapter from "./Chapter";
const FileSystem = fs.promises;

/* // Load required files in memory
const fileTemplate = { 
	style: null as string,
	title: null as string,
	chapter: null as string,
}

FileSystem.readFile(__dirname + "/../files/style.css")
.then((buffer) => {
	console.log("style.css loaded in memory.");
	fileTemplate.style = buffer.toString();
}).catch((err: Error) => {
	throw new Error("FileSystem: " + err.message);
});

FileSystem.readFile(__dirname + "/../files/title.xhtml")
.then((buffer) => {
	console.log("title.xhtml loaded in memory.");
	fileTemplate.title = buffer.toString();
}).catch((err: Error) => {
	throw new Error("FileSystem: " + err.message);
});

FileSystem.readFile(__dirname + "/../files/chapter.xhtml")
.then((buffer) => {
	console.log("chapter.xhtml loaded in memory.");
	fileTemplate.chapter = buffer.toString();
}).catch((err: Error) => {
	throw new Error("FileSystem: " + err.message);
});


function updateTitlePage(fic: BaseSite): string {
	const $ = Cheerio.load(fileTemplate.title, { xml:true }, false);
	if ($.length === 0) {
		throw new Error("Couldn't parse title page.");
	}

	const numberFormat = new Intl.NumberFormat("en-US");
	const dateFormat = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});

	$("#fic-title > a").attr("href", fic.getUrl(UrlTypeRequired.titlePage));
	$("#fic-author > a").attr("href", fic.getUrl(UrlTypeRequired.author));
	updateText($, "#summary", fic.summary);
	updateText($, "#completed", fic.isCompleted ? "Completed" : false);
	updateText($, "#ficType", fic.ficType);
	updateText($, "#addInfos", fic.addInfos);
	updateText($, "#published", dateFormat.format(new Date(fic.publishedDate * 1000)));
	updateText($, "#updated", dateFormat.format(new Date(fic.updatedDate * 1000)));
	updateText($, "#wordsCount", numberFormat.format(fic.wordsCount));
	updateText($, "#chapCount", fic.chapCount);
	$("#createdOn").text(dateFormat.format(Date.now()));

	Intl.NumberFormat("en-US")

	return $.html();
}

function createChapters(chapter: Chapter): string {
	const $ = Cheerio.load(fileTemplate.chapter, { xml: true }, false);
	if ($.length === 0) {
		throw new Error("Couldn't parse chapter page.");
	}

	$("#chap-title").text(`${chapter.num}. ${chapter.title}`);
	$("#chap-text").html(chapter.text);
	return $.html();
}

function updateText(parsedHtml: Cheerio.CheerioAPI, selector: string, value: any) {
	const $ = parsedHtml;

	const element = $(selector);

	if (!value) {
		element.remove();
		return $;
	}

	element.text(element.text() + value);

	return $;
} */

interface DirElement {
	path: string;
	isDir: boolean;
	child?: DirElement[];
}

export async function getFilesInDirRecursive(dir: string): Promise<DirElement[]> {
	let fileList: DirElement[] = [];
	const entries = await FileSystem.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const name = `${dir}/${entry.name}`;
		if (entry.isDirectory()) {
			const nextDir = entry.name;
			fileList.push({ 
				path: name, 
				isDir: true,
				child: await getFilesInDirRecursive(name)});
		}
		if (entry.isFile()) {

			const file = {
				path: name,
				isDir: false,
			}
			fileList.push(file);
		}
	}

	return fileList;
}
