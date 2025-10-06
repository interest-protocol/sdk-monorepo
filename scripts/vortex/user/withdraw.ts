import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';

(async () => {
  const { vortexSdk, executeTx } = await getEnv();

  const tx = await vortexSdk.withdraw({
    a: 'f2ef207fafc4e9b9decef54ad61d44ec9a9067ff9ffb0148b847f0ffa59e9b9d',
    b: 'a8547f3fde7969a7915fffe0b17523430b117fbba5f84c790bdee54b0d200a032106df2beb50c907948203fb79afa9450ce47839e72ec4848f1b18ba14b5ec08',
    c: '907b1c3b5ad99bae2430d1e9a751e110b5d0b703ddbc833e24bb382637770425',
    root: 9977556589076347249373747563583161099041072477313317341220104659718460397328n,
    nullifierHash:
      20413639166925508626033901573010882565294699155829902334946734460109379560125n,
    recipient:
      '0xbbf31f4075625942aa967daebcafe0b1c90e6fa9305c9064983b5052ec442ef7',
    relayer:
      '0xbbf31f4075625942aa967daebcafe0b1c90e6fa9305c9064983b5052ec442ef7',
    relayerFee: 0n,
    pool: Pool.shrimp,
  });

  await executeTx(tx);
})();
