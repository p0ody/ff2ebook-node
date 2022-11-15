import Zip from "adm-zip";
import { BaseSite } from "./sites/BaseSite";
import Config from "./_Config";
import fs from "fs";
const FileSystem = fs.promises;
import { Warning, FatalError } from "./ErrorTypes";
import * as Cheerio from "cheerio";
import { UrlTypeRequired } from "./GlobalEnums";
import { Log } from "./Utils";
import { EOL } from "os";
import * as Utils from "./Utils";


//const EPUB_TEMPLATE = loadTemplate(Config.Epub.templatePath);

/* const CHAPTER_TEMPLATE = FileSystem.readFile(__dirname + "/../files/chapter.xhtml")
	.then((buffer) => {
		console.log("chapter.xhtml loaded in memory.");
		return buffer.toString;
	}).catch((err: Error) => {
		throw new Error("FileSystem: " + err.message);
	});
 */


export async function create(fic: BaseSite) {
	const filename = `${fic.site}_${fic.id}_${fic.updatedDate}.epub`;
	const tempFile = `${Config.App.ficTempDir}/${filename}`;
	await createOutputDir().catch((err) => {
		throw new FatalError(err);
	});

	await copyTemplate(tempFile).catch(err => {
		throw new FatalError(err);
	});

	const epub = new Zip(tempFile);

	await Promise.all([
		updateTitlePage(fic, epub),
		createChapters(fic, epub),
		updateManifest(fic, epub),
		updateTOC(fic, epub),
	]).then(() => {
		epub.writeZip(tempFile);
	}).catch(err => {
		throw new FatalError(err);
	})
	/* updateTitlePage(fic, epub).catch(err => {
		throw new FatalError(err);
	});

	createChapters(fic, epub).catch(err => {
		throw new FatalError(err);
	}); */

	

	return filename;
}

async function createOutputDir() {
	if (!fs.existsSync(Config.App.ficArchiveDir)) {
		await FileSystem.mkdir(Config.App.ficArchiveDir);
		Log.debug("Created %s dir.", Config.App.ficArchiveDir);
	}

	if (!fs.existsSync(Config.App.ficTempDir)) {
		await FileSystem.mkdir(Config.App.ficTempDir);
		Log.debug("Created %s dir.", Config.App.ficTempDir);
	}

	if (!(fs.existsSync(Config.App.ficArchiveDir) && fs.existsSync(Config.App.ficTempDir))) {
		throw new Error("Couldn't create archive dir.")
	}
}

async function copyTemplate(newFile: string) {
	if (fs.existsSync(newFile)) { // If file already exist, delete
		Log.debug("%s file exist, deleting...", newFile);
		await FileSystem.rm(newFile).catch((err) => {
			throw new Error("Couldn't remove existing file.");
		});
	}

	await FileSystem.copyFile(Config.Epub.templatePath, newFile).catch((err) => {
		throw new Error("Couldn't create epub.");
	});
}


async function updateTitlePage(fic: BaseSite, epub: Zip): Promise<void> {
	const titlePagePath = "OEBPS/Content/title.xhtml";
	const titlePage = epub.getEntry(titlePagePath);

	const $ = Cheerio.load(titlePage.getData(), { xml:true }, false);
	if ($.length === 0) {
		throw new Error("Couldn't parse title page.");
	}

	const numberFormat = new Intl.NumberFormat("en-US");
	const dateFormat = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});
	$("title").text(`${fic.title} - ${fic.authorName}`);
	$("#fic-title > a").attr("href", fic.getUrl(UrlTypeRequired.titlePage));
	$("#fic-title > a").text(fic.title);
	$("#fic-author > a").attr("href", fic.getUrl(UrlTypeRequired.author));
	$("#fic-author > a").text(fic.authorName);
	updateText($, "#summary", fic.summary);
	updateText($, "#completed", fic.isCompleted ? "Completed" : false);
	updateText($, "#ficType", fic.ficType);
	updateText($, "#addInfos", fic.addInfos);
	updateText($, "#published", dateFormat.format(new Date(fic.publishedDate * 1000)));
	updateText($, "#updated", dateFormat.format(new Date(fic.updatedDate * 1000)));
	updateText($, "#wordsCount", numberFormat.format(fic.wordsCount));
	updateText($, "#chapCount", fic.chapCount);
	$("#createdOn").text(dateFormat.format(Date.now()));

	Log.debug("Saving title page...");
	epub.updateFile(titlePage, Buffer.from($.html()));
}

