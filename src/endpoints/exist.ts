import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as db from "../db/DBHandler";
import * as Utils from "../Utils";
import * as FanficSites from "../FanficSites";
import { ErrorType, errorGenerator, FrontendError } from "../FrontendInterface";
import FanficHandler from "../FanficHandler";
import Config from "../_Config";
import * as TC from "../TimeConversion";

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
	let exist = result != null;

	// if the fic exist in DB, Check if the difference between the last time it was checked and now is over maxArchiveAgeHours, if if is, consider the cached version not up to date.
	if (exist && (Date.now()/TC.SECS_TO_MS) - result.lastChecked > Config.App.maxArchiveAgeHours*TC.HOURS_TO_SECS) {
		// Check if update date from ff site is greater than what we have cached, if so, request an update.
		const updatedDate = await getUpdatedDate(params.site as FanficSites.Sites, params.id);
		exist = updatedDate >= result.updated;
	}

	return { 
		exist: exist,
		site: params.site,
		id: params.id 
	};
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

	db.models.FicArchive.update({ lastChecked: Date.now()/TC.SECS_TO_MS }, { where: { id: params.id, site: params.site }});
	return result;
}

async function getUpdatedDate(site: FanficSites.Sites, id: number) {
	const handler = new FanficHandler(site, id);
	await handler.fetchFicInfos();
	return handler.siteHandler.updatedDate;
}

export default function (router:FastifyInstance, opts: any, next: Function) {
	router.get("/exist/:site/:id", handler);
	router.post("/exist/", postHandler);

	next();
} 
