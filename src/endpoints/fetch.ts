import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import FanficHandler from "../FanficHandler";
import * as FanficSite from "../FanficSites";
import * as Utils from "../Utils";
import * as RequestMgr from "../RequestMgr";
import { ErrorType, errorGenerator, FrontendError } from "../FrontendInterface";

interface Params {
	site: string;
	id: number;
}

interface Response {
	uuid?: string;
	ficId?: number;
	errors?: FrontendError[];
}


async function handler(request: FastifyRequest, reply: FastifyReply): Promise<Response> {
	const params = request.params as Params;

	if (!Utils.enumContains(params.site, FanficSite.Sites)) {
		return { errors: [errorGenerator(ErrorType.critical, "Invalid site.")] };
	}

	if (!params.id) {
		return { 
			errors: [errorGenerator(ErrorType.critical, "No id provided.")]
		};
	}

	return await fetch(params);
}

export async function fetch(params: Params): Promise<Response> {
	const handler = new FanficHandler(params.site as FanficSite.Sites, params.id);
	if (!handler) {
		return { 
			errors: [errorGenerator(ErrorType.critical, "Unknown error.")] 
		};
	}
	RequestMgr.addRequest(handler);
	handler.fetchFic().catch((err) => {
		console.log(err);
		if (err instanceof Error) {
			handler.siteHandler.addError(err);
		}
	});

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
