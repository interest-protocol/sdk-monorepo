import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

(async () => {
  const transactionResponse = await executeTx({
    data: {
      function: `${PACKAGES.mainnet.address.toString()}::farm::remove_reward`,
      functionArguments: [
        '0xf54948ae917f101621ed02e813b0603f9c556f0041aa311d9e535c3b07a1ca6b',
        WHITELISTED_FAS.MOVE.toString(),
        1152200000000n,
      ],
    },
  });

  logSuccess('remove-reward', transactionResponse);
})();
