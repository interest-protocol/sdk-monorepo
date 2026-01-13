import type { MerklePath } from './utils';

export const VORTEX_API_URL = 'https://api.vortexfi.xyz';

export interface VortexAPIConstructorArgs {
  apiUrl?: string;
}

export type ServiceStatus = 'healthy' | 'unhealthy';

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  services: {
    mongodb: ServiceStatus;
    redis: ServiceStatus;
    sui: ServiceStatus;
  };
  timestamp: string;
}

export interface HealthResponse {
  success: true;
  data: HealthStatus;
}

export interface Account {
  id: string;
  objectId: string;
  hashedSecret: string;
  owner: string;
  createdAt: string;
  txDigest: string;
  hidden: boolean;
}

export interface AccountsResponse {
  success: true;
  data: Account[];
}

export interface GetAccountsArgs {
  hashedSecret: string;
  excludeHidden?: boolean;
}

export interface CreateAccountRequest {
  owner: string;
  hashedSecret: string;
}

export interface AccountResponse {
  success: true;
  data: Account;
}

export interface HideAccountsRequest {
  accountObjectIds?: string[];
  hashedSecret?: string;
  apiKey: string;
}

export interface HideAccountsResponse {
  success: true;
  data: {
    modifiedCount: number;
  };
}

export interface Pool {
  id: string;
  objectId: string;
  coinType: string;
  digest: string;
  sender: string;
  checkpoint: number;
  checkpointTimestampMs: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PoolsResponse {
  success: true;
  data: {
    items: Pool[];
    pagination: Pagination;
  };
}

export interface GetPoolsArgs {
  page?: number;
  limit?: number;
  coinType?: string;
}

export interface Commitment {
  id: string;
  index: number;
  commitment: string;
  coinType: string;
  encryptedOutput: number[];
  digest: string;
  sender: string;
  checkpoint: number;
  checkpointTimestampMs: number;
}

export interface CommitmentsResponse {
  success: true;
  data: {
    items: Commitment[];
    pagination: Pagination;
  };
}

export type CommitmentsOperator = 'gt' | 'gte' | 'lt' | 'lte';

export interface GetCommitmentsArgs {
  coinType: string;
  index: number;
  op?: CommitmentsOperator;
  page?: number;
  limit?: number;
}

export interface MerklePathRequest {
  coinType: string;
  index: number;
  amount: string;
  publicKey: string;
  blinding: string;
  vortexPool: string;
}

export interface MerklePathResponse {
  success: true;
  data: {
    path: MerklePath;
    root: string;
  };
}

export interface ExecuteTransactionRequest {
  txBytes: string;
  apiKey: string;
}

export interface TransactionResponse {
  success: true;
  data: {
    digest: string;
  };
}

export interface Relayer {
  address: string;
}

export interface RelayerResponse {
  success: true;
  data: Relayer;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = T | ErrorResponse;
