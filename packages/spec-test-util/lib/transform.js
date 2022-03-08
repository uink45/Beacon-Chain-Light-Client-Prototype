"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeType = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
, @typescript-eslint/no-explicit-any */
const ssz_1 = require("@chainsafe/ssz");
/**
 * Transform the type to something that is safe to deserialize
 *
 * This mainly entails making sure all numbers are bignumbers
 */
function safeType(type) {
    if (type === ssz_1.byteType) {
        return type;
    }
    else if (!(0, ssz_1.isCompositeType)(type)) {
        if (type.byteLength) {
            return new ssz_1.BigIntUintType({ byteLength: type.byteLength });
        }
        else {
            return type;
        }
    }
    else {
        const props = Object.getOwnPropertyDescriptors(type);
        if (props.elementType) {
            if (props.elementType.byteLength !== 1) {
                props.elementType.value = safeType(props.elementType.value);
            }
        }
        if (props.fields) {
            props.fields.value = { ...props.fields.value };
            for (const fieldName of Object.keys(props.fields.value)) {
                props.fields.value[fieldName] = safeType(props.fields.value[fieldName]);
            }
        }
        const newtype = Object.create(Object.getPrototypeOf(type), props);
        return newtype;
    }
}
exports.safeType = safeType;
//# sourceMappingURL=transform.js.map