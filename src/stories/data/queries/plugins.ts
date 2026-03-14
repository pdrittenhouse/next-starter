import {gql} from "@apollo/client";

export const GET_ALL_PLUGINS = gql`
    query GetAllPlugins {
      plugins {
        edges {
          node {
            id
            name
            pluginUri
            description
            author
            authorUri
            version
            isRestricted
            path
          }
        }
      }
    }
`;

export default GET_ALL_PLUGINS;
