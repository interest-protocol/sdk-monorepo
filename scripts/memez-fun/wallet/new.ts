import { getEnv } from '../utils.script';

const GIVEREP =
  '0x22441936a0d6fd21d07d596813dfa29fbc54d44b94eb87916fbcb51d639fde96';

const BLAST =
  '0x28c6231133825003c823447a8c777a926c63ffc006fe18136052913f0de2b908';

(async () => {
  const { executeTx, walletSdk } = await getEnv();

  const { tx } = await walletSdk.newWallet({
    owner: BLAST,
  });

  const { tx: tx2 } = await walletSdk.newWallet({
    tx,
    owner: GIVEREP,
  });

  await executeTx(tx2);
})();
