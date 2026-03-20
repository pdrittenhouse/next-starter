import {gql} from "@apollo/client";

export const GET_REDIRECTS = gql`
    query GetRedirects {
      redirects {
        from
        to
        statusCode
        matchType
      }
    }
`;

export default GET_REDIRECTS;
