import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as RequestMgr from "../RequestMgr";
import * as EpubMaker from "../EpubMaker";
import { ErrorType, errorGenerator, FrontendError } from "../FrontendInterface";
import Config from "../_Config";

export interface Params {
	uuid: string,
	mobi: boolean
}

export interface Return {
	errors?: FrontendError[],
	filename?: string,
}

async function handler(request: FastifyRequest, reply: FastifyReply) {
	const params = request.params as Params;

	return createEpub(params.uuid);
}

export async function createEpub(uuid: string): Promise<Return> {
	const req = RequestMgr.getRequest(uuid);

	try {
		const filename = await EpubMaker.create(req.handler.siteHandler);
		return { filename: `${ Config.App.ficArchiveDir }/${ filename }` };

	} catch(err) {

		if (err instanceof Error) {
			return { errors: [errorGenerator(ErrorType.critical, err.message)] };
		}
	}
}

export default function (router: FastifyInstance, opts: any, next: Function) {
	router.get("/createEpub/:uuid", handler);

	next();
} 
