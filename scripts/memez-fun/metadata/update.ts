import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

const NAME = 'x';
const SYMBOL = 'xx';
const DESCRIPTION = 'xxx';
const ICON_URL = 'xxxx';

(async () => {
  const { pumpSdk, keypair, executeTx } = await getEnv();

  const caps = await pumpSdk.getMetadataCaps({
    owner: keypair.toSuiAddress(),
  });

  const cap = caps.caps[0]!;

  const { tx } = await pumpSdk.updateName({
    metadataCap: cap,
    value: NAME,
  });

  const { tx: tx2 } = await pumpSdk.updateSymbol({
    metadataCap: cap,
    tx,
    value: SYMBOL,
  });

  const { tx: tx3 } = await pumpSdk.updateDescription({
    metadataCap: cap,
    tx: tx2,
    value: DESCRIPTION,
  });

  const { tx: tx4 } = await pumpSdk.updateIconUrl({
    metadataCap: cap,
    tx: tx3,
    value: ICON_URL,
  });

  const { tx: tx5 } = await pumpSdk.updateName({
    metadataCap: cap,
    tx: tx4,
    value: NAME,
  });

  await executeTx(tx5);
})();
