import { PaginatedEvents } from '@mysten/sui/client';
import { toHex } from '@mysten/sui/utils';
import { pathOr } from 'ramda';

export const parseNewCommitmentEvent = (events: PaginatedEvents) =>
  events.data.map((event) => {
    return {
      commitment: BigInt(pathOr('0', ['commitment'], event.parsedJson)),
      index: BigInt(pathOr('0', ['index'], event.parsedJson)),
      encryptedOutput: toHex(
        Uint8Array.from(
          pathOr([], ['encrypted_output'], event.parsedJson) as number[]
        )
      ),
    };
  });
