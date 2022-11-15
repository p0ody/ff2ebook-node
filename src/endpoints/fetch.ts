import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import FanficHandler from "../FanficHandler";
import * as FanficSite from "../FanficSites";
import * as Utils from "../Utils";
import * as RequestMgr from "../RequestMgr";

interface Params {
	site: string;
	id: number;
}

interface Return {
	uuid?: string;
	ficId?: number;
	error?: string;
}


async function handler(request: FastifyRequest, reply: FastifyReply) {
	const params = request.params as Params;

	if (!Utils.enumContains(params.site, FanficSite.Sites)) {
		return { error: "Invalid site." };
	}

	if (!params.id) {
		return { error: "No id provided." };
	}

	return await fetch(params);
}

export async function fetch(params: Params): Promise<Return> {
	const handler = new FanficHandler(params.site as FanficSite.Sites, params.id);
	if (!handler) {
		return { error: "Unknown error." };
	}
	RequestMgr.addRequest(handler);
	handler.fetchFic();

	const toSend = {
		uuid: handler.UUID,
		ficId: handler.id,
	};

	return toSend;
}

export default function (router: FastifyInstance, opts: any, next: Function) {
	router.get("/fetch/:site/:id", handler);

	next();
} 
