export enum ErrorType {
    critical,
    warning,
    blacklisted,
}

export interface FrontendError {
    code: ErrorType,
    message?: string,
}


export function errorGenerator(errorType: ErrorType, message: string): FrontendError {
    return { 
        code: errorType,
        message: message
    }
}