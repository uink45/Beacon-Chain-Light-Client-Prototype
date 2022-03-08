import { IJsonOptions, Json, ListType, Type } from "@chainsafe/ssz";
import { ForkName } from "@chainsafe/lodestar-params";
import { IChainForkConfig } from "@chainsafe/lodestar-config";
import { Schema, SchemaDefinition } from "./schema";
/** All JSON must be sent in snake case */
export declare const jsonOpts: {
    case: "snake";
};
/** All JSON inside the JS code must be camel case */
export declare const codeCase: "camel";
export declare type RouteGroupDefinition<Api extends Record<string, RouteGeneric>, ReqTypes extends {
    [K in keyof Api]: ReqGeneric;
}> = {
    routesData: RoutesData<Api>;
    getReqSerializers: (config: IChainForkConfig) => ReqSerializers<Api, ReqTypes>;
    getReturnTypes: (config: IChainForkConfig) => ReturnTypes<Api>;
};
export declare type RouteDef = {
    url: string;
    method: "GET" | "POST";
};
export declare type ReqGeneric = {
    params?: Record<string, string | number>;
    query?: Record<string, string | number | (string | number)[]>;
    body?: any;
    headers?: Record<string, string[] | string | undefined>;
};
export declare type ReqEmpty = ReqGeneric;
export declare type RouteGeneric = (...args: any) => PromiseLike<any> | any;
declare type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export declare type Resolves<T extends (...args: any) => any> = ThenArg<ReturnType<T>>;
export declare type TypeJson<T> = {
    toJson(val: T, opts?: IJsonOptions): Json;
    fromJson(json: Json, opts?: IJsonOptions): T;
};
export declare type ReqSerializer<Fn extends (...args: any) => any, ReqType extends ReqGeneric> = {
    writeReq: (...args: Parameters<Fn>) => ReqType;
    parseReq: (arg: ReqType) => Parameters<Fn>;
    schema?: SchemaDefinition<ReqType>;
};
export declare type ReqSerializers<Api extends Record<string, RouteGeneric>, ReqTypes extends {
    [K in keyof Api]: ReqGeneric;
}> = {
    [K in keyof Api]: ReqSerializer<Api[K], ReqTypes[K]>;
};
/** Curried definition to infer only one of the two generic types */
export declare type ReqGenArg<Fn extends (...args: any) => any, ReqType extends ReqGeneric> = ReqSerializer<Fn, ReqType>;
export declare type KeysOfNonVoidResolveValues<Api extends Record<string, RouteGeneric>> = {
    [K in keyof Api]: Resolves<Api[K]> extends void ? never : K;
}[keyof Api];
export declare type ReturnTypes<Api extends Record<string, RouteGeneric>> = {
    [K in keyof Pick<Api, KeysOfNonVoidResolveValues<Api>>]: TypeJson<Resolves<Api[K]>>;
};
export declare type RoutesData<Api extends Record<string, RouteGeneric>> = {
    [K in keyof Api]: RouteDef;
};
/** Shortcut for routes that have no params, query nor body */
export declare const reqEmpty: ReqSerializer<() => void, ReqEmpty>;
/** Shortcut for routes that have only body */
export declare const reqOnlyBody: <T>(type: TypeJson<T>, bodySchema: Schema) => ReqGenArg<(arg: T) => Promise<void>, {
    body: Json;
}>;
/** SSZ factory helper + typed. limit = 1e6 as a big enough random number */
export declare function ArrayOf<T>(elementType: Type<T>, limit?: number): ListType<T[]>;
/**
 * SSZ factory helper + typed to return responses of type
 * ```
 * data: T
 * ```
 */
export declare function ContainerData<T>(dataType: TypeJson<T>): TypeJson<{
    data: T;
}>;
/**
 * SSZ factory helper + typed to return responses of type
 * ```
 * data: T
 * version: ForkName
 * ```
 */
export declare function WithVersion<T>(getType: (fork: ForkName) => TypeJson<T>): TypeJson<{
    data: T;
    version: ForkName;
}>;
/** Helper to only translate casing */
export declare function jsonType<T extends Record<string, unknown> | Record<string, unknown>[]>(): TypeJson<T>;
/** Helper to not do any transformation with the type */
export declare function sameType<T>(): TypeJson<T>;
export {};
//# sourceMappingURL=types.d.ts.map