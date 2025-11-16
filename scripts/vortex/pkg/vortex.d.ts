/* tslint:disable */
/* eslint-disable */
export function main(): void;
/**
 * Generates a zero-knowledge proof for a privacy-preserving transaction
 *
 * # Arguments
 * * `input_json` - JSON string containing all circuit inputs
 * * `proving_key_hex` - Hex-encoded proving key (generated during setup)
 *
 * # Returns
 * JSON string containing the proof and public inputs
 *
 * # Example
 * ```javascript
 * const input = {
 *   root: "12345...",
 *   publicAmount: "1000",
 *   // ... other inputs
 * };
 * const proof = prove(JSON.stringify(input), provingKeyHex);
 * const { proofA, proofB, proofC, publicInputs } = JSON.parse(proof);
 * ```
 */
export function prove(input_json: string, proving_key_hex: string): string;
/**
 * Verifies a proof (useful for testing before submitting to chain)
 *
 * # Arguments
 * * `proof_json` - JSON string containing proof output from `prove()`
 * * `verifying_key_hex` - Hex-encoded verifying key
 *
 * # Returns
 * "true" if proof is valid, "false" otherwise
 */
export function verify(proof_json: string, verifying_key_hex: string): string;
