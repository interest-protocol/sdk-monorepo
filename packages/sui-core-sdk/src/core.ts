import { Transaction } from '@mysten/sui/transactions';
import { has } from 'ramda';

import { ObjectInput } from './core.types';

export class SuiCoreSDK {
  ownedObject(tx: Transaction, obj: ObjectInput) {
    if (has('objectId', obj) && has('version', obj) && has('digest', obj)) {
      return tx.objectRef(obj);
    }

    return typeof obj === 'string' ? tx.object(obj) : obj;
  }
}
