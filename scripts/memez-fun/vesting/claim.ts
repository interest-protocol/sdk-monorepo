import { getEnv } from '../utils.script';

const VESTING_ID =
  '0x5538814072dcbe4adfdf09edbd9f1d29140950905c46e23e1a3405a2ed775712';

(async () => {
  const { executeTx, vestingSdk, keypair, devInspectTransactionBlock } =
    await getEnv();

  const { tx, coin } = await vestingSdk.claim({
    vesting: VESTING_ID,
  });

  tx.transferObjects([coin], keypair.toSuiAddress());

  console.log(
    await devInspectTransactionBlock(
      tx,
      '0x4b8b0a085dda5487f301f9827101dd7047be5b70ddbfdaebc1672dd52c96cc36'
    )
  );
})();
