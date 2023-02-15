import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import * as ScraperMgr from "../ScraperMgr";

interface Response {
	scrapers: boolean[]
}

export async function handler(request: FastifyRequest): Promise<Response> {
    let scraperStatus: boolean[] = [];
    const list = ScraperMgr.getScraperList();
    for (const scraper of list) {
        scraperStatus.push(scraper.isMostlyWorking);
    }

    return { scrapers: scraperStatus };
}


export default function (router:FastifyInstance, opts: any, next: Function) {
	router.get("/status", handler);

	next();
} 
