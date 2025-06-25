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

  invariant(filtered.length > 0, 'No LP positions found');

  const payload = interestV3.collectFees({
    interestLp: filtered[0]!.tokenDataId,
    amount0Max: BigInt(filtered[0]!.tokensOwed0),
    amount1Max: BigInt(filtered[0]!.tokensOwed1),
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data: payload,
    client: bardockClient,
  });

  logSuccess('collect-fees', tx);
})();
