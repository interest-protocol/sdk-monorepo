import { PaginatedEvents } from '@mysten/sui/client';
import { parseNewCommitmentEvent } from './events';
import { UtxoPayload } from '../entities/keypair';
import { VortexKeypair } from '../entities/keypair';
import { Utxo } from '../entities/utxo';

import { Vortex } from '../vortex';
import { VortexPool } from '../vortex.types';

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
