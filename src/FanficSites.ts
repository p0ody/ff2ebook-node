export enum Sites {
	FFNET = "ffnet",
	FICTIONPRESS = "fpcom",
	WATTPAD = "wattpad",
};

const domainsList = {
	"fanfiction.net": Sites.FFNET,
	"fictionpress.com": Sites.FICTIONPRESS,
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
