import {
  InterestStableSwapAclSDK,
  InterestStableSwapSDK,
  SHARED_OBJECTS,
} from '../../packages/interest-stable-swap-sdk/src';

export const POW_9 = 10n ** 9n;

export const acl = new InterestStableSwapAclSDK({
  acl: SHARED_OBJECTS.ACL({ mutable: true }),
});

export const stableSwapSDK = new InterestStableSwapSDK();
