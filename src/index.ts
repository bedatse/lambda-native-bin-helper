import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';

const tmpFolder = process.env.TMP_FOLDER || os.tmpdir();

export class LambdaBinaryHelper {
  private readonly binaryPath: string;

  static async prepare(gzippedBinaryPath:string, binaryName:string) {
    return new Promise((resolve: (value: LambdaBinaryHelper) => void, reject: (reason: any) => void) => {
      if (!gzippedBinaryPath) {
        return reject(new Error('Missing gzippedBinaryPath'))
      }
      if (!binaryName) {
        return reject(new Error('Missing binaryName'));
      }

      fs.access(gzippedBinaryPath, fs.constants.R_OK, (err):void => {
        if (err) {
          reject(err);
        } else {
          resolve(new LambdaBinaryHelper(gzippedBinaryPath, binaryName));
        }
      });
    });
  }

  constructor(private readonly gzippedBinaryPath:string, binaryName:string) {
    this.binaryPath = path.join(tmpFolder, binaryName);
  }

  // check if binary exist at tmp location
  async checkBinary() {
    return new Promise((resolve: (value: boolean) => void, reject: (reason: any) => void) => {
      fs.access(this.binaryPath, fs.constants.R_OK & fs.constants.X_OK, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // gunzip binary to tmp location
  async gunzip() {
    return new Promise((resolve: (value: boolean) => void, reject: (reason: any) => void) => {
      // cat gzipfile.gz | gzip -c -d > /tmp/${this.binaryName}
      childProcess.exec(`cat ${this.gzippedBinaryPath} | gzip -c -d > ${this.binaryPath}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async makeExecutable() {
    return new Promise((resolve: (value: boolean) => void, reject: (reason: any) => void) => {
      fs.chmod(this.binaryPath, '0700', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // execute binary at tmp location with arguments
  async execute(args: string[]) {
    return new Promise((resolve: (value: boolean) => void, reject: (reason: any) => void) => {
      const process = childProcess.spawn(this.binaryPath, args);
      process.stdout.on('data', (buffer) => {
        console.log(buffer.toString());
      });
      process.stdout.on('data', (buffer) => {
        console.log(buffer.toString());
      });
      process.on('close', (code) => {
        if (code !== 0) {
          reject(code);
        } else {
          resolve(true);
        }
      });
    });
  }
}

