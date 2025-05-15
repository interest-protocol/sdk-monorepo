import { AclSDK } from '@interest-protocol/acl-sdk';

import { PACKAGES, SHARED_OBJECTS, TYPES } from './constants';
import type { MakeMemezAclSdkArgs } from './types/memez.types';

export const makeMemezAclSdk = ({
  network,
  fullNodeUrl,
}: MakeMemezAclSdkArgs) =>
  new AclSDK({
    package: PACKAGES[network].INTEREST_ACL.latest,
    fullNodeUrl,
    otw: TYPES[network].MEMEZ_OTW,
    aclObjectId: SHARED_OBJECTS[network].ACL({ mutable: true }).objectId,
    aclInitialSharedVersion: SHARED_OBJECTS[network].ACL({ mutable: true })
      .initialSharedVersion,
  });
