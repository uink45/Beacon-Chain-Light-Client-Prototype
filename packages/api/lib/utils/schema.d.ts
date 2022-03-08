import { ReqGeneric } from "./types";
declare type JsonSchema = Record<string, any>;
export declare type SchemaDefinition<ReqType extends ReqGeneric> = {
    params?: {
        [K in keyof ReqType["params"]]: Schema;
    };
    query?: {
        [K in keyof ReqType["query"]]: Schema;
    };
    body?: Schema;
};
export declare enum Schema {
    Uint = 0,
    UintRequired = 1,
    UintArray = 2,
    String = 3,
    StringRequired = 4,
    StringArray = 5,
    UintOrStringRequired = 6,
    UintOrStringArray = 7,
    Object = 8,
    ObjectArray = 9,
    AnyArray = 10
}
export declare function getFastifySchema(schemaDef: SchemaDefinition<ReqGeneric>): JsonSchema;
export {};
//# sourceMappingURL=schema.d.ts.map