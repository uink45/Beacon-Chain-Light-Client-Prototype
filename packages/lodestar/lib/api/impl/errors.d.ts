export declare class ApiError extends Error {
    statusCode: number;
    constructor(statusCode: number, message?: string);
}
export declare class StateNotFound extends ApiError {
    constructor();
}
export declare class DataNotAvailable extends ApiError {
    constructor();
}
export declare class ValidationError extends ApiError {
    dataPath?: string;
    constructor(message?: string, dataPath?: string);
}
export declare class NodeIsSyncing extends ApiError {
    constructor(statusMsg: string);
}
//# sourceMappingURL=errors.d.ts.map