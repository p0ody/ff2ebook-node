import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { FanficSite, FanficHandler } from "../src/FanficHandler";
import * as Utils from "../src/Utils";
import Crypto from "crypto";

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

	const handler = new FanficHandler(params.site as FanficSite, params.id);
	if (!handler) {
		reply.send({ error: "Unknown error." });
	}

	handler.fetchFic();
	
	const toSend = {
		uuid: handler.getUUID,
		ficId: handler.getId,
	};
	reply.send(toSend);
}

export default function (router: FastifyInstance) {
	return router.get("/fetch/:site/:id", handler)
} 
