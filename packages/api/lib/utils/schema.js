"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFastifySchema = exports.Schema = void 0;
var Schema;
(function (Schema) {
    Schema[Schema["Uint"] = 0] = "Uint";
    Schema[Schema["UintRequired"] = 1] = "UintRequired";
    Schema[Schema["UintArray"] = 2] = "UintArray";
    Schema[Schema["String"] = 3] = "String";
    Schema[Schema["StringRequired"] = 4] = "StringRequired";
    Schema[Schema["StringArray"] = 5] = "StringArray";
    Schema[Schema["UintOrStringRequired"] = 6] = "UintOrStringRequired";
    Schema[Schema["UintOrStringArray"] = 7] = "UintOrStringArray";
    Schema[Schema["Object"] = 8] = "Object";
    Schema[Schema["ObjectArray"] = 9] = "ObjectArray";
    Schema[Schema["AnyArray"] = 10] = "AnyArray";
})(Schema = exports.Schema || (exports.Schema = {}));
/**
 * Return JSON schema from a Schema enum. Useful to declare schemas in a succinct format
 */
function getJsonSchemaItem(schema) {
    switch (schema) {
        case Schema.Uint:
        case Schema.UintRequired:
            return { type: "integer", minimum: 0 };
        case Schema.UintArray:
            return { type: "array", items: { type: "integer", minimum: 0 } };
        case Schema.String:
        case Schema.StringRequired:
            return { type: "string" };
        case Schema.StringArray:
            return { type: "array", items: { type: "string" } };
        case Schema.UintOrStringRequired:
            return { type: ["string", "integer"] };
        case Schema.UintOrStringArray:
            return { type: "array", items: { type: ["string", "integer"] } };
        case Schema.Object:
            return { type: "object" };
        case Schema.ObjectArray:
            return { type: "array", items: { type: "object" } };
        case Schema.AnyArray:
            return { type: "array" };
    }
}
function isRequired(schema) {
    switch (schema) {
        case Schema.UintRequired:
        case Schema.StringRequired:
        case Schema.UintOrStringRequired:
            return true;
        default:
            return false;
    }
}
function getFastifySchema(schemaDef) {
    const schema = {};
    if (schemaDef.body) {
        schema.body = getJsonSchemaItem(schemaDef.body);
    }
    if (schemaDef.params) {
        schema.params = { type: "object", required: [], properties: {} };
        for (const [key, def] of Object.entries(schemaDef.params)) {
            schema.params.properties[key] = getJsonSchemaItem(def);
            if (isRequired(def)) {
                schema.params.required.push(key);
            }
        }
    }
    if (schemaDef.query) {
        schema.querystring = { type: "object", required: [], properties: {} };
        for (const [key, def] of Object.entries(schemaDef.query)) {
            schema.querystring.properties[key] = getJsonSchemaItem(def);
            if (isRequired(def)) {
                schema.querystring.required.push(key);
            }
        }
    }
    return schema;
}
exports.getFastifySchema = getFastifySchema;
//# sourceMappingURL=schema.js.map