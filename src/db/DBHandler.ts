import { Sequelize } from 'sequelize';
import Config from "../_Config";

import FicArchive from "./models/FicArchive";
import Scraper from "./models/Scraper";

let pool: Sequelize = null;

export async function init() {
	if (pool) {
		return pool;
	}
	pool = new Sequelize({ dialect: "mysql", pool: { min: 0, max: 5, idle: 30000 }, ...Config.DB });
	await pool.authenticate();
	initModels();
	return pool;
}

export const models = {
	FicArchive,
	Scraper,
}

function initModels() {
	const sequelize = pool;
	FicArchive.init(FicArchive.dataTypes, { sequelize, modelName: FicArchive.modelName, freezeTableName: true, timestamps: false });
	Scraper.init(Scraper.dataTypes, { sequelize, modelName: Scraper.modelName, freezeTableName: true, timestamps: false });
}