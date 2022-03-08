"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJwtToken = exports.encodeJwtToken = void 0;
const jwt_simple_1 = require("jwt-simple");
function encodeJwtToken(claim, jwtSecret, algorithm = "HS256") {
    const token = (0, jwt_simple_1.encode)(claim, 
    // Note: This type casting is required as even though jwt-simple accepts a buffer as a
    // secret types definitions exposed by @types/jwt-simple only takes a string
    jwtSecret, algorithm);
    return token;
}
exports.encodeJwtToken = encodeJwtToken;
function decodeJwtToken(token, jwtSecret, algorithm = "HS256") {
    const claim = (0, jwt_simple_1.decode)(token, jwtSecret, false, algorithm);
    return claim;
}
exports.decodeJwtToken = decodeJwtToken;
//# sourceMappingURL=jwt.js.map