import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as db from "../db/DBHandler";
import * as Utils from "../Utils";
import * as FanficSites from "../FanficSites";
import { ErrorType, errorGenerator, FrontendError } from "../FrontendInterface";

export interface Params {
	site: string;
	id: number;
}

interface Response {
	exist?: boolean,
	site?: string
	id?: number,
	errors?: FrontendError[],
}

export async function handler(request: FastifyRequest): Promise<Response> {
	const params = request.params as Params;

	try {
		if (!Utils.enumContains(params.site, FanficSites.Sites)) {
			throw new Error("Invalid site.");
		}
	
		if (!params.id) {
			throw new Error("No id provided.");
		}
	} catch(err) {
		if (err instanceof Error) {
			return { 
				errors: [errorGenerator(ErrorType.critical, err.message)] 
			};
		}
	}
	
	const result = await ficExist(params);
	return { 
		exist: result != null,
		site: params.site,
		id: params.id };
}

interface ExistPostRequests {
	url: string,
}

export async function postHandler(request: FastifyRequest): Promise<Response> {
	try {
		const data = request.body as ExistPostRequests;
		request.params = FanficSites.parseUrl(data.url);
		return handler(request)
	} catch (err) {
		if (err instanceof Error) {
			return { 
				errors: [errorGenerator(ErrorType.critical, err.message)] 
			};
		}
		
	}
}

export async function ficExist(params: Params) {
	const result = await db.models.FicArchive.findOne({
		where: {
			site: params.site,
			id: params.id
		},
		attributes: [
			"title",
			"author",
			"id",
			"updated",
			"lastChecked",
			"filename",
		],
		order: [["updated", "DESC"]]
	});
	return result;
}

export default function (router:FastifyInstance, opts: any, next: Function) {
	router.get("/exist/:site/:id", handler);
	router.post("/exist/", postHandler);

	next();
} 
