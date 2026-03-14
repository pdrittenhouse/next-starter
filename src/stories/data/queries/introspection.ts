import {gql} from "@apollo/client";

export const GET_SCHEMA_QUERY_FIELDS = gql`
  query GetSchemaQueryFields {
    __schema {
      queryType {
        fields {
          name
          description
          type {
            name
            kind
          }
        }
      }
    }
  }
`;

export default GET_SCHEMA_QUERY_FIELDS;
