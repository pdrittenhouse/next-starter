import {gql} from "@apollo/client";

export const allTagsData = {
    request: {
            query: gql`
                query GetAllTags {
                  categories(first: 10000) {
                    edges {
                      node {
                        databaseId
                        description
                        id
                        name
                        slug
                        isRestricted
                        isContentNode
                        isTermNode
                        link
                        count
                        categoryId
                        parentDatabaseId
                        parentId
                        taxonomyName
                        termGroupId
                        termTaxonomyId
                        uri
                      }
                    }
                  }
                }
            `,
        },
    result: {
            data: {
                categories: {
                    edges: [
                        {
                            node: {
                                databaseId: "1",
                                description: "Tag description",
                                id: "tag-1",
                                name: "Tag 1",
                                slug: "tag-1",
                                isRestricted: false,
                                isContentNode: true,
                                isTermNode: true,
                                link: "http://example.com/tag-1",
                                count: 10,
                                categoryId: "tag-1",
                                parentDatabaseId: null,
                                parentId: null,
                                taxonomyName: "post_tag",
                                termGroupId: null,
                                termTaxonomyId: null,
                                uri: "/tag/tag-1"
                            },
                        },
                    ],
                },
            },
        }
};

export const tagBySlugData = {
    request: {
        query: gql`
            query GetTagBySlug($slug: ID!) {
              tag(id: $slug, idType: SLUG) {
                databaseId
                description
                id
                name
                slug
              }
            }
        `,
        variables: {
            slug: "tag-1",
        },
    },
    result: {
        data: {
            tag: {
                databaseId: "1",
                description: "Tag description",
                id: "tag-1",
                name: "Tag 1",
                slug: "tag-1",
            },
        },
    },
};

export default allTagsData;