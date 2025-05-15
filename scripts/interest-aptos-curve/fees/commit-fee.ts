import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';
import { account } from '@interest-protocol/movement-utils';

(async () => {
  const transaction = await movementMainnetClient.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: `${PACKAGES.mainnet.address.toString()}::stable_pool::commit_fee`,
      functionArguments: [
        '0x54c89a961dd60e30f1c03ba2c6f5a052e7ed0ba36fcca3c1153f06449199b285',
        10000000000000n,
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

  console.log(transactionResponse);
})();
