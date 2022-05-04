import Fastify from "fastify";
import exist from "../endpoints/exist"
import fetch from "../endpoints/fetch"
import Config from "./_Config";
import * as db from "./db/DBHandler";

const server = Fastify({ logger: false });

server.register(exist, fetch);

try {
	db.init().then(async () => {
		await server.listen(Config.App.listenPort);
		console.info("Listening on port %i...", Config.App.listenPort);
	})
	.catch((err) => { throw err; });
} catch (err) {
	console.error(err);
}


process.on("uncaughtException", (err) => {
	console.error(err);
});
