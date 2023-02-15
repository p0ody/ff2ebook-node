import * as TimeConversion from "./TimeConversion";

export default {
	App: {
		listenPort: 3500,
		ficArchiveDir: "./archive",
		ficTempDir: "./archive/temp",
		clientTimeoutSec: 5, // Maximum amout of time in seconds between to progress request before cancelling the job.
		maxArchiveAgeHours: 24,
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
		timeoutSec: 30,
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
