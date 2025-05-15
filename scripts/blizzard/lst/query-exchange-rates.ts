import { PACKAGES } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';

const EVENT = `${PACKAGES.BLIZZARD.original}::blizzard_event_wrapper::BlizzardEvent<${PACKAGES.BLIZZARD.original}::blizzard_events::SyncExchangeRate>`;

(async () => {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: EVENT,
    },
  });

  logSuccess(
    'query-exchange-rates',
    events.data.filter((event) =>
      (event.parsedJson as any).pos0.lst.name.includes('MWAL')
    )
  );
})();
