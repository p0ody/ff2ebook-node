import { Sequelize, Model, DataTypes } from 'sequelize';
import Config from "../_Config";

import FicArchive from "./models/FicArchive";

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
}

function initModels() {
	const sequelize = pool;
	FicArchive.init(FicArchive.dataTypes, { sequelize, modelName: FicArchive.modelName, freezeTableName: true, timestamps: false });
}

/* class DBHandler {
	private pool?: Sequelize = null;

	constructor() {
		if (this.pool) {
			return this;
		}
		this.pool = new Sequelize({ dialect: "mysql", pool: { min: 0, max: 5, idle: 30000}, ...Config.DB });
		this.initModels();
	}

	public async connect() {
		return this.pool.authenticate();

	}

	get models() {
		return { FicArchive };
	}

	private initModels() {
		const sequelize = this.pool;
		FicArchive.init(FicArchive.dataTypes, { sequelize, modelName: FicArchive.modelName, freezeTableName: true, timestamps: false });
	}
} */
