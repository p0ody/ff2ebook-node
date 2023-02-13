import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import * as RequestMgr from "../RequestMgr";
import { ErrorType, errorGenerator, FrontendError } from "../FrontendInterface";

export interface Params {
	uuid: string;
}

interface Response {
	done?: number;
	total?: number;
	ready?: boolean;
	errors?: FrontendError[];
}

async function handler(request: FastifyRequest): Promise<Response> {
	const params = request.params as Params;

	return progress(params.uuid);
}

export async function progress(uuid: string): Promise<Response> {
	const req = RequestMgr.getRequest(uuid);

	if (!req) {
		return {
			errors: [errorGenerator(ErrorType.critical, "UUID requested not found.")]
		};
	}

	const warnings = req.handler.siteHandler.warnings;
	const errors = req.handler.siteHandler.errors;
	const warnError: FrontendError[] = [];
	warnings.forEach((warn) => {
		warnError.push(errorGenerator(ErrorType.warning, warn.message));
	});

	errors.forEach((error) => {
		warnError.push(errorGenerator(ErrorType.warning, error.message));
	});

	return {
		done: req.handler.siteHandler.getProgress,
		total: req.handler.siteHandler.chapCount,
		ready: req.handler.siteHandler.getProgress >= req.handler.siteHandler.chapCount,
		errors: warnError,
	};
}

export default function (router: FastifyInstance, opts: any, next: Function) {
	router.get("/progress/:uuid", handler);

	next();
} 
