import {gql} from "@apollo/client";

export const allPostsData = {
    request: {
        query: gql`
            query GetAllPosts {
                posts(first: 10000, where: { hasPassword: false }) {
                    edges {
                        node {
                            id
                            categories {
                                edges {
                                    node {
                                        databaseId
                                        id
                                        name
                                        slug
                                    }
                                }
                            }
                            databaseId
                            date
                            isSticky
                            postId
                            slug
                            title
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
                            excerpt
                        }
                    }
                }
            }
        `,
    },
    result: {
        data: {
            posts: {
                edges: [
                    {
                        node: {
                            id: 'post-1',
                            categories: {
                                edges: [
                                    {
                                        node: {
                                            databaseId: '1',
                                            id: 'category-1',
                                            name: 'Category 1',
                                            slug: 'category-1',
                                        },
                                    },
                                ],
                            },
                            databaseId: '1',
                            date: '2024-02-28T12:00:00Z',
                            isSticky: false,
                            postId: 1,
                            slug: 'post-1',
                            title: 'Post 1',
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
                            excerpt: 'Excerpt of Post 1',
                        },
                    },
                    {
                        node: {
                            id: 'post-2',
                            categories: {
                                edges: [
                                    {
                                        node: {
                                            databaseId: '2',
                                            id: 'category-2',
                                            name: 'Category 2',
                                            slug: 'category-2',
                                        },
                                    },
                                ],
                            },
                            databaseId: '2',
                            date: '2024-02-27T12:00:00Z',
                            isSticky: true,
                            postId: 2,
                            slug: 'post-2',
                            title: 'Post 2',
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
                            excerpt: 'Excerpt of Post 2',
                        },
                    },
                    // Add more posts as needed
                ],
            },
        },
    },
};

export const allPostsWithContentData = {
    request: {
        query: gql`
            query GetAllPostsWithContent {
                posts(first: 10000, where: { hasPassword: false }) {
                    edges {
                        node {
                            id
                            categories {
                                edges {
                                    node {
                                        databaseId
                                        id
                                        name
                                        slug
                                    }
                                }
                            }
                            databaseId
                            date
                            isSticky
                            postId
                            slug
                            title
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
                            content
                            excerpt
                            featuredImage {
                                node {
                                    altText
                                    caption
                                    sourceUrl
                                    srcSet
                                    sizes
                                    id
                                }
                            }
                            modified
                        }
                    }
                }
            }
        `,
    },
    result: {
        data: {
            posts: {
                edges: [
                    {
                        node: {
                            id: 'post-1',
                            categories: {
                                edges: [
                                    {
                                        node: {
                                            databaseId: '1',
                                            id: 'category-1',
                                            name: 'Category 1',
                                            slug: 'category-1',
                                        },
                                    },
                                ],
                            },
                            databaseId: '1',
                            date: '2024-02-28T12:00:00Z',
                            isSticky: false,
                            postId: 1,
                            slug: 'post-1',
                            title: 'Post 1',
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
                            content: '<p>This is the content of Post 1</p>',
                            excerpt: 'Excerpt of Post 1',
                            featuredImage: {
                                node: {
                                    altText: 'Featured Image Alt Text',
                                    caption: 'Featured Image Caption',
                                    sourceUrl: 'http://example.com/featured-image-1.jpg',
                                    srcSet: 'http://example.com/featured-image-1.jpg 100w',
                                    sizes: '100px',
                                    id: 'featured-image-1',
                                },
                            },
                            modified: '2024-02-28T12:00:00Z',
                        },
                    },
                    {
                        node: {
                            id: 'post-2',
                            categories: {
                                edges: [
                                    {
                                        node: {
                                            databaseId: '2',
                                            id: 'category-2',
                                            name: 'Category 2',
                                            slug: 'category-2',
                                        },
                                    },
                                ],
                            },
                            databaseId: '2',
                            date: '2024-02-27T12:00:00Z',
                            isSticky: true,
                            postId: 2,
                            slug: 'post-2',
                            title: 'Post 2',
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
                            content: '<p>This is the content of Post 2</p>',
                            excerpt: 'Excerpt of Post 2',
                            featuredImage: {
                                node: {
                                    altText: 'Featured Image Alt Text',
                                    caption: 'Featured Image Caption',
                                    sourceUrl: 'http://example.com/featured-image-2.jpg',
                                    srcSet: 'http://example.com/featured-image-2.jpg 100w',
                                    sizes: '100px',
                                    id: 'featured-image-2',
                                },
                            },
                            modified: '2024-02-27T12:00:00Z',
                        },
                    },
                    // Add more posts with content as needed
                ],
            },
        },
    },
};

