export const getCurrentOwnershipsV2AggregateQuery = `query($ownerAddress: String!, $limit: Int, $offset: Int) {
  current_token_ownerships_v2_aggregate(
    where: {owner_address: {_eq: $ownerAddress}},
    limit: $limit,
    offset: $offset
  ) {
    aggregate {
      count
    }
    nodes {
      owner_address
      current_token_data {
        collection_id
        current_collection {
          collection_name
        }
        token_data_id
      }
      amount
    }
  }
}
`;
