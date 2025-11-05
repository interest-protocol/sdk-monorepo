import { OWNED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { executeTx } from '@interest-protocol/sui-utils';
import invariant from 'tiny-invariant';

import { blizzardAcl, blizzardSDK } from '../utils.script';

const LST_TREASURY_CAP =
  '0x390082df42428e33c5c4a3a9ec9a33567f8748e2cb5a6c4953c7a884f032e2b5';

(async () => {
  const superAdminRecipient =
    '0xfd1857b0672adaa2a0d037cf104177a5976e8a4af948c64c34fcc0ed34be0044';

  invariant(LST_TREASURY_CAP, 'LST_TREASURY_CAP is not set');
  invariant(superAdminRecipient, 'superAdminRecipient is not set');

  const { tx, returnValues } = await blizzardAcl.signIn({
    admin: OWNED_OBJECTS.BLIZZARD_ADMIN,
  });

  await blizzardSDK.newLST({
    tx,
    superAdminRecipient,
    treasuryCap: LST_TREASURY_CAP,
    adminWitness: returnValues,
  });

  await executeTx(tx as any);
})();
