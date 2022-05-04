import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as db from "../src/db/DBHandler";
import { FanficSite } from "../src/FanficHandler";
import * as Utils from "../src/Utils";

const router = Fastify();

export interface Params {
	site: string;
	id: number;
}

async function handler(request: FastifyRequest, reply: FastifyReply) {
	const params = request.params as Params;

	if (!Utils.enumContains(params.site, FanficSite)) {
		reply.send({ error: "Invalid site." });
		return;
	}

	if (!params.id) {
		reply.send({ error: "No id provided." });
		return;
	}

	const result = await db.models.FicArchive.findOne({ 
		where: {
			site: params.site, 
			id: params.id 
		},
		attributes: [
			"id",
			"updated",
			"lastChecked",
		]
	});
	
	reply.send(result);
}

export default function (router:FastifyInstance) {
	return router.get("/exist/:site/:id", handler)
} 
