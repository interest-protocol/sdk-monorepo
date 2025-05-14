import { Transaction } from '@mysten/sui/transactions';
import { SUI_FRAMEWORK_ADDRESS, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { isValidSuiObjectId, normalizeSuiAddress } from '@mysten/sui/utils';
import { has } from 'ramda';
import invariant from 'tiny-invariant';

import { ObjectInput, OwnedObject, SharedObject } from './core.types';

export class SuiCoreSDK {
  ownedObject(tx: Transaction, obj: ObjectInput) {
    if (has('objectId', obj) && has('version', obj) && has('digest', obj)) {
      return tx.objectRef(obj);
    }

    return typeof obj === 'string' ? tx.object(obj) : obj;
  }

  sharedObject(tx: Transaction, obj: SharedObject) {
    if (typeof obj === 'string') {
      return tx.object(obj);
    }

    return tx.sharedObjectRef(obj);
  }

  assertObjectId(obj: OwnedObject | SharedObject) {
    if (typeof obj === 'string') {
      invariant(isValidSuiObjectId(obj), 'Invalid object id');
    } else if (typeof obj === 'object' && 'objectId' in obj) {
      invariant(isValidSuiObjectId(obj.objectId), 'Invalid object id');
    }
  }

  assertNotZeroAddress(address: string) {
    invariant(
      normalizeSuiAddress(address) !== normalizeSuiAddress('0x0'),
      'Invalid address: 0x0'
    );
  }

  zeroSuiCoin(tx: Transaction) {
    return tx.moveCall({
      package: SUI_FRAMEWORK_ADDRESS,
      module: 'coin',
      function: 'zero',
      typeArguments: [SUI_TYPE_ARG],
    });
  }
}
