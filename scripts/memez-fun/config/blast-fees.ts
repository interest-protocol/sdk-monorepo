import { normalizeSuiAddress } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

const NEXA =
  '0x067a5b92098b8b2d21cbdf602031471e5940b4482a6e275d2dc6ef5370499fb7';

const GIVEREP =
  '0x22441936a0d6fd21d07d596813dfa29fbc54d44b94eb87916fbcb51d639fde96';

const BLAST =
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

  const [blast, giveRep, memez, nexa] = await Promise.all([
    walletSdk.getWalletAddress(BLAST),
    walletSdk.getWalletAddress(GIVEREP),
    walletSdk.getWalletAddress(IPX),
    walletSdk.getWalletAddress(NEXA),
  ]);

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.XPUMP,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [5_000n, 3_250n, 1_250n, 500n, 0n],
      [5_000n, 3_250n, 1_250n, 500n, 100n],
      // last index is the migration fee bps
      [5_000n, 3_250n, 1_250n, 500n, 500n],
      // Allocations
      [10_000n, 300n],
      // Vesting period
      [0n],
    ],
    recipients: [
      [deadAddress],
      [blast!, giveRep!, memez!, nexa!],
      [blast!, giveRep!, memez!, nexa!],
      [blast!],
    ],
  });

  await executeTx(tx2);
})();
