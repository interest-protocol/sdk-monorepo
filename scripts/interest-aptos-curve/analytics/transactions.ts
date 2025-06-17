import { logSuccess } from '@interest-protocol/logger';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';

(async () => {
  const transactions = await movementMainnetClient.getEvents({
    options: {
      limit: 20,
      offset: 0,
      where: {
        indexed_type: {
          _eq: '0x373aab3f20ef3c31fc4caa287b0f18170f4a0b4a28c80f7ee79434458f70f241::events::Swap',
        },
      },
    },
  });

  logSuccess('swap transactions', transactions);
})();
