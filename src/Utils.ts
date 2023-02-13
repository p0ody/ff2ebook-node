import Config from "./_Config";

export function enumContains<T, E extends Object>(value: T, enumName: E): boolean {
	return Object.values(enumName).includes(value);
}

export function closeHtmlTags(html: string): string {
	const tags = ["hr"];
	tags.forEach(tag => {
		const regex = new RegExp(`<${tag}(.+?)>`, "gi");
		html = html.replaceAll(regex, `<${tag}$1 />`);
	});

	return html;
}
