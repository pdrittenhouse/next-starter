import {gql} from "@apollo/client";

export const GET_REGISTERED_SCRIPTS = gql`
    query GetRegisteredScripts {
      registeredScripts {
        nodes {
          id
          handle
          src
          version
          dependencies {
            handle
          }
          extra
        }
      }
    }
`;

export const GET_REGISTERED_STYLESHEETS = gql`
    query GetRegisteredStylesheets {
      registeredStylesheets {
        nodes {
          id
          handle
          src
          version
          dependencies {
            handle
          }
          extra
        }
      }
    }
`;

export default GET_REGISTERED_SCRIPTS;
