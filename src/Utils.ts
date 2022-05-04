export function enumContains<T, E extends Object>(value: T, enumName: E): boolean {
	return Object.values(enumName).includes(value);
}
