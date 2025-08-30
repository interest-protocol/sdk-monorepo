import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

(async () => {
  const { executeTx, vestingSdk, keypair } = await getEnv();

  const suiCoin = coinWithBalance({
    type: '0x2::sui::SUI',
    balance: 100n,
  });

  const oneMinuteMs = 60_000;

  const currentTime = Math.floor(Date.now()) + oneMinuteMs;

  const { tx } = await vestingSdk.new({
    owner: keypair.toSuiAddress(),
    coin: suiCoin,
    start: currentTime,
    duration: oneMinuteMs * 5,
    coinType: '0x2::sui::SUI',
  });

  await executeTx(tx);
})();
