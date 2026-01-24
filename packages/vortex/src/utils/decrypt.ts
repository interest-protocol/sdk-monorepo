import type { PaginatedEvents } from '@mysten/sui/client';
import type { Commitment } from '../vortex-api.types';
import type { UtxoPayload, VortexKeypair } from '../entities/keypair';
import type { Vortex } from '../vortex';
import type { VortexPool } from '../vortex.types';

import { parseNewCommitmentEvent } from './events';
import { Utxo } from '../entities/utxo';
import { normalizeStructTag, toHex } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

interface GetUnspentUtxosArgs {
  commitmentEvents: PaginatedEvents;
  vortexKeypair: VortexKeypair;
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
}

export const getUnspentUtxos = async ({
  commitmentEvents,
  vortexKeypair,
  vortexSdk,
  vortexPool,
}: GetUnspentUtxosArgs) => {
  const commitments = parseNewCommitmentEvent(commitmentEvents);

  const vortexObjectId =
    typeof vortexPool === 'string' ? vortexPool : vortexPool.objectId;

  const decryptedWithIndex: { utxo: UtxoPayload; chainIndex: bigint }[] = [];

  commitments.forEach((commitment) => {
    try {
      const utxo = vortexKeypair.decryptUtxo(commitment.encryptedOutput);
      // Use index from chain (commitment.index) instead of decrypted index
      // to avoid concurrency/latency issues where encrypted index can be stale
      decryptedWithIndex.push({ utxo, chainIndex: commitment.index });
    } catch {
      // HMAC verification failed - wrong keypair
    }
  });

  const utxos = decryptedWithIndex.map(
    ({ utxo, chainIndex }) =>
      new Utxo({
        ...utxo,
        index: chainIndex, // Override with on-chain index
        keypair: vortexKeypair,
        vortexPool: vortexObjectId,
      })
  );

  const nullifiers = utxos.map((utxo) => utxo.nullifier());

  const isNullifierSpentArray = await vortexSdk.areNullifiersSpent({
    nullifiers,
    vortexPool,
  });

  const unspentUtxos = utxos.filter(
    (_, index) => !isNullifierSpentArray[index]
  );

  return unspentUtxos;
};

interface GetUnspentUtxosWithApiArgs {
  commitments: Commitment[];
  vortexKeypair: VortexKeypair;
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
}

interface GetUnspentUtxosWithApiAndCommitmentsArgs {
  commitments: Pick<Commitment, 'coinType' | 'encryptedOutput' | 'index'>[];
  vortexKeypair: VortexKeypair;
  vortexSdk: Vortex;
  vortexPool: string | VortexPool;
}

export const getUnspentUtxosWithApi = async ({
  commitments,
  vortexKeypair,
  vortexSdk,
  vortexPool,
}: GetUnspentUtxosWithApiArgs) => {
  const decryptedWithIndex: { utxo: UtxoPayload; chainIndex: bigint }[] = [];

  const vortexObject = await vortexSdk.resolveVortexPool(vortexPool);

  commitments.forEach((commitment) => {
    invariant(
      normalizeStructTag(commitment.coinType) ===
        normalizeStructTag(vortexObject.coinType),
      'Commitment coin type does not match vortex pool coin type'
    );
    try {
      const encryptedOutputHex = toHex(
        Uint8Array.from(commitment.encryptedOutput)
      );
      const utxo = vortexKeypair.decryptUtxo(encryptedOutputHex);
      // Use index from chain (commitment.index) instead of decrypted index
      // to avoid concurrency/latency issues where encrypted index can be stale
      decryptedWithIndex.push({ utxo, chainIndex: BigInt(commitment.index) });
    } catch {
      // HMAC verification failed - wrong keypair
    }
  });

  const utxos = decryptedWithIndex.map(
    ({ utxo, chainIndex }) =>
      new Utxo({
        ...utxo,
        index: chainIndex, // Override with on-chain index
        keypair: vortexKeypair,
        vortexPool: vortexObject.objectId,
      })
  );

  const nullifiers = utxos.map((utxo) => utxo.nullifier());

  const isNullifierSpentArray = await vortexSdk.areNullifiersSpent({
    nullifiers,
    vortexPool,
  });

  const unspentUtxos = utxos.filter(
    (_, index) => !isNullifierSpentArray[index]
  );

  return unspentUtxos;
};

export const getUnspentUtxosWithApiAndCommitments = async ({
  commitments,
  vortexKeypair,
  vortexSdk,
  vortexPool,
}: GetUnspentUtxosWithApiAndCommitmentsArgs) => {
  const decryptedWithIndex: { utxo: UtxoPayload; chainIndex: bigint }[] = [];
  const userCommitments = [] as Pick<Commitment, 'coinType' | 'encryptedOutput' | 'index'>[];

  const vortexObject = await vortexSdk.resolveVortexPool(vortexPool);

  commitments.forEach((commitment) => {
    invariant(
      normalizeStructTag(commitment.coinType) ===
        normalizeStructTag(vortexObject.coinType),
      'Commitment coin type does not match vortex pool coin type'
    );
    try {
      const encryptedOutputHex = toHex(
        Uint8Array.from(commitment.encryptedOutput)
      );
      const utxo = vortexKeypair.decryptUtxo(encryptedOutputHex);
      userCommitments.push({
        coinType: commitment.coinType,
        encryptedOutput: commitment.encryptedOutput,
        index: commitment.index,
      });
      // Use index from chain (commitment.index) instead of decrypted index
      // to avoid concurrency/latency issues where encrypted index can be stale
      decryptedWithIndex.push({ utxo, chainIndex: BigInt(commitment.index) });
    } catch {
      // HMAC verification failed - wrong keypair
    }
  });

  const utxos = decryptedWithIndex.map(
    ({ utxo, chainIndex }) =>
      new Utxo({
        ...utxo,
        index: chainIndex, // Override with on-chain index
        keypair: vortexKeypair,
        vortexPool: vortexObject.objectId,
      })
  );

  const nullifiers = utxos.map((utxo) => utxo.nullifier());

  const isNullifierSpentArray = await vortexSdk.areNullifiersSpent({
    nullifiers,
    vortexPool,
  });

  const unspentUtxos = utxos.filter(
    (_, index) => !isNullifierSpentArray[index]
  );

  return { unspentUtxos, userCommitments };
};
