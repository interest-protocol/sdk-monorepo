import { PaginatedEvents } from '@mysten/sui/client';
import { parseNewCommitmentEvent } from './events';
import { Commitment } from '../vortex-api.types';
import { UtxoPayload } from '../entities/keypair';
import { VortexKeypair } from '../entities/keypair';
import { Utxo } from '../entities/utxo';
import { normalizeStructTag, toHex } from '@mysten/sui/utils';
import { Vortex } from '../vortex';
import { VortexPool } from '../vortex.types';
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

  const allUtxos = [] as UtxoPayload[];

  commitments.forEach((commitment) => {
    try {
      const utxo = vortexKeypair.decryptUtxo(commitment.encryptedOutput);
      allUtxos.push(utxo);
    } catch {
      // Do nothing
    }
  });

  const vortexObjectId =
    typeof vortexPool === 'string' ? vortexPool : vortexPool.objectId;

  const utxos = allUtxos.map(
    (utxo) =>
      new Utxo({ ...utxo, keypair: vortexKeypair, vortexPool: vortexObjectId })
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

export const getUnspentUtxosWithApi = async ({
  commitments,
  vortexKeypair,
  vortexSdk,
  vortexPool,
}: GetUnspentUtxosWithApiArgs) => {
  const allUtxos = [] as UtxoPayload[];

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
      allUtxos.push(utxo);
    } catch {
      // Do nothing
    }
  });

  const utxos = allUtxos.map(
    (utxo) =>
      new Utxo({
        ...utxo,
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
