import { Aptos } from '@aptos-labs/ts-sdk';
import invariant from 'tiny-invariant';

import { PACKAGES } from './constants';
import { ConstructorArgs } from './dex.types';
import { getDefaultConstructorArgs } from './utilts';

export class Dex {
  #client: Aptos;
  #network: ConstructorArgs['network'];
  #packages = PACKAGES;

  constructor(args: ConstructorArgs) {
    const data = {
      ...getDefaultConstructorArgs(),
      ...args,
    };

    invariant(data.client, 'Client is required');
    invariant(data.network, 'Network is required');

    this.#client = data.client;
    this.#network = data.network;
  }
}
