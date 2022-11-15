import * as FileMgr from "../src/FileMgr";


(async () => {
	const files = await FileMgr.getFilesInDirRecursive("./files");
	files.forEach((entry) => {
		if (!entry.isDir) {
			console.log("File: %s", entry.path);
		} else {
			entry.child.forEach((dirEl) => {
				console.log("Dir: %s", dirEl.path);
			})
			//console.log("Dir: %s", entry.child);
		}
	})
	//console.log(files);
})();
