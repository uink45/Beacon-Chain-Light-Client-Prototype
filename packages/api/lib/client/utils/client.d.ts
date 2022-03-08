import { FetchOpts, IHttpClient } from "./httpClient";
import { RouteDef, ReqGeneric, RouteGeneric, ReturnTypes, ReqSerializer, ReqSerializers, RoutesData } from "../../utils/types";
/**
 * Format FetchFn opts from Fn arguments given a route definition and request serializer.
 * For routes that return only JSOn use @see getGenericJsonClient
 */
export declare function getFetchOptsSerializer<Fn extends (...args: any) => any, ReqType extends ReqGeneric>(routeDef: RouteDef, reqSerializer: ReqSerializer<Fn, ReqType>): (...args: Parameters<Fn>) => FetchOpts;
/**
 * Generate `getFetchOptsSerializer()` functions for all routes in `Api`
 */
export declare function getFetchOptsSerializers<Api extends Record<string, RouteGeneric>, ReqTypes extends {
    [K in keyof Api]: ReqGeneric;
}>(routesData: RoutesData<Api>, reqSerializers: ReqSerializers<Api, ReqTypes>): { [K in keyof RoutesData<Api>]: (...args: Parameters<Api[keyof Api]>) => FetchOpts; };
/**
 * Get a generic JSON client from route definition, request serializer and return types.
 */
export declare function generateGenericJsonClient<Api extends Record<string, RouteGeneric>, ReqTypes extends {
    [K in keyof Api]: ReqGeneric;
}>(routesData: RoutesData<Api>, reqSerializers: ReqSerializers<Api, ReqTypes>, returnTypes: ReturnTypes<Api>, fetchFn: IHttpClient): Api;
//# sourceMappingURL=client.d.ts.map