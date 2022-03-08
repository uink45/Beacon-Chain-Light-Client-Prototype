"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpYaml = exports.loadYaml = void 0;
const js_yaml_1 = require("js-yaml");
const schema_1 = require("./schema");
function loadYaml(yaml) {
    return (0, js_yaml_1.load)(yaml, { schema: schema_1.schema });
}
exports.loadYaml = loadYaml;
function dumpYaml(yaml) {
    return (0, js_yaml_1.dump)(yaml, { schema: schema_1.schema });
}
exports.dumpYaml = dumpYaml;
//# sourceMappingURL=index.js.map