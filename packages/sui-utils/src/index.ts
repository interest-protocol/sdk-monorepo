import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import chalk from 'chalk';
import invariant from 'tiny-invariant';
import util from 'util';

// Define your log levels
export const logInfo = (msg: any) =>
  console.log(
    chalk.blue(`ℹ️ INFO: 
      
      ${util.inspect(msg, false, null, true)}`)
  );

export const logSuccess = (msg: any) =>
  console.log(
    chalk.green(`✅ SUCCESS: 
      
      ${util.inspect(msg, false, null, true)}`)
  );

export const logWarning = (msg: any) =>
  console.log(
    chalk.yellow(`⚠️ WARNING: 
      
      ${util.inspect(msg, false, null, true)}`)
  );

export const logError = (msg: any) =>
  console.log(
    chalk.red(`❌ ERROR: 
    
    ${util.inspect(msg, false, null, true)}`)
  );

export const executeTx = async (tx: Transaction, client = suiClient) => {
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });

  // return if the tx hasn't succeed
  if (result.effects?.status?.status !== 'success') {
    logError('\n\nTX failed');
    return;
  }

  logSuccess(`Success with digest: ${result.digest}`);

  if (result.effects.created) {
    logInfo(result.effects.created);
  }
};

export const sleep = async (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function removeLeadingZeros(address: string): string {
  return (address as any).replaceAll(/0x0+/g, '0x');
}

export const suiClient = new SuiClient({
  url: getFullnodeUrl('mainnet'),
});

export const testnetSuiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

invariant(process.env.KEY, 'Private key missing');

export const keypair = Ed25519Keypair.fromSecretKey(
  Uint8Array.from(Buffer.from(process.env.KEY, 'base64')).slice(1)
);
