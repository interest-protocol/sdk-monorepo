export interface CurrentTokenOwnershipsV2AggregateNode {
  owner_address: string;
  current_token_data: {
    collection_id: string;
    current_collection: {
      collection_name: string;
    };
    token_data_id: string;
  };
  amount: number;
}

export interface CurrentTokenOwnershipsV2Aggregate {
  current_token_ownerships_v2_aggregate: {
    aggregate: {
      count: number;
    };
    nodes: CurrentTokenOwnershipsV2AggregateNode[];
  };
}
