import { Poseidon } from '../js-crypto';
import { getEnv } from '../utils.script';
import { Transaction } from '@mysten/sui/transactions';
import { logSuccess } from '@interest-protocol/logger';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { bcs } from '@mysten/sui/bcs';

const poseidonHash = (items: string[]) =>
  Poseidon.hash(items.map((item) => BigInt(item)));
const poseidonHash1 = (item: string) => poseidonHash([item]);
const poseidonHash2 = (a: string, b: string) => poseidonHash([a, b]);
const poseidonHash3 = (a: string, b: string, c: string) =>
  poseidonHash([a, b, c]);

(async () => {
  const result1 = poseidonHash1('1');
  const result2 = poseidonHash2('1', '2');
  const result3 = poseidonHash3('1', '2', '3');
  console.log(result1);
  console.log(result2);
  console.log(result3);

  const { suiClient, keypair } = await getEnv();

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
