import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

(async () => {
  const data = {
    function: `${PACKAGES.mainnet.address.toString()}::volatile_pool::apply_parameters`,
    functionArguments: [
      WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
    ],
  } as any;

  const transactionResponse = await executeTx({ data });

  logSuccess('apply-fee', transactionResponse.hash);
})();
