import { MoveResourceType } from './core.types';

export function hex2a(hexx: string) {
  const hex = hexx.toString(); //force conversion
  let str = '';
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

export const moveResourceTypeToStructTag = (resource: MoveResourceType) =>
  `${resource.account_address}::${hex2a(resource.module_name.slice(2))}::${hex2a(resource.struct_name.slice(2))}`;
