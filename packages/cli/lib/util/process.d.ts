/**
 * All CLI handlers should register this callback to exit properly and not leave
 * a process hanging forever. Pass a clean function that will be run until the
 * user forcibly kills the process by doing CTRL+C again
 * @param cleanUpFunction
 */
export declare function onGracefulShutdown(cleanUpFunction: () => Promise<void>, logFn?: (msg: string) => void): void;
//# sourceMappingURL=process.d.ts.map