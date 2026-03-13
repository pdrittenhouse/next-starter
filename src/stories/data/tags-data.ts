import {gql} from "@apollo/client";

export const allTagsData = {
    request: {
            query: gql`
                query GetAllTags {
                  tags(first: 100) {
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
                        tagId
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
                tags: {
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
                                tagId: "tag-1",
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