import { logSuccess } from '@interest-protocol/logger';
import { HermesClient } from '@pythnetwork/hermes-client';

import { PRICE_FEED_SUI_USD, PRICE_FEED_USDC_USD } from '../utils.script';

const DECIMAL_PRECISION = 18;

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

  logSuccess('Pyth Prices', prices);
};

updatePrice();
