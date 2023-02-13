export enum Sites {
	FFNET = "ffnet",
	FICTIONPRESS = "fpcom",
	WATTPAD = "wattpad",
};

const domainsList = {
	"fanfiction.net": Sites.FFNET,
	"www.fanfiction.net": Sites.FFNET,
	"m.fanfiction.net": Sites.FFNET,
	"fictionpress.com": Sites.FICTIONPRESS,
	"www.fictionpress.com": Sites.FICTIONPRESS,
	"m.fictionpress.com": Sites.FICTIONPRESS,
	"wattpad.com": Sites.WATTPAD,
};

export function getDomain(site: Sites): string | null {
	const list = Object.entries(domainsList);

	const found = list.find(element => {
		if (element[1] === site) {
			return true;
		}
	});
	if (found) {
		return found[0];
	}

	return null;
};

export function fromDomain(domain: string): Sites {
	const list = Object.entries(domainsList);

	const found = list.find(element => {
		if (element[0] === domain) {
			return true;
		}
	});
	if (found) {
		return found[1];
	}

	return null;
}

export interface ParsedUrl {
	site: Sites,
	id: number,
}

export function parseUrl(url: string) {
	const parsed = new URL(url);
	const site = fromDomain(parsed.host);
	if (!site) {
		throw new Error("Unsupported site.")
	}
	let id: number | null = null

	switch(site) {
		case Sites.FFNET:
			const pattern = /s\/([0-9]+)/;
			const found = parsed.pathname.match(pattern);
			if (!found) {
				throw new Error("Couldn't parse id.");
			}
			id = parseInt(found[1]);
			if (isNaN(id)) {
				throw new Error("Couldn't parse id.");
			}
			break;

	}

	return { site: site, id: id };
}
