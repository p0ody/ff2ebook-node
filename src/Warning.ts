import { ErrorType } from "./FrontendInterface";

export default class {
    private _type = ErrorType.warning;
    private _message: string;

    constructor(message: string) {
        this._message = message;
        console.log(message);
    }

    get message(): string {
        return this._message;
    }

    get code(): ErrorType {
        return this._type;
    }
}
