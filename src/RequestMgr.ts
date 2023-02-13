import FanficHandler from "./FanficHandler";
import Config from "./_Config";

interface Request {
	uuid: string;
	handler: FanficHandler;
	lastRequest: number;
}

let requestsList: Request[] = new Array();


export function addRequest(handler: FanficHandler) {
	requestsList.push({ uuid: handler.UUID, handler: handler, lastRequest: Date.now() });
}

export function getRequest(uuid: string) {
	const req =  requestsList.find((value) => {
		return value.uuid == uuid;
	});

	req.lastRequest = Date.now();
	return req;
}

export function updateRequestList(): void {
	requestsList.forEach((req, i) => {
		if (Date.now() - req.lastRequest > Config.App.clientTimeoutSec*1000) {
			requestsList[i].handler.siteHandler.queueMgr.cancelAll();
			requestsList.splice(i, 1);
		}
	})
}