import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  ConstructorArgs,
  RegisterArgs,
  SharedObjectData,
  NewExtDataArgs,
  Action,
  NewProofArgs,
  TransactArgs,
} from './vortex.types';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { bcs } from '@mysten/sui/bcs';
import invariant from 'tiny-invariant';
import { pathOr } from 'ramda';
import {
  BN254_FIELD_MODULUS,
  VORTEX_PACKAGE_ID,
  REGISTRY_OBJECT_ID,
  INITIAL_SHARED_VERSION,
  VORTEX_POOL_OBJECT_ID,
} from './constants';

export class Vortex {
  #suiClient: SuiClient;

  packageId: string;
  registry: SharedObjectData;
  vortex: SharedObjectData;

  newCommitmentEventType: string;
  nullifierSpentEventType: string;
  newEncryptionKeyEventType: string;

  constructor({
    registry,
    packageId,
    vortex,
    fullNodeUrl = getFullnodeUrl('devnet'),
  }: ConstructorArgs) {
    this.#suiClient = new SuiClient({
      url: fullNodeUrl,
    });

    this.newCommitmentEventType = `${packageId}::vortex::NewCommitment`;
    this.nullifierSpentEventType = `${packageId}::vortex::NullifierSpent`;
    this.newEncryptionKeyEventType = `${packageId}::vortex::NewEncryptionKey`;

    this.packageId = packageId;
    this.registry = registry;
    this.vortex = vortex;
  }

  register({ tx = new Transaction(), encryptionKey }: RegisterArgs) {
    tx.moveCall({
      target: `${this.packageId}::vortex::register`,
      arguments: [this.mutableRegistryRef(tx), tx.pure.string(encryptionKey)],
    });

    return { tx };
  }

  async encryptionKey(user: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::encryption_key`,
      arguments: [this.immutableRegistryRef(tx), tx.pure.address(user)],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.String],
    ]);

    invariant(result[0], 'Encryption key devInspectAndGetReturnValues failed');

    return result[0][0] as string;
  }

  newExtData({
    tx = new Transaction(),
    recipient,
    value,
    action,
    relayer,
    relayerFee,
    encryptedOutput1,
    encryptedOutput0,
  }: NewExtDataArgs) {
    const extData = tx.moveCall({
      target: `${this.packageId}::vortex_ext_data::new`,
      arguments: [
        tx.pure.address(recipient),
        tx.pure.u64(value),
        tx.pure.bool(action === Action.Deposit), // true for deposit, false for withdraw
        tx.pure.address(relayer),
        tx.pure.u64(relayerFee),
        tx.pure.vector('u8', encryptedOutput0),
        tx.pure.vector('u8', encryptedOutput1),
      ],
    });

    return { tx, extData };
  }

  newProof({
    tx = new Transaction(),
    proofPoints,
    root,
    publicValue,
    action,
    extDataHash,
    inputNullifier0,
    inputNullifier1,
    outputCommitment0,
    outputCommitment1,
  }: NewProofArgs) {
    const value =
      action === Action.Deposit
        ? publicValue
        : BN254_FIELD_MODULUS - publicValue;

    const proof = tx.moveCall({
      target: `${this.packageId}::vortex_proof::new`,
      arguments: [
        tx.pure.vector('u8', proofPoints),
        tx.pure.u256(root),
        tx.pure.u256(value),
        tx.pure.u256(extDataHash),
        tx.pure.u256(inputNullifier0),
        tx.pure.u256(inputNullifier1),
        tx.pure.u256(outputCommitment0),
        tx.pure.u256(outputCommitment1),
      ],
    });

    return { tx, proof };
  }

  transact({ tx = new Transaction(), proof, extData, deposit }: TransactArgs) {
    tx.moveCall({
      target: `${this.packageId}::vortex::transact`,
      arguments: [this.mutableVortexRef(tx), proof, extData, deposit],
    });

    return { tx };
  }

  async tvl() {
    const object = await this.#suiClient.getObject({
      id: this.vortex.objectId,
      options: {
        showContent: true,
      },
    });

    invariant(object.data, 'Vortex object data not found');

    const content = object.data.content;

    return BigInt(pathOr(0, ['fields', 'balance'], content));
  }

  async root() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::root`,
      arguments: [this.immutableVortexRef(tx)],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.u256()],
    ]);

    invariant(result[0], 'Root devInspectAndGetReturnValues failed');

    return BigInt(result[0][0] as string);
  }

  async nextIndex() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::next_index`,
      arguments: [this.immutableVortexRef(tx)],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.u64()],
    ]);

    invariant(result[0], 'Next index devInspectAndGetReturnValues failed');

    return BigInt(result[0][0] as string);
  }

  async isNullifierSpent(nullifier: bigint) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::is_nullifier_spent`,
      arguments: [this.immutableVortexRef(tx), tx.pure.u256(nullifier)],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.Bool],
    ]);

    invariant(
      result[0],
      'Is nullifier spent devInspectAndGetReturnValues failed'
    );

    return result[0][0] as boolean;
  }

  async areNullifiersSpent(nullifiers: bigint[]) {
    const tx = new Transaction();

    nullifiers.forEach((nullifier) => {
      tx.moveCall({
        target: `${this.packageId}::vortex::is_nullifier_spent`,
        arguments: [this.immutableVortexRef(tx), tx.pure.u256(nullifier)],
      });
    });

    const result = await devInspectAndGetReturnValues(
      this.#suiClient,
      tx,
      nullifiers.map(() => [bcs.Bool])
    );

    invariant(
      result[0],
      'Is nullifier spent devInspectAndGetReturnValues failed'
    );

    return result.flat() as boolean[];
  }

  immutableVortexRef(tx: Transaction) {
    return tx.sharedObjectRef({
      objectId: this.vortex.objectId,
      initialSharedVersion: this.vortex.initialSharedVersion,
      mutable: false,
    });
  }

  immutableRegistryRef(tx: Transaction) {
    return tx.sharedObjectRef({
      objectId: this.registry.objectId,
      initialSharedVersion: this.registry.initialSharedVersion,
      mutable: false,
    });
  }

  mutableVortexRef(tx: Transaction) {
    return tx.sharedObjectRef({
      objectId: this.vortex.objectId,
      initialSharedVersion: this.vortex.initialSharedVersion,
      mutable: true,
    });
  }

  mutableRegistryRef(tx: Transaction) {
    return tx.sharedObjectRef({
      objectId: this.registry.objectId,
      initialSharedVersion: this.registry.initialSharedVersion,
      mutable: true,
    });
  }
}

export const vortexSDK = new Vortex({
  packageId: VORTEX_PACKAGE_ID,
  registry: {
    objectId: REGISTRY_OBJECT_ID,
    initialSharedVersion: INITIAL_SHARED_VERSION,
  },
  vortex: {
    objectId: VORTEX_POOL_OBJECT_ID,
    initialSharedVersion: INITIAL_SHARED_VERSION,
  },
  fullNodeUrl: getFullnodeUrl('devnet'),
});
