import { AclSDK } from '@interest-protocol/acl-sdk';
import { getFullnodeUrl } from '@mysten/sui/client';

import {
  INTEREST_ACL_PACKAGE,
  TIDE_ACL_OBJECT,
  TIDE_AMM_OTW,
} from './constants';

export const TideAclSdk = new AclSDK({
  package: INTEREST_ACL_PACKAGE,
  fullNodeUrl: getFullnodeUrl('mainnet'),
  otw: TIDE_AMM_OTW,
  aclObjectId: TIDE_ACL_OBJECT({ mutable: true }).objectId,
  aclInitialSharedVersion: TIDE_ACL_OBJECT({ mutable: true })
    .initialSharedVersion,
});
