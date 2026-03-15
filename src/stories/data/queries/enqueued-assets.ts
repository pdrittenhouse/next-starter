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

export const GET_THEME_ENQUEUED_ASSETS = gql`
    query GetThemeEnqueuedAssets {
      themeEnqueuedScripts {
        handle
        src
        version
        dependencies
        context
      }
      themeEnqueuedStylesheets {
        handle
        src
        version
        dependencies
        context
      }
    }
`;

export default GET_REGISTERED_SCRIPTS;
