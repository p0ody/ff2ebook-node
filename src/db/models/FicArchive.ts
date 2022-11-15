import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';

export default class FicArchive extends Model<InferAttributes<FicArchive>, InferCreationAttributes<FicArchive>> {
	declare id: number;
	declare site: string;
	declare title?: string;
	declare author?: string;
	declare updated?: number;
	declare filename?: string;
	declare lastDL?: number;
	declare lastChecked?: number;
	
	static readonly modelName = "fic_archive";
	static readonly dataTypes = {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
		},
		site: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		author: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		updated: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		filename: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastDL: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: 0,
		},
		lastChecked: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: 0,
		}
	};
}
