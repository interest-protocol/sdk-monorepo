import { poseidon1, poseidon2, poseidon3 } from '@interest-protocol/vortex-sdk';
import { getEnv } from '../utils.script';
import { Transaction } from '@mysten/sui/transactions';
import { logSuccess } from '@interest-protocol/logger';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { bcs } from '@mysten/sui/bcs';

(async () => {
  const result1 = poseidon1(1n);
  const result2 = poseidon2(1n, 2n);
  const result3 = poseidon3(1n, 2n, 3n);

  console.log(result1);
  console.log(result2);
  console.log(result3);

  const { suiClient } = await getEnv();

  const tx = new Transaction();

  tx.moveCall({
    target: '0x2::poseidon::poseidon_bn254',
    arguments: [tx.pure.vector('u256', [1])],
  });
  tx.moveCall({
    target: '0x2::poseidon::poseidon_bn254',
    arguments: [tx.pure.vector('u256', [1, 2])],
  });
  tx.moveCall({
    target: '0x2::poseidon::poseidon_bn254',
    arguments: [tx.pure.vector('u256', [1, 2, 3])],
  });

  const result = await devInspectAndGetReturnValues(suiClient, tx, [
    [bcs.u256()],
    [bcs.u256()],
    [bcs.u256()],
  ]);

  logSuccess('result', result[0]![0] === result1.toString());
  logSuccess('result', result[1]![0] === result2.toString());
  logSuccess('result', result[2]![0] === result3.toString());
})();
