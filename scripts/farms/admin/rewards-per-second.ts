import { getEnv } from '../utils.script';

const STAKE_TYPE =
  '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST';

(async () => {
  const {
    farmsSdk,
    fakeSuiTypeArg,
    aclSdk,
    memezOwnedObjects,
    executeTx,
    memezTypes,
  } = await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const { decimals, tx: tx2 } = await farmsSdk.getDecimals({
    coinType: STAKE_TYPE,
    isCurrency: false,
    tx: tx as any,
  });

  const { tx: tx3 } = farmsSdk.newFarm({
    tx: tx2 as any,
    stakeCoinType: STAKE_TYPE,
    adminWitnessType: memezTypes.MEMEZ_OTW,
    rewardTypes: [fakeSuiTypeArg],
    decimals,
    authWitness,
  });

  await executeTx(tx3);
})();
