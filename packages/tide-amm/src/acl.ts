import { AclSDK } from '@interest-protocol/acl-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';

import { TIDE_ACL_OBJECT, TIDE_AMM_OTW } from './constants';

const aclObject = TIDE_ACL_OBJECT({ mutable: true });

export const makeTideAclSdk = (
  fullNodeUrl: string = getFullnodeUrl('mainnet')
) =>
  new AclSDK({
    fullNodeUrl,
    otw: TIDE_AMM_OTW,
    aclObjectId: aclObject.objectId,
    aclInitialSharedVersion: aclObject.initialSharedVersion,
  });
