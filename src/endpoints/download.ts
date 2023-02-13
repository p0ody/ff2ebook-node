import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import Config from "../_Config";
import * as FrontendInterface from "../FrontendInterface";
import { ficExist } from "./exist";
import fs from "fs";
import * as db from "../db/DBHandler";
import * as Utils from "../Utils";
import * as MobiMaker from "../MobiMaker";


export interface Params {
	site: string,
	id: number,
	filetype: FileType
}

enum FileType {
	EPUB = "epub",
	MOBI = "mobi"
}

export interface Response {
	errors?: FrontendInterface.FrontendError
}

export async function handler(request: FastifyRequest, reply: FastifyReply) {
	const params = request.params as Params;

	if (!params.filetype) {
		params.filetype = FileType.EPUB;
	}

	if (!Utils.enumContains(params.filetype, FileType)) {
		return "Invalid filetype.";
	}

	const fic = await ficExist(params);
	if (!fic) {
		return "Fic not found on database.";
	}

	let path = `${Config.App.ficArchiveDir}/${fic.filename}`;

	if (!fs.existsSync(path)) {
		db.models.FicArchive.destroy({ 
			where: {
				id: fic.id
			}});
		return "File not found on server.";
	}

	if (params.filetype == FileType.MOBI) {
		path = await MobiMaker.convertToMobi(`${Config.App.ficArchiveDir}/${fic.filename}`);
	}
	
	const stream = fs.createReadStream(path);
	reply.header("Content-Disposition", `attachment; filename=${fic.title} - ${fic.author}.${params.filetype}`);
	reply.send(stream);

	return reply;
}

export default function (router:FastifyInstance, opts: any, next: Function) {
	router.get("/download/:site/:id", handler);
	router.get("/download/:site/:id/:filetype", handler);

	next();
} 
