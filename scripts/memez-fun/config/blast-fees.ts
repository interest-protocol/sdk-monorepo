import { normalizeSuiAddress } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

const NEXA =
  '0x067a5b92098b8b2d21cbdf602031471e5940b4482a6e275d2dc6ef5370499fb7';

const BLAST =
  '0x22441936a0d6fd21d07d596813dfa29fbc54d44b94eb87916fbcb51d639fde96';

const GIVEREP =
  '0x28c6231133825003c823447a8c777a926c63ffc006fe18136052913f0de2b908';

const IPX =
  '0x6aede69ad73e1876023f8e73196f24edb3e7c307ad4553a61600b14431e4ab0a';

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys, walletSdk } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const deadAddress = normalizeSuiAddress('0x0');

  const [ipx] = await Promise.all([walletSdk.getWalletAddress(IPX)]);

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.XPUMP,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [10_000n, 0n, 0n],
      [8_500n, 1_500n, 120n],
      // last index is the migration fee bps
      [10_000n, 0n, 500n],
      // Allocations
      [10_000n, 0n, 500n],
      // Vesting period
      [0n, 0n],
    ],
    recipients: [[deadAddress], [ipx!], [ipx!], [ipx!]],
  });

  await executeTx(tx2);
})();
