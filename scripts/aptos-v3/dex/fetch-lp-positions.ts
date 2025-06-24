import {
  CurrentTokenOwnershipsV2Aggregate,
  getCurrentOwnershipsV2AggregateQuery,
} from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { MOVEMENT_BARDOCK_INDEXER_URL } from '@interest-protocol/movement-core-sdk';
import { account } from '@interest-protocol/movement-utils';
import { gql, GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(MOVEMENT_BARDOCK_INDEXER_URL);

(async () => {
  const data = await client.request<CurrentTokenOwnershipsV2Aggregate>(
    gql`
      ${getCurrentOwnershipsV2AggregateQuery}
    `,
    {
      ownerAddress: account.accountAddress.toString(),
    }
  );

  logSuccess(
    'fetch-lp-positions',
    data.current_token_ownerships_v2_aggregate.nodes
  );
})();
