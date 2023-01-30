import Fastify from "fastify";
import Config from "./_Config";
import * as db from "./db/DBHandler";
import * as ScraperMgr from "./ScraperMgr";
import importEndpoints from "./endpoints/importEndpoints";

const server = Fastify({ logger: false, ignoreTrailingSlash: true });
server.register(require("fastify-cors"), { 
	methods: ['GET', 'POST'],
	origin: true 
});
importEndpoints(server);

server.after((err) => {
	if (err) {
		console.error(err);
	};
})

try {
	db.init().then(async () => {
		await server.listen(Config.App.listenPort);
		console.info("Listening on port %i...", Config.App.listenPort);
		await ScraperMgr.testScrapers();
		setInterval(() => {
			ScraperMgr.testScrapers();
			
		}, Config.Scraper.testIntervalSecs * 1000);
		
	})
	.catch((err) => { throw err; });
} catch (err) {
	console.error(err);
}


process.on("uncaughtException", (err) => {
	console.error(err);
});
