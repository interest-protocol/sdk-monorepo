import { getEnv } from '../utils.script';

const NEXA =
  '0x067a5b92098b8b2d21cbdf602031471e5940b4482a6e275d2dc6ef5370499fb7';

const GIVEREP =
  '0xdc19b2928f31b6df46478e4ad9a309aaff6e958a3b568d4bb76264f767bdfbfc';

const BLAST =
  '0x881d835c410f33a1decd8067ce04f6c2ec63eaca196235386b44d315c2152797';

const IPX =
  '0x6aede69ad73e1876023f8e73196f24edb3e7c307ad4553a61600b14431e4ab0a';

(async () => {
  const { executeTx, walletSdk } = await getEnv();

  const { tx } = await walletSdk.newWallet({
    owner: NEXA,
  });

  const { tx: tx2 } = await walletSdk.newWallet({
    tx,
    owner: GIVEREP,
  });

  const { tx: tx3 } = await walletSdk.newWallet({
    tx: tx2,
    owner: BLAST,
  });

  const { tx: tx4 } = await walletSdk.newWallet({
    tx: tx3,
    owner: IPX,
  });

  await executeTx(tx4);
})();
