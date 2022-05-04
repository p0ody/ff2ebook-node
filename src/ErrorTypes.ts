enum ErrorTypes {
	warning,
	fatal,
}


export class Warning extends Error {
	private _errorType = ErrorTypes.warning;

	get errorType() { return this._errorType };
}

export class FatalError extends Error {
	private _errorType = ErrorTypes.fatal;

	get errorType() { return this._errorType };
}
