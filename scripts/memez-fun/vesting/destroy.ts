import { getEnv } from '../utils.script';

const VESTING_ID =
  '0xa34b451da6fcb7c03ebf9851d925ae02c19c571c065c4356f73a8622a76a466f';

(async () => {
  const { executeTx, vestingSdk } = await getEnv();

  const { tx } = await vestingSdk.destroyZeroBalance({
    vesting: VESTING_ID,
  });

  await executeTx(tx);
})();
