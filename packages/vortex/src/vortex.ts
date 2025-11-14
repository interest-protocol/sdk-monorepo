import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  ConstructorArgs,
  RegisterArgs,
  SharedObjectData,
  NewExtDataArgs,
} from './vortex.types';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { bcs } from '@mysten/sui/bcs';
import invariant from 'tiny-invariant';

export class Vortex {
  #suiClient: SuiClient;

  packageId: string;
  registry: SharedObjectData;
  vortex: SharedObjectData;

  constructor({
    registry,
    packageId,
    vortex,
    fullNodeUrl = getFullnodeUrl('devnet'),
  }: ConstructorArgs) {
    this.#suiClient = new SuiClient({
      url: fullNodeUrl,
    });

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
    valueSign,
    relayer,
    relayerFee,
    encryptedOutput1,
    encryptedOutput2,
  }: NewExtDataArgs) {
    const extData = tx.moveCall({
      target: `${this.packageId}::vortex_ext_data::new`,
      arguments: [
        tx.pure.address(recipient),
        tx.pure.u64(value),
        tx.pure.bool(valueSign),
        tx.pure.address(relayer),
        tx.pure.u64(relayerFee),
        tx.pure.u256(encryptedOutput1),
        tx.pure.u256(encryptedOutput2),
      ],
    });

    return { tx, extData };
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
