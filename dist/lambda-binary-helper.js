"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const tmpFolder = process.env.TMP_FOLDER || os.tmpdir();
class LambdaBinaryHelper {
    constructor(gzippedBinaryPath, binaryName) {
        this.gzippedBinaryPath = gzippedBinaryPath;
        this.binaryPath = path.join(tmpFolder, binaryName);
    }
    static prepare(gzippedBinaryPath, binaryName) {
        return new Promise((resolve, reject) => {
            if (!gzippedBinaryPath) {
                return reject(new Error('Missing gzippedBinaryPath'));
            }
            if (!binaryName) {
                return reject(new Error('Missing binaryName'));
            }
            fs.access(gzippedBinaryPath, fs.constants.R_OK, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new LambdaBinaryHelper(gzippedBinaryPath, binaryName));
                }
            });
        });
    }
    // check if binary exist at tmp location
    checkBinary() {
        return new Promise((resolve, reject) => {
            fs.access(this.binaryPath, fs.constants.R_OK & fs.constants.X_OK, (err) => {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    // gunzip binary to tmp location
    gunzip() {
        return new Promise((resolve, reject) => {
            // cat gzipfile.gz | gzip -c -d > /tmp/${this.binaryName}
            childProcess.exec(`cat ${this.gzippedBinaryPath} | gzip -c -d > ${this.binaryPath}`, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    makeExecutable() {
        return new Promise((resolve, reject) => {
            fs.chmod(this.binaryPath, '0700', (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    // execute binary at tmp location with arguments
    execute(args = []) {
        return new Promise((resolve, reject) => {
            const process = childProcess.spawn(this.binaryPath, args);
            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Child process ended with error code: ${code}`));
                }
                else {
                    resolve(true);
                }
            });
        });
    }
}
exports.LambdaBinaryHelper = LambdaBinaryHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLWJpbmFyeS1oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGFtYmRhLWJpbmFyeS1oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLHlCQUF5QjtBQUN6Qiw4Q0FBOEM7QUFFOUMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRXhEO0lBcUJFLFlBQTZCLGlCQUF3QixFQUFFLFVBQWlCO1FBQTNDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBTztRQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFyQkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBd0IsRUFBRSxVQUFpQjtRQUN4RCxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUE0QyxFQUFFLE1BQTZCO1lBQzdGLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztZQUN4RCxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBRUQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUc7Z0JBQ2xELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dC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