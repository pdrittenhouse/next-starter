import {gql} from "@apollo/client";

export const allPagesData = {
    request: {
        query: gql`
            query GetAllPages {
                pages(first: 10000, where: { hasPassword: false }) {
                    edges {
                        node {
                            id
                            slug
                            uri
                            ... on Page {
                                id
                                title
                            }
                            author {
                                node {
                                    avatar {
                                        height
                                        url
                                        width
                                    }
                                    id
                                    name
                                    slug
                                }
                            }
                        }
                    }
                }
            }
        `,
    },
    result: {
        data: {
            pages: {
                edges: [
                    {
                        node: {
                            id: 'page-1',
                            slug: 'page-1',
                            uri: '/page-1',
                            title: 'Page 1',
                            author: {
                                node: {
                                    avatar: {
                                        height: 100,
                                        url: 'http://example.com/avatar/user-1.jpg',
                                        width: 100,
                                    },
                                    id: 'author-1',
                                    name: 'Author 1',
                                    slug: 'author-1',
                                },
                            },
                        },
                    },
                    {
                        node: {
                            id: 'page-2',
                            slug: 'page-2',
                            uri: '/page-2',
                            title: 'Page 2',
                            author: {
                                node: {
                                    avatar: {
                                        height: 100,
                                        url: 'http://example.com/avatar/user-2.jpg',
                                        width: 100,
                                    },
                                    id: 'author-2',
                                    name: 'Author 2',
                                    slug: 'author-2',
                                },
                            },
                        },
                    },
                    // Add more pages as needed
                ],
            },
        },
    },
};

export const allPagesWithContentData = {
    request: {
        query: gql`
      query GetAllPagesWithContent {
        pages(first: 10000, where: { hasPassword: false }) {
          edges {
            node {
              id
              slug
              uri
              ... on Page {
                id
                title
              }
              content
              featuredImage {
                node {
                  altText
                  caption
                  id
                  sizes
                  sourceUrl
                  srcSet
                }
              }
              author {
                node {
                  avatar {
                    height
                    url
                    width
                  }
                  id
                  name
                  slug
                }
              }
            }
          }
        }
      }
    `,
    },
    result: {
        data: {
            pages: {
                edges: [
                    {
                        node: {
                            id: 'page-1',
                            slug: 'page-1',
                            uri: '/page-1',
                            title: 'Page 1',
                            content: '<p>This is the content of Page 1</p>',
                            featuredImage: {
                                node: {
                                    altText: 'Featured Image Alt Text',
                                    caption: 'Featured Image Caption',
                                    id: 'featured-image-1',
                                    sizes: '100px',
                                    sourceUrl: 'http://example.com/featured-image-1.jpg',
                                    srcSet: 'http://example.com/featured-image-1.jpg 100w',
                                },
                            },
                            author: {
                                node: {
                                    avatar: {
                                        height: 100,
                                        url: 'http://example.com/avatar/user-1.jpg',
                                        width: 100,
                                    },
                                    id: 'author-1',
                                    name: 'Author 1',
                                    slug: 'author-1',
                                },
                            },
                        },
                    },
                    {
                        node: {
                            id: 'page-2',
                            slug: 'page-2',
                            uri: '/page-2',
                            title: 'Page 2',
                            content: '<p>This is the content of Page 2</p>',
                            featuredImage: {
                                node: {
                                    altText: 'Featured Image Alt Text',
                                    caption: 'Featured Image Caption',
                                    id: 'featured-image-2',
                                    sizes: '100px',
                                    sourceUrl: 'http://example.com/featured-image-2.jpg',
                                    srcSet: 'http://example.com/featured-image-2.jpg 100w',
                                },
                            },
                            author: {
                                node: {
                                    avatar: {
                                        height: 100,
                                        url: 'http://example.com/avatar/user-2.jpg',
                                        width: 100,
                                    },
                                    id: 'author-2',
                                    name: 'Author 2',
                                    slug: 'author-2',
                                },
                            },
                        },
                    },
                    // Add more pages with content as needed
                ],
            },
        },
    },
};

export const pageByUriData = {
    request: {
        query: gql`
      query GetPageByUri($uri: ID!) {
        page(id: $uri, idType: URI) {
          children {
            edges {
              node {
                id
                slug
                uri
                ... on Page {
                  id
                  title
                }
              }
            }
          }
          content
          featuredImage {
            node {
              altText
              caption
              id
              sizes
              sourceUrl
              srcSet
            }
          }
          id
          menuOrder
          parent {
            node {
              id
              slug
              uri
              ... on Page {
                title
              }
            }
          }
          slug
          title
          uri
        }
      }
    `,
    },
    result: {
        data: {
            page: {
                id: 'page-1',
                slug: 'page-1',
                uri: '/page-1',
                title: 'Page 1',
                content: '<p>This is the content of Page 1</p>',
                featuredImage: {
                    node: {
                        altText: 'Featured Image Alt Text',
                        caption: 'Featured Image Caption',
                        id: 'featured-image-1',
                        sizes: '100px',
                        sourceUrl: 'http://example.com/featured-image-1.jpg',
                        srcSet: 'http://example.com/featured-image-1.jpg 100w',
                    },
                },
                menuOrder: 1,
                parent: {
                    node: {
                        id: 'parent-page-1',
                        slug: 'parent-page-1',
                        uri: '/parent-page-1',
                        title: 'Parent Page 1',
                    },
                },
                author: {
                    node: {
                        avatar: {
                            height: 100,
                            url: 'http://example.com/avatar/user-1.jpg',
                            width: 100,
                        },
                        id: 'author-1',
                        name: 'Author 1',
                        slug: 'author-1',
                    },
                },
            },
        },
    },
};

export default allPagesData;
