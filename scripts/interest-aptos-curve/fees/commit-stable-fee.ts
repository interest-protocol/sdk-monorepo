import {
  PACKAGES,
  WHITELISTED_CURVE_LP_COINS,
} from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';
import { account } from '@interest-protocol/movement-utils';

(async () => {
  const transaction = await movementMainnetClient.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: `${PACKAGES.mainnet.address.toString()}::stable_pool::commit_fee`,
      functionArguments: [
        WHITELISTED_CURVE_LP_COINS.WBTCe_MBTC_STABLE.toString(),
        100000000000000n,
        200000000000000000n,
      ],
    },
  });

  const senderAuthenticator = await movementMainnetClient.sign({
    signer: account,
    transaction,
  });

  const submittedTx = await movementMainnetClient.transaction.submit.simple({
    transaction,
    senderAuthenticator,
  });

  const transactionResponse = await movementMainnetClient.waitForTransaction({
    transactionHash: submittedTx.hash,
  });

  logSuccess('commit-stable-fee', transactionResponse.hash);
})();
