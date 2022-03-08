/// <reference types="node" />
import { TAlgorithm } from "jwt-simple";
/** jwt token has iat which is issued at unix timestamp, and an optional exp for expiry */
declare type JwtClaim = {
    iat: number;
    exp?: number;
};
export declare function encodeJwtToken(claim: Record<string, unknown> & JwtClaim, jwtSecret: Buffer | Uint8Array | string, algorithm?: TAlgorithm): string;
export declare function decodeJwtToken(token: string, jwtSecret: Buffer | Uint8Array | string, algorithm?: TAlgorithm): JwtClaim;
export {};
//# sourceMappingURL=jwt.d.ts.map