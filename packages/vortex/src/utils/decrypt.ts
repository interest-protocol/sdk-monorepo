import { PaginatedEvents } from '@mysten/sui/client';
import { parseNewCommitmentEvent } from './events';
import { UtxoPayload } from '../entities/keypair';
import { VortexKeypair } from '../entities/keypair';
import { Utxo } from '../entities/utxo';
import { BN } from 'bn.js';

export const getUnspentUtxos = (
  commitmentEvents: PaginatedEvents,
  senderVortexKeypair: VortexKeypair
) => {
  const parsedCommitmentEvents = parseNewCommitmentEvent(commitmentEvents);

  const unspentUtxos = [] as UtxoPayload[];

  parsedCommitmentEvents.forEach((event) => {
    try {
      const utxo = senderVortexKeypair.decryptUtxo(event.encryptedOutput);
      unspentUtxos.push({ ...utxo, index: event.index });
    } catch {}
  });

  unspentUtxos.sort((a, b) => new BN(b.index).cmp(new BN(a.index)));

  return unspentUtxos.map(
    (utxo) => new Utxo({ ...utxo, keypair: senderVortexKeypair })
  );
};
