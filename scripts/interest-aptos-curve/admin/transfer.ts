import { PACKAGES } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

(async () => {
  const data = {
    function: `${PACKAGES.mainnet.address.toString()}::config::start_admin_transfer`,
    functionArguments: [
      '0x1dd93b4bb9a733c30da8a3c4a49177ab3ab4ab4a602a89a72b24f63b68e53534',
    ],
  } as any;

  const transactionResponse = await executeTx({ data });

  logSuccess('transfer-admin', transactionResponse.hash);
})();
