import { logSuccess } from '@interest-protocol/logger';
import { getEnv } from '../utils.script';

const BLAST =
  '0x6aede69ad73e1876023f8e73196f24edb3e7c307ad4553a61600b14431e4ab0a';

(async () => {
  const { walletSdk } = await getEnv();

  const [blast] = await Promise.all([walletSdk.getWalletAddress(BLAST)]);

  logSuccess({
    BLAST: blast,
  });
})();
