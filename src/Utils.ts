import Config from "./_Config";

export function enumContains<T, E extends Object>(value: T, enumName: E): boolean {
	return Object.values(enumName).includes(value);
}

export class Log {
	public static info(message: any, ...optParams: any[]) {
		console.log(message, optParams);
	}

	public static debug(message: any, ...optParams: any[]) {
		if (Config.App.showDebugLog) {
			console.log(message, optParams);
		}
	}
}

export function closeHtmlTags(html: string): string {
	const tags = ["hr"];
	tags.forEach(tag => {
		const regex = new RegExp(`<${tag}(.+?)>`, "gi");
		html = html.replaceAll(regex, `<${tag}$1 />`);
	});

	return html;
}
