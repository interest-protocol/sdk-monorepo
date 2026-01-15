import invariant from 'tiny-invariant';
import {
  VortexAPIConstructorArgs,
  VORTEX_API_URL,
  HealthResponse,
  AccountsResponse,
  GetAccountsArgs,
  CreateAccountRequest,
  AccountResponse,
  HideAccountsRequest,
  HideAccountsResponse,
  PoolsResponse,
  GetPoolsArgs,
  Commitment,
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

  async getAccounts(args: GetAccountsArgs): Promise<AccountsResponse> {
    const params = new URLSearchParams({ hashed_secret: args.hashedSecret });

    if (args.excludeHidden !== undefined) {
      params.set('exclude_hidden', args.excludeHidden.toString());
    }

    const response = await this.#get<AccountsResponse>(
      `/api/v1/accounts?${params.toString()}`,
      args.apiKey
    );

    this.#assertSuccess(response);

    return response;
  }

  async createAccount(args: CreateAccountRequest): Promise<AccountResponse> {
    const response = await this.#post<AccountResponse>(
      '/api/v1/accounts',
      {
        owner: args.owner,
        hashedSecret: args.hashedSecret,
      },
      args.apiKey
    );

    this.#assertSuccess(response);

    return response;
  }

  async hideAccounts(args: HideAccountsRequest): Promise<HideAccountsResponse> {
    const body: Record<string, unknown> = {};

    if (args.accountObjectIds) {
      body.accountObjectIds = args.accountObjectIds;
    }

    if (args.hashedSecret) {
      body.hashedSecret = args.hashedSecret;
    }

    const response = await this.#post<HideAccountsResponse>(
      '/api/v1/accounts/hide',
      body,
      args.apiKey
    );

    this.#assertSuccess(response);

    return response;
  }

  async getPools(args: GetPoolsArgs = {}): Promise<PoolsResponse> {
    const params = new URLSearchParams();

    if (args.page) {
      params.set('page', args.page.toString());
    }

    if (args.limit) {
      params.set('limit', args.limit.toString());
    }

    if (args.coinType) {
      params.set('coin_type', args.coinType);
    }

    const query = params.toString();
    const path = query ? `/api/v1/pools?${query}` : '/api/v1/pools';

    const response = await this.#get<PoolsResponse>(path, args.apiKey);

    this.#assertSuccess(response);

    return response;
  }

  async getCommitments(args: GetCommitmentsArgs): Promise<CommitmentsResponse> {
    const params = new URLSearchParams({
      coin_type: args.coinType,
      index: args.index.toString(),
    });

    if (args.op) {
      params.set('op', args.op);
    }

    if (args.page) {
      params.set('page', args.page.toString());
    }

    if (args.limit) {
      params.set('limit', args.limit.toString());
    }

    const response = await this.#get<CommitmentsResponse>(
      `/api/v1/commitments?${params.toString()}`,
      args.apiKey
    );

    this.#assertSuccess(response);

    return response;
  }

  async getAllCommitments(
    args: Omit<GetCommitmentsArgs, 'page'>
  ): Promise<Commitment[]> {
    const allCommitments: Commitment[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await this.getCommitments({ ...args, page, apiKey: args.apiKey });
      allCommitments.push(...response.data.items);
      hasNext = response.data.pagination.hasNext;
      page++;
    }

    return allCommitments;
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
      },
      args.apiKey
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

  async #get<T>(path: string, apiKey?: string): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${this.#apiUrl}${path}`, {
      method: 'GET',
      headers,
    });

    return response.json() as Promise<ApiResponse<T>>;
  }

  async #post<T>(
    path: string,
    body: Record<string, unknown>,
    apiKey?: string
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${this.#apiUrl}${path}`, {
      method: 'POST',
      headers,
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
