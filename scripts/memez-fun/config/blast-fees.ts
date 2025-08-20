import { normalizeSuiAddress } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

const NEXA =
  '0x067a5b92098b8b2d21cbdf602031471e5940b4482a6e275d2dc6ef5370499fb7';

const GIVEREP =
  '0xdc19b2928f31b6df46478e4ad9a309aaff6e958a3b568d4bb76264f767bdfbfc';

const BLAST =
  '0x881d835c410f33a1decd8067ce04f6c2ec63eaca196235386b44d315c2152797';

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
      [5_000n, 3_250n, 1_250n, 500n, 25n],
      [5_000n, 3_250n, 1_250n, 500n, 75n],
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
