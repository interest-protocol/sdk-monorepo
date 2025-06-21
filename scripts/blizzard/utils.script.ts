import {
  BlizzardAclSDK,
  BlizzardSDK,
  SHARED_OBJECTS,
} from '@interest-protocol/blizzard-sdk';

export const INTEREST_LABS_NODE =
  '0xe2b5df873dbcddfea64dcd16f0b581e3b9893becf991649dacc9541895c898cb';

export const POW_9 = 10n ** 9n;

export const MAX_BPS = 10_000n;

export const blizzardAcl = new BlizzardAclSDK({
  acl: SHARED_OBJECTS.BLIZZARD_ACL({ mutable: true }),
});

export const wwalAcl = new BlizzardAclSDK({
  acl: SHARED_OBJECTS.WWAL_ACL({ mutable: true }),
});

export const blizzardSDK = new BlizzardSDK();