export const postBySlugData = {
    request: {
        query: gql`
            query GetPostBySlug($slug: ID!) {
                post(id: $slug, idType: SLUG) {
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
                    id
                    categories {
                        edges {
                            node {
                                databaseId
                                id
                                name
                                slug
                            }
                        }
                    }
                    content
                    date
                    excerpt
                    featuredImage {
                        node {
                            altText
                            caption
                            sourceUrl
                            srcSet
                            sizes
                            id
                        }
                    }
                    modified
                    databaseId
                    title
                    slug
                    isSticky
                }
            }
        `,
    },
    result: {
        data: {
            post: {
                id: 'post-1',
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
                categories: {
                    edges: [
                        {
                            node: {
                                databaseId: '1',
                                id: 'category-1',
                                name: 'Category 1',
                                slug: 'category-1',
                            },
                        },
                    ],
                },
                content: '<p>This is the content of Post 1</p>',
                date: '2024-02-28T12:00:00Z',
                excerpt: 'Excerpt of Post 1',
                featuredImage: {
                    node: {
                        altText: 'Featured Image Alt Text',
                        caption: 'Featured Image Caption',
                        sourceUrl: 'http://example.com/featured-image-1.jpg',
                        srcSet: 'http://example.com/featured-image-1.jpg 100w',
                        sizes: '100px',
                        id: 'featured-image-1',
                    },
                },
                modified: '2024-02-28T12:00:00Z',
                databaseId: '1',
                title: 'Post 1',
                slug: 'post-1',
                isSticky: false,
            },
        },
    },
};

export const postsByCategoryIdData = {
    request: {
        query: gql`
            query PostsByCategoryId($categoryId: Int!) {
                posts(where: { categoryId: $categoryId, hasPassword: false }) {
                    edges {
                        node {
                            id
                            categories {
                                edges {
                                    node {
                                        databaseId
                                        id
                                        name
                                        slug
                                    }
                                }
                            }
                            databaseId
                            date
                            isSticky
                            postId
                            slug
                            title
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
                            content
                            excerpt
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
                            modified
                        }
                    }
                }
            }
        `,
    },
    result: {
        data: {
            posts: {
                edges: [
                    {
                        node: {
                            id: 'post-1',
                            categories: {
                                edges: [
                                    {
                                        node: {
                                            databaseId: '1',
                                            id: 'category-1',
                                            name: 'Category 1',
                                            slug: 'category-1',
                                        },
                                    },
                                ],
                            },
                            databaseId: '1',
                            date: '2024-02-28T12:00:00Z',
                            isSticky: false,
                            postId: 1,
                            slug: 'post-1',
                            title: 'Post 1',
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
                            content: '<p>This is the content of Post 1</p>',
                            excerpt: 'Excerpt of Post 1',
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
                            modified: '2024-02-28T12:00:00Z',
                        },
                    },
                    // Add more posts by category as needed
                ],
            },
        },
    },
};

export const postsByAuthorSlugData = {
    request: {
        query: gql`
            query GetPostByAuthorSlug($slug: String!) {
                posts(where: { authorName: $slug, hasPassword: false }) {
                    edges {
                        node {
                            id
                            categories {
                                edges {
                                    node {
                                        databaseId
                                        id
                                        name
                                        slug
                                    }
                                }
                            }
                            databaseId
                            date
                            isSticky
                            postId
                            slug
                            title
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
                            excerpt
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
                            modified
                        }
                    }
                }
            }
        `,
    },
    result: {
        data: {
            posts: {
                edges: [
                    {
                        node: {
                            id: 'post-1',
                            categories: {
                                edges: [
                                    {
                                        node: {
                                            databaseId: '1',
                                            id: 'category-1',
                                            name: 'Category 1',
                                            slug: 'category-1',
                                        },
                                    },
                                ],
                            },
                            databaseId: '1',
                            date: '2024-02-28T12:00:00Z',
                            isSticky: false,
                            postId: 1,
                            slug: 'post-1',
                            title: 'Post 1',
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
                            excerpt: 'Excerpt of Post 1',
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
                            modified: '2024-02-28T12:00:00Z',
                        },
                    },
                    // Add more posts by author as needed
                ],
            },
        },
    },
};

export default allPostsData;