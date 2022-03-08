/**
 * Create a file with `600 (-rw-------)` permissions
 * *Note*: 600: Owner has full read and write access to the file,
 * while no other user can access the file
 */
export declare function writeFile600Perm(filepath: string, data: string): void;
/**
 * If `dirPath` does not exist, creates a directory recursively
 */
export declare function ensureDirExists(dirPath: string): void;
//# sourceMappingURL=fs.d.ts.map