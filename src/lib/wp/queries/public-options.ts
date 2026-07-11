import {gql} from "@apollo/client";

export const GET_PUBLIC_OPTIONS = gql`
    query GetPublicOptions {
      publicOptions {
        key
        value
      }
    }
`;

export default GET_PUBLIC_OPTIONS;
