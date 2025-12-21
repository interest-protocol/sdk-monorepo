import invariant from 'tiny-invariant';
import {
  VortexAPIConstructorArgs,
  VORTEX_API_URL,
  HealthResponse,
  AccountsResponse,
  CreateAccountRequest,
  AccountResponse,
  PoolsResponse,
  GetPoolsArgs,
  CommitmentsResponse,
  GetCommitmentsArgs,
  MerklePathRequest,
  MerklePathResponse,
  ExecuteTransactionRequest,
  TransactionResponse,
  RelayerResponse,
  ApiResponse,
  ErrorResponse,
} from './vortex-api.types';

export class VortexAPI {
  #apiUrl: string;

  constructor({ apiUrl = VORTEX_API_URL }: VortexAPIConstructorArgs = {}) {
    this.#apiUrl = apiUrl.replace(/\/$/, '');
  }

  async health(): Promise<HealthResponse> {
    const response = await this.#get<HealthResponse>('/api/health');

    this.#assertSuccess(response);

    return response;
  }

  async getAccounts(hashedSecret: string): Promise<AccountsResponse> {
    const params = new URLSearchParams({ hashed_secret: hashedSecret });

    const response = await this.#get<AccountsResponse>(
      `/api/v1/accounts?${params.toString()}`
    );

    this.#assertSuccess(response);

    return response;
  }

  async createAccount(args: CreateAccountRequest): Promise<AccountResponse> {
    const response = await this.#post<AccountResponse>('/api/v1/accounts', {
      owner: args.owner,
      hashedSecret: args.hashedSecret,
    });

    this.#assertSuccess(response);

    return response;
  }

  async getPools(args: GetPoolsArgs = {}): Promise<PoolsResponse> {
    const params = new URLSearchParams();

    if (args.page !== undefined) {
      params.set('page', args.page.toString());
    }

    if (args.limit !== undefined) {
      params.set('limit', args.limit.toString());
    }

    if (args.coinType !== undefined) {
      params.set('coin_type', args.coinType);
    }

    const query = params.toString();
    const path = query ? `/api/v1/pools?${query}` : '/api/v1/pools';

    const response = await this.#get<PoolsResponse>(path);

    this.#assertSuccess(response);

    return response;
  }

  async getCommitments(args: GetCommitmentsArgs): Promise<CommitmentsResponse> {
    const params = new URLSearchParams({
      coin_type: args.coinType,
      index: args.index.toString(),
    });

    if (args.op !== undefined) {
      params.set('op', args.op);
    }

    if (args.page !== undefined) {
      params.set('page', args.page.toString());
    }

    if (args.limit !== undefined) {
      params.set('limit', args.limit.toString());
    }

    const response = await this.#get<CommitmentsResponse>(
      `/api/v1/commitments?${params.toString()}`
    );

    this.#assertSuccess(response);

    return response;
  }

  async getMerklePath(args: MerklePathRequest): Promise<MerklePathResponse> {
    const response = await this.#post<MerklePathResponse>(
      '/api/v1/merkle/path',
      {
        coin_type: args.coinType,
        index: args.index,
        amount: args.amount,
        public_key: args.publicKey,
        blinding: args.blinding,
        vortex_pool: args.vortexPool,
      }
    );

    this.#assertSuccess(response);

    return response;
  }

  async executeTransaction(
    args: ExecuteTransactionRequest
  ): Promise<TransactionResponse> {
    const response = await this.#post<TransactionResponse>(
      '/api/v1/transactions',
      {
        txBytes: args.txBytes,
      },
      args.apiKey
    );

    this.#assertSuccess(response);

    return response;
  }

  async getRelayer(): Promise<RelayerResponse> {
    const response = await this.#get<RelayerResponse>('/api/v1/relayer');

    this.#assertSuccess(response);

    return response;
  }

  async #get<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.#apiUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json() as Promise<ApiResponse<T>>;
  }

  async #post<T>(
    path: string,
    body: Record<string, unknown>,
    apiKey?: string
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.#apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey ?? '',
      },
      body: JSON.stringify(body),
    });

    return response.json() as Promise<ApiResponse<T>>;
  }

  #assertSuccess<T extends { success: true }>(
    response: ApiResponse<T>
  ): asserts response is T {
    invariant(
      (response as T).success === true,
      `VortexAPI request failed: ${(response as ErrorResponse).error}`
    );
  }
}

export const vortexAPI = new VortexAPI();
