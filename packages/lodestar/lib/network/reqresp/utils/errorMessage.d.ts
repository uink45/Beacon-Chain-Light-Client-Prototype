/// <reference types="node" />
/**
 * Encodes a UTF-8 string to 256 bytes max
 */
export declare function encodeErrorMessage(errorMessage: string): Buffer;
/**
 * Decodes error message from network bytes and removes non printable, non ascii characters.
 */
export declare function decodeErrorMessage(errorMessage: Buffer): string;
//# sourceMappingURL=errorMessage.d.ts.map