import { PACKAGES } from '@interest-protocol/blizzard-sdk';
import { logSuccess, suiClient } from '@interest-protocol/sui-utils';

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

  logSuccess(objects.map((x) => x.data?.content));
  logSuccess(objects.map((x) => x.data?.content).length);
})();
