import { logSuccess } from '@interest-protocol/logger';
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
  const { walletSdk } = await getEnv();

  const [blast, giveRep, memez, nexa] = await Promise.all([
    walletSdk.getWalletAddress(BLAST),
    walletSdk.getWalletAddress(GIVEREP),
    walletSdk.getWalletAddress(IPX),
    walletSdk.getWalletAddress(NEXA),
  ]);

  logSuccess({
    BLAST: blast,
    GIVEREP: giveRep,
    IPX: memez,
    NEXA: nexa,
  });
})();
