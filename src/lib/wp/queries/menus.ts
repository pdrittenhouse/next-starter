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
                megaMenuPanelId
                order
                path
                target
                url
                title
                connectedNode {
                  node {
                    __typename
                    ... on Post {
                      id
                      databaseId
                      title
                      slug
                      uri
                      excerpt
                      featuredImage {
                        node {
                          sourceUrl
                          altText
                        }
                      }
                    }
                    ... on Page {
                      id
                      databaseId
                      title
                      slug
                      uri
                    }
                    ... on Category {
                      id
                      databaseId
                      name
                      slug
                      uri
                      description
                      count
                    }
                    ... on Tag {
                      id
                      databaseId
                      name
                      slug
                      uri
                      count
                    }
                  }
                }
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
              megaMenuPanelId
              order
              path
              target
              url
              title
              connectedNode {
                node {
                  __typename
                  ... on Post {
                    id
                    databaseId
                    title
                    slug
                    uri
                    excerpt
                    featuredImage {
                      node {
                        sourceUrl
                        altText
                      }
                    }
                  }
                  ... on Page {
                    id
                    databaseId
                    title
                    slug
                    uri
                  }
                  ... on Category {
                    id
                    databaseId
                    name
                    slug
                    uri
                    description
                    count
                  }
                  ... on Tag {
                    id
                    databaseId
                    name
                    slug
                    uri
                    count
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default GET_ALL_MENUS;