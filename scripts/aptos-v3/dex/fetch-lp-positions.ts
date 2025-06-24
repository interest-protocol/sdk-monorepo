import {
  CurrentTokenOwnershipsV2Aggregate,
  getCurrentOwnershipsV2AggregateQuery,
} from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { account } from '@interest-protocol/movement-utils';
import { gql } from 'graphql-request';

import { bardockGraphQLClient, interestV3 } from '../utils.script';

(async () => {
  const data =
    await bardockGraphQLClient.request<CurrentTokenOwnershipsV2Aggregate>(
      gql`
        ${getCurrentOwnershipsV2AggregateQuery}
      `,
      {
        ownerAddress: account.accountAddress.toString(),
        limit: 10,
        offset: 0,
      }
    );

  const filtered = await interestV3.filterLpByType(
    data.current_token_ownerships_v2_aggregate.nodes
  );

  logSuccess('fetch-lp-positions', filtered);
})();
