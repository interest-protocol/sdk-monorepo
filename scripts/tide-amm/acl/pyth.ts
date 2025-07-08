import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/sui-utils';
import { sleep } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import { HermesClient } from '@pythnetwork/hermes-client';

import { JOSE_ADMIN, MOCK_SUI_MOCK_USDC_POOL } from '../utils.script';

const sdk = new TideSdk();

const admin = JOSE_ADMIN;

const DECIMAL_PRECISION = 18;

const PRICE_FEED_SUI_USD =
  '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744';

const PRICE_FEED_USDC_USD =
  '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a';

const updatePrice = async () => {
  const connection = new HermesClient('https://hermes.pyth.network', {});

  // https://www.pyth.network/developers/price-feed-ids
  const priceIds = [PRICE_FEED_SUI_USD, PRICE_FEED_USDC_USD];

  // Latest price updates
  const priceUpdates = await connection.getLatestPriceUpdates(priceIds);

  const prices = priceUpdates.parsed?.map(({ price }) => {
    const powValue =
      price.expo > 0
        ? DECIMAL_PRECISION + Math.abs(price.expo)
        : DECIMAL_PRECISION - Math.abs(price.expo);

    return BigInt(price.price) * 10n ** BigInt(powValue);
  });

  const tx = sdk.setPrices({
    pool: MOCK_SUI_MOCK_USDC_POOL,
    priceX: prices![0]!,
    priceY: prices![1]!,
    admin,
  });

  await executeTx(tx);
};

const tenMinutesLater = Date.now() + 10 * 60 * 1000;

(async () => {
  try {
    while (tenMinutesLater > Date.now()) {
      console.log('BEFORE updatePrice');

      await updatePrice();

      console.log('AFTER updatePrice - Updated price');

      await sleep(1_500);
    }
  } catch (error) {
    console.error('Error in loop:', error);
  }
})();
