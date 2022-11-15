import FanficHandler from "../src/FanficHandler";

interface Request {
	uuid: string;
	handler: FanficHandler;
}

let requestsList: Request[] = new Array();


export function addRequest(handler: FanficHandler) {
	requestsList.push({ uuid: handler.UUID, handler: handler });
}

export function getRequest(uuid: string) {
	return requestsList.find((value) => {
		return value.uuid == uuid;
	});
}
