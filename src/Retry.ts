export default async function (maxTry: number, func: Function): Promise<any> {
		let tryCount = 0;
		while (tryCount < maxTry) {
			let result = await func();
			if (result) {
				return result;
			}
			tryCount++;
		}

		return false;
}
