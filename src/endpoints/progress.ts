import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as Utils from "../Utils";
import * as RequestMgr from "../RequestMgr";

export interface Params {
	uuid: string;
}

interface Return {
	done?: number;
	total?: number;
	ready?: boolean;
	error?: string;
}

async function handler(request: FastifyRequest) {
	const params = request.params as Params;

	return progress(params.uuid);
}

export async function progress(uuid: string): Promise<Return> {
	const req = RequestMgr.getRequest(uuid);

	if (!req) {
		return {
			error: "UUID requested not found."
		}
	}

	return {
		done: req.handler.siteHandler.getProgress,
		total: req.handler.siteHandler.chapCount,
		ready: req.handler.siteHandler.getProgress >= req.handler.siteHandler.chapCount,
	};
}

export default function (router: FastifyInstance, opts: any, next: Function) {
	router.get("/progress/:uuid", handler);

	next();
} 
