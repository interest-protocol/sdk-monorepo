import {
  CurrentTokenOwnershipsV2Aggregate,
  getCurrentOwnershipsV2AggregateQuery,
} from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';
import { gql } from 'graphql-request';
import invariant from 'tiny-invariant';

import {
  bardockGraphQLClient,
  interestV3,
  POW_10_6,
  POW_10_8,
} from '../utils.script';

(async () => {
  const wethAmount = 1n * POW_10_8;
  const usdcAmount = 2_500n * POW_10_6;

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

  const data = interestV3.addLiquidityFas({
    interestLp: filtered[0]!.tokenDataId,
    amount0: wethAmount,
    amount1: usdcAmount,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('add-liquidity-fas', tx);
})();
