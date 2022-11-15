import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';

/*
CREATE TABLE scraper
(
  url varchar(100) NOT NULL,
  lastUpdated INT UNSIGNED,
  isWorking BOOLEAN DEFAULT TRUE,
  priority INT UNSIGNED,
  PRIMARY KEY (url)
);
*/

export default class Scraper extends Model<InferAttributes<Scraper>, InferCreationAttributes<Scraper>> {
	declare priority: number;
	declare url: string;
	declare lastUpdated?: number;
	declare isWorking: boolean;

	static readonly modelName = "scraper";
	static readonly dataTypes = {
		priority: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		lastUpdated: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
		},
		isWorking: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	};
}
