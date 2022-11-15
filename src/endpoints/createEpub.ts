import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as Utils from "../Utils";
import * as RequestMgr from "../RequestMgr";
import * as EpubMaker from "../EpubMaker";

export interface Params {
	uuid: string;
}

export interface Return {
	error?: string,
	filename?: string,
}

async function handler(request: FastifyRequest, reply: FastifyReply) {
	const params = request.params as Params;

	createEpub(params.uuid);
}

export async function createEpub(uuid: string): Promise<Return> {
	const req = RequestMgr.getRequest(uuid);

	try {
		const filename = await EpubMaker.create(req.handler.siteHandler);

		return { filename: filename };

	} catch(err) {

		if (err instanceof Error) {
			return { error: err.message };
		}
	}
}

export default function (router: FastifyInstance, opts: any, next: Function) {
	router.get("/createEpub/:uuid", handler);

	next();
} 
