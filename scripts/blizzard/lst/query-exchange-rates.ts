import { PACKAGES } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { suiClient } from '../utils.script';

const EVENT = `${PACKAGES.BLIZZARD.original}::blizzard_event_wrapper::BlizzardEvent<${PACKAGES.BLIZZARD.original}::blizzard_events::SyncExchangeRate>`;

(async () => {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: EVENT,
    },
  });

  logSuccess(
    events.data.filter((event) =>
      (event.parsedJson as any).pos0.lst.name.includes('MWAL')
    )
  );
})();
