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
			"http://localhost:3000/?url=",
			"http://192.168.1.250:3000/?url="
		],
		maxRetry: 5,
		maxAsync: 50, // 50 for testing speed
		testIntervalSecs: 60,
	},
	Epub: {
		templatePath: "./files/template.epub",
	}
}
