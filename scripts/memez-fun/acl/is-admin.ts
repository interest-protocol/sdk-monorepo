import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, ownedObjects } = await getEnv();

  const result = await aclSdk.isAdmin({
    admin: ownedObjects.ADMIN,
  });

  console.log(result);
})();
