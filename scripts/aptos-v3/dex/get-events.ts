import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';

const EVENT_NAMES = [
  'NewPool',
  'IncreaseObservationCardinalityNextEvent',
  'Swap',
  'IncreaseLiquidity',
  'DecreaseLiquidity',
  'TickUpdate<0x4fba6e64b3ad27fe2fb38f0fe248172b1e504efc8f4fe7dcfd058145b7ec1754::tick::Tick>',
  'ClearTick',
  'ProtocolFeeUpdate',
  'NewFee',
  'InitializeReward',
  'UpdateEmissionsPerSecond',
  'UpdateEndTimestamp',
  'AddReward',
  'CollectReward',
];

(async () => {
  const events = await bardockClient.getEvents({
    options: {
      limit: 100,
      offset: 0,
      orderBy: [{ transaction_version: 'asc' }],
      where: {
        type: {
          _in: EVENT_NAMES.map(
            (name) =>
              `0x4fba6e64b3ad27fe2fb38f0fe248172b1e504efc8f4fe7dcfd058145b7ec1754::interest_v3_events::${name}`
          ),
        },
      },
    },
  });

  logSuccess('get-events', events);
})();
