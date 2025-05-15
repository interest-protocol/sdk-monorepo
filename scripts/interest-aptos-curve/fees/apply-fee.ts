import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

(async () => {
  const data = {
    function: `${PACKAGES.mainnet.address.toString()}::stable_pool::apply_fee`,
    functionArguments: [
      '0x54c89a961dd60e30f1c03ba2c6f5a052e7ed0ba36fcca3c1153f06449199b285',
    ],
  } as any;

  const transactionResponse = await executeTx({ data });

  logSuccess('apply-fee', transactionResponse.hash);
})();
