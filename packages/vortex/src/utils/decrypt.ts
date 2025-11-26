import { PaginatedEvents } from '@mysten/sui/client';
import { parseNewCommitmentEvent } from './events';
import { UtxoPayload } from '../entities/keypair';
import { VortexKeypair } from '../entities/keypair';
import { Utxo } from '../entities/utxo';

import { Vortex } from '../vortex';

interface GetUnspentUtxosArgs {
  commitmentEvents: PaginatedEvents;
  senderVortexKeypair: VortexKeypair;
  vortex: Vortex;
}

export const getUnspentUtxos = async ({
  commitmentEvents,
  senderVortexKeypair,
  vortex,
}: GetUnspentUtxosArgs) => {
  const commitments = parseNewCommitmentEvent(commitmentEvents);

  const allUtxos = [] as UtxoPayload[];

  commitments.forEach((commitment) => {
    try {
      const utxo = senderVortexKeypair.decryptUtxo(commitment.encryptedOutput);
      allUtxos.push(utxo);
    } catch {
      // Do nothing
    }
  });

  const utxos = allUtxos.map(
    (utxo) => new Utxo({ ...utxo, keypair: senderVortexKeypair })
  );

  const nullifiers = utxos.map((utxo) => utxo.nullifier());

  const isNullifierSpentArray = await vortex.areNullifiersSpent(nullifiers);

  const unspentUtxos = utxos.filter(
    (_, index) => !isNullifierSpentArray[index]
  );

  return unspentUtxos;
};
