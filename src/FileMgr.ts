import fs from "fs";
const FileSystem = fs.promises;

interface DirElement {
	path: string;
	isDir: boolean;
	child?: DirElement[];
}

export async function getFilesInDirRecursive(dir: string): Promise<DirElement[]> {
	let fileList: DirElement[] = [];
	const entries = await FileSystem.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const name = `${dir}/${entry.name}`;
		if (entry.isDirectory()) {
			const nextDir = entry.name;
			fileList.push({ 
				path: name, 
				isDir: true,
				child: await getFilesInDirRecursive(name)});
		}
		if (entry.isFile()) {

			const file = {
				path: name,
				isDir: false,
			}
			fileList.push(file);
		}
	}

	return fileList;
}
