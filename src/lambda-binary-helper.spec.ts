import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

import { LambdaBinaryHelper } from './index';

const executablePaths = [
  path.join(os.tmpdir(), 'itworks.sh'),
  path.join(os.tmpdir(), 'itdontwork.sh'),
];

function cleanUpTmpBinary() {
  executablePaths.forEach(executablePath => {
    if (fs.existsSync(executablePath)) {
      fs.unlinkSync(executablePath);
    }
  });
}

describe('LambdaBinaryHelper', () => {
  let lambdaBinary:LambdaBinaryHelper;

  beforeAll(cleanUpTmpBinary);

  afterAll(cleanUpTmpBinary);

  // prepare
  it('should fail to prepare without proper parameters',
    async () => {
      try {
        await LambdaBinaryHelper.prepare('', '');
        fail('should not reach here');
      } catch (err) {
        expect(err.message).toEqual('Missing gzippedBinaryPath');
      }
      try {
        await LambdaBinaryHelper.prepare(' ', '');
        fail('should not reach here');
      } catch (err) {
        expect(err.message).toEqual('Missing binaryName');
      }
    }
  );

  it('should fail to prepare with an inexisting gzippedBinaryPath',
    async () => {
      try {
        await LambdaBinaryHelper.prepare('test/inexist-works.sh.gz', 'itworks.sh');
        fail('should not reach here');
      } catch (err) {
        expect(err.message).toEqual('ENOENT: no such file or directory, access \'test/inexist-works.sh.gz\'');
      }
    }
  );

  it('should be able to prepare properly',
    async () => {
      lambdaBinary = await LambdaBinaryHelper.prepare('test/itworks.sh.gz', 'itworks.sh');
    }
  );


  it('should be not able to get error when it cannot chmod',
    async () => {
      try {
        await lambdaBinary.makeExecutable();
        fail('should not reach here');
      } catch (err) {
        expect(err.message).toMatch(/^ENOENT: no such file or directory/);
      }
    });

  // checkBinary
  it('should be able to check if binary not exist in tmp location',
    async () => {
      const result = await lambdaBinary.checkBinary();
      expect(result).toBeFalsy();
    });

  it('should be able to gunzip to temporary folder',
    async () => {
      await lambdaBinary.gunzip();
      const result = await lambdaBinary.checkBinary();
      expect(result).toBeTruthy();
    });

  it('should be not able to execute before changing to 700',
    async () => {
      try {
        await lambdaBinary.execute();
        fail('should not reach here');
      } catch (err) {
        expect(err.message).toEqual('spawn EACCES');
      }
    });

  it('should be able to update executable to 700',
    async () => {
      await lambdaBinary.makeExecutable();
      const stat = fs.statSync(executablePaths[0]);

      fs.accessSync(executablePaths[0], fs.constants.F_OK); // will throw error if cannot access
    });

  it('should be able to execute',
    async () => {
      const result = await lambdaBinary.execute();
      expect(result).toBeTruthy();
    });

  it('should be able to get return code when return code is not 0',
    async () => {
      try {
        const itDoesntWork = await LambdaBinaryHelper.prepare('test/it-does-not-work.sh.gz', 'itdontwork.sh');
        await itDoesntWork.gunzip();
        await itDoesntWork.makeExecutable();
        const result = await itDoesntWork.execute();
        fail('should not reach here');
      } catch (err) {
        expect(err.message).toEqual('Child process ended with error code: 1');
      }
    });
});
