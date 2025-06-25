import {
  CurrentTokenOwnershipsV2Aggregate,
  getCurrentOwnershipsV2AggregateQuery,
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

  const filtered = await interestV3.filterLpByType(
    tokensRequest.current_token_ownerships_v2_aggregate.nodes
  );

  invariant(filtered.length > 0, 'No LP positions found');

  const data = interestV3.decreaseLiquidityFas({
    interestLp: filtered[0]!.tokenDataId,
    liquidity: BigInt(filtered[0]!.liquidity) / 4n,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('decrease-liquidity', tx);
})();
