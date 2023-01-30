import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as db from "../db/DBHandler";
import * as FanficSite from "../FanficSites";
import * as Utils from "../Utils";

export interface Params {
	site: string;
	id: number;
}

export async function handler(request: FastifyRequest) {
	const params = request.params as Params;

	if (!Utils.enumContains(params.site, FanficSite.Sites)) {
		return { error: "Invalid site." };
	}

	if (!params.id) {
		return { error: "No id provided." };
	}

	
	
	return await ficExist(params);
}

export async function postHandler(request: FastifyRequest) {
	console.log("Received POST");
	console.log(request.query);
	return { test: "lol" };
}

export async function ficExist(params: Params) {
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

	return result;
}

export default function (router:FastifyInstance, opts: any, next: Function) {
	router.get("/exist/:site/:id", handler);
	router.post("/exist/", postHandler);

	next();
} 
