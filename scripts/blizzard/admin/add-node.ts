import { OWNED_OBJECTS, SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';

import { blizzardSDK, executeTx, wwalAcl } from '../utils.script';

const allowedNodes = [
  // MIRAI
  '0xb07ab3db6b190fe6e32e499e7c79499786174689ae835485c178da0e9a977180',
  // Mysten Labs 1
  '0x82ff00c685e4946c9c2fc45e031af8eb3188ea74e9dafa494ee2bf50032a5851',
  // Mysten Labs 0
  '0xf11fef95c8c5a17c2cbc51c15483e38585cf996110b8d50b8e1957442dc736fd',
  // Four Pillars
  '0x61d5598a35e198e6cafac7eb808191da3742a2a1789716ab89a68a1f934ee5c6',
  // Tradeport
  '0xd9817019d85cb8b8206e22f7e47b783b4fd9148b500d3ee74e0a3ac3c124b08d',
  // Aftermath
  '0x1c0a00e9bb4b8087c7ae7f49de7e2810d62f86515d57b47c2652b9fa4f8bee99',
  // Cetus
  '0xa9351a41439ec5424935354fd511dc8b263ed225450edeb90811687ab82b9a04',
  // Pinata
  '0x662543d9147db99c2c6e5a338f49c0f2278bb98a83bebc587d9d3d45edea9a69',
  // Doubleup
  '0x691f7eea8dc45dc3a0767bc000cf8735504997ad60d19d57e7fcff6f80f6c6bc',
  //Suilend
  '0xe5cc25058895aeb7024ff044c17f4939f34f5c4df36744af1aae34e28a0510b5',
  // Typus
  '0x28ba8193c22608c32aa21b1dcd732a6a926831e3c074a482e1c139005bec0c8a',
  // Scallop
  '0x95281ab49ebe717f7d2aeca9f595a587aa6adf9208ebc68b5b8c40195a941333',
  // Bucket
  '0x69c4793731a971d5652e99cc34e9714e6ebb7a29576ac4469d13acdc722a0f15',
  // alphaFi
  '0xc9f0d4effbeb5920c22520451f7fe4abe485259093260e03d74e08ce189ea890',
  // Interest Labs
  '0xe2b5df873dbcddfea64dcd16f0b581e3b9893becf991649dacc9541895c898cb',
  // SUiSec
  '0x624e57d3661837a71ee6ca01ceee1d5e9177511d70a623315536b339e47f106a',
  // Stake Engine
  '0x9a56292b1246e836a516dc1486c47f45a420e07ea3293f817acc899c65f26a99',
];

(async () => {
  const { tx, returnValues } = await wwalAcl.signIn({
    admin: OWNED_OBJECTS.WWAL_ADMIN,
  });
  const promises: any[] = [];
  for (const nodeId of allowedNodes) {
    promises.push(
      blizzardSDK.addNode({
        tx,
        nodeId,
        adminWitness: returnValues,
        blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
          mutable: true,
        }).objectId,
      })
    );
  }
  await Promise.all(promises);

  await executeTx(tx);
})();
