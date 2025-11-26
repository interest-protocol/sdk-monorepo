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
export function verify(proof_json: string, verifying_key_hex: string): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly prove: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly verify: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly main: () => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
