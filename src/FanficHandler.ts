import { BaseSite } from "./sites/BaseSite";
import FFNET from "./sites/FFNET";
import Config from "./_Config";
import Crypto from "crypto";

export enum FanficSite {
	FFNET = "ffnet",
	FICTIONPRESS = "fpcom",
	WATTPAD = "wattpad",
};

export class FanficHandler {
	private site: FanficSite;
	private id: number;
	private uuid: string;
	private siteHandler?: BaseSite = null;


	constructor(site: FanficSite, id: number) {
		this.site = site;
		this.id = id;
		this.uuid = Crypto.randomUUID();

		this.setHandler();
	}

	 private setHandler() {
		switch(this.site) {
			case FanficSite.FFNET:
				this.siteHandler = new FFNET(this);
				return;

			default:
				throw new Error("Unknown Fanfic site.");
		}
	} 

	get getSite() {
		return this.site;
	}

	get getId() {
		return this.id;
	}

	get getUUID() {
		return this.uuid;
	}

	get getSiteHandler() {
		return this.siteHandler;
	}


	async fetchFic() {
		this.siteHandler.populateData();
	}
}
