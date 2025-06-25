import {
  CurrentTokenOwnershipsV2Aggregate,
  getCurrentOwnershipsV2AggregateQuery,
  TEST_FAS,
} from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';
import { gql } from 'graphql-request';
import invariant from 'tiny-invariant';

import { bardockGraphQLClient, interestV3 } from '../utils.script';

(async () => {
  const tokensRequest =
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

  const nodes = tokensRequest.current_token_ownerships_v2_aggregate.nodes;

  const filtered = await interestV3.filterLpByType(nodes);

  invariant(filtered.length > 0, 'No LP positions found');

  const data = interestV3.collectReward({
    interestLp: filtered[0]!.tokenDataId,
    reward: TEST_FAS.bardock.BTC.toString(),
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('collect-reward', tx);
})();
