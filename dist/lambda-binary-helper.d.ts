export declare class LambdaBinaryHelper {
    private readonly gzippedBinaryPath;
    private readonly binaryPath;
    static prepare(gzippedBinaryPath: string, binaryName: string): Promise<LambdaBinaryHelper>;
    constructor(gzippedBinaryPath: string, binaryName: string);
    checkBinary(): Promise<boolean>;
    gunzip(): Promise<boolean>;
    makeExecutable(): Promise<boolean>;
    execute(args: string[]): Promise<boolean>;
}
