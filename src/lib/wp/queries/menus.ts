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

export default GET_ALL_MENUS;