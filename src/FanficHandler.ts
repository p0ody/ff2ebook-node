import { BaseSite } from "./sites/BaseSite";
import FFNET from "./sites/FFNET";
import Config from "./_Config";
import Crypto from "crypto";
import * as FanficSite from "./FanficSites";



export default class FanficHandler {
	private _site: FanficSite.Sites;
	private _id: number;
	private _uuid: string;
	private _siteHandler?: BaseSite = null;


	constructor(site: FanficSite.Sites, id: number) {
		this._site = site;
		this._id = id;
		this._uuid = Crypto.randomUUID();

		this.setHandler();
	}

	 private setHandler() {
		switch(this._site) {
			case FanficSite.Sites.FFNET:
				this.siteHandler = new FFNET(this);
				return;

			default:
				throw new Error("Unknown Fanfic site.");
		}
	} 

	async fetchFic() {
		await this.siteHandler.populateData();
	}

	async fetchFicInfos() {
		await this.siteHandler.populateData(true);
	}

	get site() {
		return this._site;
	}

	get id() {
		return this._id;
	}

	get UUID() {
		return this._uuid;
	}

	get siteHandler() {
		return this._siteHandler;
	}

	set siteHandler(handler: BaseSite) {
		this._siteHandler = handler;
	}

}
