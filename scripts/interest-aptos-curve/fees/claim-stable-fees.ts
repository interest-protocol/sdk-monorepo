import {
  PACKAGES,
  WHITELISTED_CURVE_LP_COINS,
} from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import {
  movementMainnetClient,
  WHITELISTED_FAS,
} from '@interest-protocol/movement-core-sdk';
import { account } from '@interest-protocol/movement-utils';

import { TREASURY_ADDRESS } from '../utils';

(async () => {
  const transaction = await movementMainnetClient.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: `${PACKAGES.mainnet.address.toString()}::interest_curve_entry::claim_stable_admin`,
      functionArguments: [
        WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE,
        WHITELISTED_FAS.USDTe.toString(),
        TREASURY_ADDRESS.toString(),
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

  logSuccess(
    `Claimed stable fees for ${WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE}`,
    transactionResponse
  );
})();
