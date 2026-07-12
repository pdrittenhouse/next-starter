import {gql} from "@apollo/client";

export const GET_ALL_MENUS = gql`
    query GetAllMenus {
      menus {
        nodes {
          id
          databaseId
          name
          menuItems {
            edges {
              node {
                id
                label
                parentId
                cssClasses
                description
                locations
                menuItemId
                order
                path
                target
                url
                title
              }
            }
          }
          locations
          menuId
          slug
        }
      }
    }
`;

/**
 * Fetch a single menu by registered nav menu location.
 * Location enum values are theme-defined (e.g. PRIMARY, FOOTER).
 */
export const GET_MENU_BY_LOCATION = gql`
  query GetMenuByLocation($location: MenuLocationEnum!) {
    menus(where: { location: $location }) {
      nodes {
        id
        databaseId
        name
        slug
        locations
        menuItems {
          edges {
            node {
              id
              label
              parentId
              cssClasses
              description
              menuItemId
              order
              path
              target
              url
              title
            }
          }
        }
      }
    }
  }
`;

export default GET_ALL_MENUS;