async function createChapters(fic: BaseSite, epub: Zip): Promise<void> {
	const chapterPagePath = "OEBPS/Content/chapterx.xhtml";
	const chapterPage = epub.getEntry(chapterPagePath);

	const $ = Cheerio.load(chapterPage.getData(), { 
		xml: { 
			xmlMode: true, 
			recognizeSelfClosing: true
		} 
	}, false);
	if ($.length === 0) {
		throw new Error("Couldn't parse chapter page.");
	}
	for (let i = 1; i <= fic.chapCount; i++) {
		$("title").text(fic.getChapter(i).title);
		$("#chap-title").text(`${fic.getChapter(i).num}. ${fic.getChapter(i).title}`);
		$("#chap-text").html(Utils.closeHtmlTags(fic.getChapter(i).text));

		epub.addFile(`OEBPS/Content/chapter${i}.xhtml`, Buffer.from($.html()));
	}

	Log.debug("Saving chapter pages...");
	epub.deleteFile(chapterPage);
}

async function updateManifest(fic: BaseSite, epub: Zip) {
	if (!fic) {
		throw new Error("Fic data unavailable.");
	}
	
	const contentPath = "OEBPS/content.opf";
	const content = epub.getEntry(contentPath);

	if (!content) {
		throw new Error("Couldn't open content.opf");
	}

	const $ = Cheerio.load(content.getData(), { xml: true, xmlMode: true }, false);
	if ($.length === 0) {
		throw new Error("Couldn't parse content.opf.");
	}

	// Update meta data
	let meta = $("metadata").html();
	// Using replace because Cheerio doesn't work with custom pseudo alss (dc:title...)
	meta = meta.replaceAll("%title%", fic.title);
	meta = meta.replaceAll("%desc%", fic.summary);
	meta = meta.replaceAll("%uuid%", fic.uuid);
	meta = meta.replaceAll("%author%", fic.authorName);

	$("metadata").html(meta);

	let newManifest = $("manifest").html();
	let spine = $("spine").html();
	for (let i = 1; i <= fic.chapCount; i++) {
		newManifest += `<item id="chap${i}" href="Content/chapter${i}.xhtml" media-type="application/xhtml+xml" />` + EOL;
		spine += `<itemref idref="chap${i}" />` + EOL;
	}

	$("manifest").html(newManifest);
	$("spine").html(spine);
	Log.debug("Saving content.opf...");
	epub.updateFile(content, Buffer.from($.html()));
}

async function updateTOC(fic: BaseSite, epub: Zip) {
	if (!fic) {
		throw new Error("Fic data unavailable.");
	}
	
	const tocPath = "OEBPS/toc.ncx";
	const toc = epub.getEntry(tocPath);

	if (!toc) {
		throw new Error("Couldn't open toc.ncx");
	}

	const $ = Cheerio.load(toc.getData(), { xml: true, xmlMode: true }, false);
	if ($.length === 0) {
		throw new Error("Couldn't parse toc.ncx.");
	}

	$("meta").attr("content", fic.uuid);

	let newTOC = $("navMap").html();
	for (let i = 1; i <= fic.chapCount; i++) {
		newTOC += `<navPoint id="navPoint-${i + 1}" playOrder="${i + 1}"><navLabel><text>${i}. ${fic.getChapter(i).title}</text></navLabel><content src="Content/chapter${i}.xhtml"/></navPoint>` + EOL;
	}

	$("navMap").html(newTOC);
	Log.debug("Saving toc.ncx...");
	epub.updateFile(toc, Buffer.from($.html()));
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
}

interface DirElement {
	path: string;
	isDir: boolean;
	child?: DirElement[];
}