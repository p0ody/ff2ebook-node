export default {
	App: {
		listenPort: 3500,
		ficArchiveDir: "./archive",
		ficTempDir: "./archive/temp",
		showDebugLog: true,
	},
	DB: {
		host: "localhost",
		port: 3306,
		username: "root",
		password: "",
		database: "ff2ebook-node"
	},
	Scraper: {
		urls: [
			,
		],
		maxRetry: 3,
		timeoutMS: 30000,
		maxAsync: 20,
		testIntervalSecs: 35,
	},
	Epub: {
		templatePath: "./files/template.epub",
	}
}
