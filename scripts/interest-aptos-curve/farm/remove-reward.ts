import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

const POW_8 = 100000000n;

(async () => {
  const transactionResponse = await executeTx({
    data: {
      function: `${PACKAGES.mainnet.address.toString()}::farm::remove_reward`,
      functionArguments: [
        '0x890a22a0bbdc83f7d2a9cd37d61d2d4261bd9296914fa007e5d47013f5fe3e76',
        WHITELISTED_FAS.MOVE.toString(),
        59689n * POW_8,
      ],
    },
  });

  logSuccess('remove-reward', transactionResponse);
})();
