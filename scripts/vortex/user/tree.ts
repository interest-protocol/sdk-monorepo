#!/usr/bin/env node

import { logSuccess } from '@interest-protocol/logger';
import { getEnv } from '../utils.script';
import { pathOr } from 'ramda';

(async () => {
  const { suiClient, PACKAGE_ID } = await getEnv();

  const targetIndex = '1';

  const events = await suiClient.queryEvents({
    query: {
      MoveModule: {
        package: PACKAGE_ID,
        module: 'vortex',
      },
    },
    order: 'ascending',
    limit: 1000,
  });

  const deposits = events.data
    .filter((e) => e.type.includes('::Deposit'))
    .map((e) => ({
      index: parseInt(pathOr('0', ['index'], e.parsedJson)),
      commitment: pathOr('0', ['commitment'], e.parsedJson),
      root: pathOr('0', ['root'], e.parsedJson),
      value: pathOr('0', ['value'], e.parsedJson),
      txDigest: e.id.txDigest,
    }));

  console.log(`Found ${deposits.length} total deposits\n`);

  if (targetIndex !== undefined) {
    const filtered = deposits.filter((d) => d.index <= parseInt(targetIndex));
    console.log(
      `Filtering up to index ${targetIndex}: ${filtered.length} deposits`
    );

    const treeState = {
      targetIndex: parseInt(targetIndex),
      allCommitments: filtered.map((d) => ({
        index: d.index,
        commitment: d.commitment,
      })),
    };

    logSuccess('Tree state', JSON.stringify(treeState, null, 2));
  } else {
    // Display all deposits
    console.log('All deposits:');
    console.log('Index | Commitment | Value (SUI) | Transaction');
    console.log('------|------------|-------------|------------');

    for (const deposit of deposits) {
      const value = (parseInt(deposit.value) / 1e9).toFixed(1);
      const shortCommitment = deposit.commitment.substring(0, 20) + '...';
      const shortTx = deposit.txDigest.substring(0, 10) + '...';
      console.log(
        `${deposit.index.toString().padEnd(5)} | ${shortCommitment} | ${value.padEnd(11)} | ${shortTx}`
      );
    }
  }
})();
