import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';
import { account } from '@interest-protocol/movement-utils';

const pkg = PACKAGES.bardock;

(async () => {
  const transaction = await movementMainnetClient.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: `${pkg.address.toString()}::interest_curve_entry::initialize`,
      functionArguments: [],
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

  logSuccess('initialize', transactionResponse);
})();
