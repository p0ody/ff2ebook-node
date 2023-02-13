export default {
	App: {
		listenPort: 3500,
		ficArchiveDir: "./archive",
		ficTempDir: "./archive/temp",
		showDebugLog: true,
		clientTimeoutSec: 5, // Maximum amout of time in seconds between to progress request before cancelling the job.
	},
	DB: {
		host: "",
		port: 3306,
		username: "",
		password: "",
		database: ""
	},
	Scraper: {
		urls: [
			"",
		],
		maxRetry: 3,
		timeoutMS: 30000,
		maxAsync: 10,
		testIntervalSecs: 35,
	},
	Epub: {
		templatePath: "./files/template.epub",
	},
	Mobi: {
		converterPath: "./bin/kindlegen"
	}
}
