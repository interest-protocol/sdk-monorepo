import { PACKAGES } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';

(async () => {
  const lst = await suiClient.queryEvents({
    query: {
      MoveEventType: `${PACKAGES.BLIZZARD.original}::blizzard_event_wrapper::BlizzardEvent<${PACKAGES.BLIZZARD.original}::blizzard_events::NewLST>`,
    },
  });

  const states = lst.data.map(
    (event) => (event.parsedJson as any).pos0.inner_state
  );

  const objects = await suiClient.multiGetObjects({
    ids: states,
    options: {
      showContent: true,
    },
  });

  logSuccess(
    'query-lsts',
    objects.map((x) => x.data?.content)
  );
  logSuccess('query-lsts-length', objects.map((x) => x.data?.content).length);
})();
