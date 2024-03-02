import {gql} from "@apollo/client";

export const usersData = {
    request: {
        query: gql`
                query GetAllUsers {
                    users(first: 10000) {
                      edges {
                        node {
                          avatar {
                            height
                            width
                            url
                          }
                          description
                          id
                          name
                          roles {
                            nodes {
                              name
                            }
                          }
                          slug
                        }
                      }
                    }
                  }
            `,
    },
    result: {
        data: {
            users: {
                edges: [
                    {
                        node: {
                            avatar: {
                                height: 100,
                                width: 100,
                                url: "http://example.com/avatar/user-1.jpg",
                            },
                            description: "User description",
                            id: "user-1",
                            name: "User 1",
                            roles: {
                                nodes: [
                                    {
                                        name: "Editor"
                                    },
                                    {
                                        name: "Author"
                                    }
                                ]
                            },
                            slug: "user-1",
                        },
                    },
                    // Add more users as needed
                ],
            },
        },
    },
};

export default usersData;