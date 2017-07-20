import { LambdaBinaryHelper } from './index';

describe('LambdaBinaryHelper', () => {
  it('should fail to prepare without proper parameters',
    async () => {
      try {
        await LambdaBinaryHelper.prepare('', '');
      } catch (err) {
        expect(err.message).toEqual('Missing gzippedBinaryPath');
      }
      try {
        await LambdaBinaryHelper.prepare(' ', '');
      } catch (err) {
        expect(err.message).toEqual('Missing binaryName');
      }
      await delay(2000);
    }
  );

  it('should fail to prepare with an inexisting gzippedBinaryPath',
    () => LambdaBinaryHelper.prepare('test/inexist-works.sh.gz', 'itworks')
      .catch((err) => {
        expect(err.message).toEqual('ENOENT: no such file or directory, access \'test/inexist-works.sh.gz\'');
      })
  );
});

function delay(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}
