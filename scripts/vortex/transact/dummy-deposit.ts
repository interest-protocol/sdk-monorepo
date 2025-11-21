import { getEnv } from '../utils.script';
import { prove, verify } from '../pkg/nodejs/vortex';
import { poseidon1, poseidon3 } from '@interest-protocol/vortex-sdk';

export const deposit = async () => {
  const { provingKey, verifyingKey } = await getEnv();

  // Helper to match SDK's poseidon usage

  // Input 0: zero amount (Merkle check skipped)
  const privateKey0 = 12345n;
  const publicKey0 = poseidon1(privateKey0);
  const amount0 = 0n;
  const blinding0 = 999n;
  const pathIndex0 = 0n;

  const commitment0 = poseidon3(amount0, publicKey0, blinding0);
  const signature0 = poseidon3(privateKey0, commitment0, pathIndex0);
  const nullifier0 = poseidon3(commitment0, pathIndex0, signature0);

  // Input 1: zero amount (Merkle check skipped)
  const privateKey1 = 67890n;
  const publicKey1 = poseidon1(privateKey1);
  const amount1 = 0n;
  const blinding1 = 888n;
  const pathIndex1 = 1n;

  const commitment1 = poseidon3(amount1, publicKey1, blinding1);
  const signature1 = poseidon3(privateKey1, commitment1, pathIndex1);
  const nullifier1 = poseidon3(commitment1, pathIndex1, signature1);

  // Output 0: zero amount
  const outPublicKey0 = publicKey0;
  const outAmount0 = 0n;
  const outBlinding0 = 777n;
  const outCommitment0 = poseidon3(outAmount0, outPublicKey0, outBlinding0);

  // Output 1: zero amount
  const outPublicKey1 = publicKey1;
  const outAmount1 = 0n;
  const outBlinding1 = 666n;
  const outCommitment1 = poseidon3(outAmount1, outPublicKey1, outBlinding1);

  // Empty Merkle paths (26 levels)
  const emptyPath = Array(26)
    .fill(null)
    .map(() => ['0', '0']);

  const input = {
    // Public inputs
    root: '0',
    publicAmount: '0',
    extDataHash: '0',
    inputNullifier0: nullifier0.toString(),
    inputNullifier1: nullifier1.toString(),
    outputCommitment0: outCommitment0.toString(),
    outputCommitment1: outCommitment1.toString(),

    // Private inputs - Input UTXOs
    inPrivateKey0: privateKey0.toString(),
    inPrivateKey1: privateKey1.toString(),
    inAmount0: amount0.toString(),
    inAmount1: amount1.toString(),
    inBlinding0: blinding0.toString(),
    inBlinding1: blinding1.toString(),
    inPathIndex0: pathIndex0.toString(),
    inPathIndex1: pathIndex1.toString(),
    merklePath0: emptyPath,
    merklePath1: emptyPath,

    // Private inputs - Output UTXOs
    outPublicKey0: outPublicKey0.toString(),
    outPublicKey1: outPublicKey1.toString(),
    outAmount0: outAmount0.toString(),
    outAmount1: outAmount1.toString(),
    outBlinding0: outBlinding0.toString(),
    outBlinding1: outBlinding1.toString(),
  };

  console.log('\nGenerating proof (this may take 5-15 seconds)...');

  const proofJson = prove(JSON.stringify(input), provingKey);

  console.log('\nProof generated, parsing...');
  const proof = JSON.parse(proofJson);
  console.log('Proof public inputs:', proof.publicInputs);

  console.log('\nVerifying...');
  const isValid = verify(proofJson, verifyingKey);

  return isValid;
};

(async () => {
  try {
    const isValid = await deposit();
    console.log('isValid', typeof isValid, isValid);

    if (isValid) {
      console.log('SUCCESS!! PROOF VERIFIED');
    } else {
      console.log('FAILED - Proof invalid');
    }
  } catch (error) {
    console.log(error);
  }
})();
