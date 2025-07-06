import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

(async () => {
  const data = {
    function: `${PACKAGES.mainnet.address.toString()}::stable_pool::apply_fee`,
    functionArguments: [
      WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE.toString(),
    ],
  } as any;

  const transactionResponse = await executeTx({ data });

  logSuccess('apply-stable-fee', transactionResponse.hash);
})();
