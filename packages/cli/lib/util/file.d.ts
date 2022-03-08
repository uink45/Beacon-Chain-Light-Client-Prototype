import { Schema } from "js-yaml";
import { Json } from "@chainsafe/ssz";
export declare const yamlSchema: Schema;
/**
 * Maybe create a directory
 */
export declare function mkdir(dirname: string): void;
export declare enum FileFormat {
    json = "json",
    yaml = "yaml",
    yml = "yml",
    toml = "toml"
}
/**
 * Parse file contents as Json.
 */
export declare function parse<T = Json>(contents: string, fileFormat: FileFormat): T;
/**
 * Stringify file contents.
 */
export declare function stringify<T = Json>(obj: T, fileFormat: FileFormat): string;
/**
 * Write a JSON serializable object to a file
 *
 * Serialize either to json, yaml, or toml
 */
export declare function writeFile(filepath: string, obj: Json): void;
/**
 * Read a JSON serializable object from a file
 *
 * Parse either from json, yaml, or toml
 * Optional acceptedFormats object can be passed which can be an array of accepted formats, in future can be extended to include parseFn for the accepted formats
 */
export declare function readFile<T = Json>(filepath: string, acceptedFormats?: Json[]): T;
/**
 * @see readFile
 * If `filepath` does not exist returns null
 */
export declare function readFileIfExists<T = Json>(filepath: string, acceptedFormats?: Json[]): T | null;
/**
 * Download from URL or copy from local filesystem
 * @param urlOrPathSrc "/path/to/file.szz" | "https://url.to/file.szz"
 */
export declare function downloadOrCopyFile(pathDest: string, urlOrPathSrc: string): Promise<void>;
/**
 * Downloads a genesis file per network if it does not exist
 */
export declare function downloadFile(pathDest: string, url: string): Promise<void>;
/**
 * Download from URL to memory or load from local filesystem
 * @param urlOrPathSrc "/path/to/file.szz" | "https://url.to/file.szz"
 */
export declare function downloadOrLoadFile(pathOrUrl: string): Promise<Uint8Array>;
//# sourceMappingURL=file.d.ts.map