import Config from "../src/_Config";
import * as db from "../src/db/DBHandler";
import * as ScraperMgr from "../src/ScraperMgr";
import { exit } from "process";

import * as Exist from "../src/endpoints/exist";
import * as Fetch from "../src/endpoints/fetch";
import * as Progress from "../src/endpoints/progress";
import * as CreateEpub from "../src/endpoints/createEpub";


const TEST_FIC = { 
	site: "ffnet",
	//id: 6256154, // 10 chapters
	id: 13941037 // 1000+ chapters
};

try {
	db.init().then(async () => {
		console.log("Connected to DB.");

		// Testing scrapers listed
		//await ScraperMgr.testScrapers();

		console.info("Testing /exist/ endpoint");
		await Exist.ficExist(TEST_FIC).then((result) => {
			console.log("TEST: Fic exist? %s", result != null);
		});
		
		console.info("Testing /fetch/ endpoint");
		console.log("Fetching chapters...");
		let uuid = null;
		await Fetch.fetch(TEST_FIC).then(result => {
			if (result.errors?.length > 0) {
				throw result.errors[0];
			}

			console.log("uuid: %s", result.uuid);
			uuid = result.uuid;
		});
		
		console.info("Testing /progress/ endpoints");
		let ready = false;
		while (!ready) {
			const prog = await Progress.progress(uuid);
			if (prog.errors?.length > 0) {
				throw prog.errors[0];
			}
			ready = prog.ready;
			const percent = Math.round((prog.done / prog.total) * 100);
			console.log("Progress %s%, %s done, %s total", percent, prog.done, prog.total);

			await delay(500);
		}


		console.info("Testing /createEpub/ endpoints");
		const epub = await CreateEpub.createEpub(uuid);
		if (epub.errors?.length > 0) {
			throw epub.errors[0];
		}
		console.log(epub.filename);


		exit();
	}).catch((err) => { throw err; });

} catch (err) {
	console.error(err);
}


async function delay(timeMS: number) {
	return new Promise(resolve => setTimeout(resolve, timeMS));
}
