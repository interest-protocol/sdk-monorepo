import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';

(async () => {
  const { vortexSdk, executeTx } = await getEnv();

  const tx = await vortexSdk.withdraw({
    proofPointsHex:
      '0x9eb76db96b60522ed65d6fb93b89c1576d06ba8b2e1195f69422f255a6e632308f1f3f2da2b5a3f0950a4ceb328fc82b1a215f2cccd573c348223c194f704c11fa456bfe87b523db0838edbc67162aab89e5c0c68af5ee91572d2a4f8ac850a40ff18e3a9d62b3bad5ccd633c8c2aca1bc89935b3a5f8f97068ff188dd71c3af',
    root: 17320154919320880731838497206590244035563306478780681812169645497837604017537n,
    nullifier:
      18271563167267760830689168114872249572996506707434390668216496517846099835756n,
    recipient: '0x3',
    relayer: '0x3',
    relayerFee: 0n,
    pool: Pool.shrimp,
  });

  await executeTx(tx);
})();
