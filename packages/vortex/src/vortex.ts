import {
  SdkConstructorArgs,
  VortexPools,
  DepositArgs,
  Modules,
  Pool,
  WithdrawArgs,
} from './vortex.types';
import { SuiClient } from '@mysten/sui/client';
import {
  generateRandomNote,
  zeros,
  BN254_FIELD_MODULUS,
  addressToFieldElement,
  bigIntToFieldElement,
} from './utils';
import { poseidon2 } from 'poseidon-lite';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import { fromHex, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import invariant from 'tiny-invariant';

export class VortexSdk {
  private client: SuiClient;
  private packageId: string;
  private pools: VortexPools;

  public TREE_HEIGHT = 26;
  public BN254_FIELD_MODULUS = BN254_FIELD_MODULUS;

  constructor(args: SdkConstructorArgs) {
    this.client = args.client;
    this.packageId = args.packageId;
    this.pools = args.pools;
  }

  generateRandomNote() {
    return generateRandomNote();
  }

  async hashNullifier(a: string) {
    return poseidon2([a, a]);
  }

  poseidon2(a: bigint | number | string, b: bigint | number | string) {
    return poseidon2([a, b]);
  }

  addressToFieldElement(address: string) {
    return addressToFieldElement(address);
  }

  bigIntToFieldElement(value: bigint) {
    return bigIntToFieldElement(value);
  }

  zeros() {
    return zeros(this.TREE_HEIGHT);
  }

  deposit({ commitment, pool, tx = new Transaction() }: DepositArgs) {
    const poolObject = this.pools[pool];

    const suiCoin = coinWithBalance({
      type: SUI_TYPE_ARG,
      balance: pool,
    })(tx);

    tx.moveCall({
      package: this.packageId,
      module: Modules.vortex,
      function: 'deposit',
      arguments: [
        tx.sharedObjectRef({
          objectId: poolObject.objectId,
          mutable: true,
          initialSharedVersion: poolObject.initialSharedVersion,
        }),
        suiCoin,
        tx.pure.u256(commitment),
      ],
    });

    return tx;
  }

  withdraw({
    a,
    b,
    c,
    root,
    nullifierHash,
    recipient,
    relayer,
    relayerFee,
    pool,
    tx = new Transaction(),
  }: WithdrawArgs) {
    const poolObject = this.pools[pool];

    const proof = tx.moveCall({
      package: this.packageId,
      module: Modules.proof,
      function: 'new',
      arguments: [
        tx.pure.vector('u8', fromHex(a)),
        tx.pure.vector('u8', fromHex(b)),
        tx.pure.vector('u8', fromHex(c)),
        tx.pure.u256(root),
        tx.pure.u256(nullifierHash),
        tx.pure.address(recipient),
        tx.pure.u64(pool),
        tx.pure.address(relayer),
        tx.pure.u64(relayerFee),
        tx.pure.address(poolObject.objectId),
      ],
    });

    tx.moveCall({
      package: this.packageId,
      module: Modules.vortex,
      function: 'withdraw',
      arguments: [
        tx.sharedObjectRef({
          objectId: poolObject.objectId,
          mutable: true,
          initialSharedVersion: poolObject.initialSharedVersion,
        }),
        proof,
      ],
    });

    return tx;
  }

  async root(pool: Pool) {
    const tx = new Transaction();

    const poolObject = this.pools[pool];

    tx.moveCall({
      package: this.packageId,
      module: Modules.vortex,
      function: 'root',
      arguments: [
        tx.sharedObjectRef({
          objectId: poolObject.objectId,
          mutable: false,
          initialSharedVersion: poolObject.initialSharedVersion,
        }),
      ],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.u256()],
    ]);

    invariant(result[0][0], 'Root devInspectAndGetReturnValues failed');

    return BigInt(result[0][0]);
  }
}
