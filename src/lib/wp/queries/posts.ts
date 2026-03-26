import {gql} from "@apollo/client";

export const POST_FIELDS = gql`
  fragment PostFields on Post {
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
  }
`;

export const GET_ALL_POSTS = gql`
  ${POST_FIELDS}
  query GetAllPosts {
    posts(first: 100, where: { hasPassword: false }) {
      edges {
        node {
          ...PostFields
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
          modified
          status
          uri
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
          tags {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
          terms {
            edges {
              node {
                id
                name
                slug
                taxonomyName
                uri
              }
            }
          }
          editorBlocks {
            name
            clientId
            parentClientId
            renderedHtml
          }
          seo {
            title
            description
            canonicalUrl
            ogTitle
            ogDescription
            ogImage
            ogType
            twitterTitle
            twitterDescription
            twitterImage
            twitterCard
            robots
            schema
          }
        }
      }
    }
  }
`;

export const GET_ALL_POSTS_WITH_CONTENT = gql`
  ${POST_FIELDS}
  query GetAllPostsWithContent {
    posts(first: 100, where: { hasPassword: false }) {
      edges {
        node {
          ...PostFields
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
`;

export const GET_POST_BY_SLUG = gql`
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
`;

export const GET_POSTS_BY_CATEGORY_ID = gql`
  ${POST_FIELDS}
  query PostsByCategoryId($categoryId: Int!) {
    posts(where: { categoryId: $categoryId, hasPassword: false }) {
      edges {
        node {
          ...PostFields
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
`;

export const GET_POSTS_BY_AUTHOR_SLUG = gql`
  ${POST_FIELDS}
  query GetPostByAuthorSlug($slug: String!) {
    posts(where: { authorName: $slug, hasPassword: false }) {
      edges {
        node {
          ...PostFields
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
`;

/**
 * Get adjacent (prev/next) posts for post navigation.
 * Fetches one post before and one post after the given date.
 */
export const GET_ADJACENT_POSTS = gql`
  query GetAdjacentPosts($date: String!, $postType: PostObjectsConnectionOrderbyEnum = DATE) {
    previous: posts(
      first: 1
      where: { hasPassword: false, dateQuery: { before: $date }, orderby: { field: $postType, order: DESC } }
    ) {
      edges {
        node {
          id
          title
          slug
          uri
          date
        }
      }
    }
    next: posts(
      first: 1
      where: { hasPassword: false, dateQuery: { after: $date }, orderby: { field: $postType, order: ASC } }
    ) {
      edges {
        node {
          id
          title
          slug
          uri
          date
        }
      }
    }
  }
`;

/**
 * Paginated posts query with cursor-based pagination.
 * Used by archive templates.
 */
export const GET_POSTS_PAGINATED = gql`
  ${POST_FIELDS}
  query GetPostsPaginated($first: Int = 10, $after: String, $categoryId: Int, $tagId: String, $authorName: String, $search: String) {
    posts(
      first: $first
      after: $after
      where: {
        hasPassword: false
        categoryId: $categoryId
        tag: $tagId
        authorName: $authorName
        search: $search
      }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          ...PostFields
          author {
            node {
              id
              name
              slug
              avatar {
                height
                url
                width
              }
            }
          }
          excerpt
          uri
          modified
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
        }
      }
    }
  }
`;

/**
 * Date-filtered posts query for date-based archives.
 * WPGraphQL dateQuery uses { year, month, day } objects.
 */
export const GET_POSTS_BY_DATE = gql`
  ${POST_FIELDS}
  query GetPostsByDate($first: Int = 10, $after: String, $year: Int!, $month: Int, $day: Int) {
    posts(
      first: $first
      after: $after
      where: {
        hasPassword: false
        dateQuery: {
          year: $year
          month: $month
          day: $day
        }
      }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          ...PostFields
          author {
            node {
              id
              name
              slug
            }
          }
          excerpt
          uri
          modified
          featuredImage {
            node {
              altText
              sourceUrl
              srcSet
              sizes
              id
            }
          }
        }
      }
    }
  }
`;

/**
 * Get all post URIs for static generation.
 * Lightweight — only fetches uri and slug.
 */
export const GET_ALL_POST_URIS = gql`
  query GetAllPostUris {
    posts(first: 1000, where: { hasPassword: false }) {
      edges {
        node {
          uri
          slug
        }
      }
    }
  }
`;

/**
 * Preview query — fetch a post/page revision by database ID.
 * Requires authentication (drafts are not public).
 */
export const GET_PREVIEW_POST = gql`
  query GetPreviewPost($id: ID!, $idType: ContentNodeIdTypeEnum = DATABASE_ID) {
    contentNode(id: $id, idType: $idType, asPreview: true) {
      __typename
      databaseId
      slug
      uri
      status
      ... on Post {
        title
        content
        excerpt
        date
        modified
        author {
          node {
            id
            name
            slug
          }
        }
        featuredImage {
          node {
            id
            sourceUrl
            altText
          }
        }
        categories {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
        seo {
          title
          description
        }
      }
      ... on Page {
        title
        content
        date
        modified
        template {
          templateName
        }
        featuredImage {
          node {
            id
            sourceUrl
            altText
          }
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

export default GET_ALL_POSTS;