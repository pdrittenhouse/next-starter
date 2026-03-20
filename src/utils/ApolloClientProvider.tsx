"use client";
import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getWpConfig, buildAuthHeader } from "@/lib/wp/config";

const config = getWpConfig();

const httpLink = new HttpLink({
    uri: config.graphqlUrl || "http://headless-test.local/graphql",
});

const authLink = setContext((_request, previousContext) => {
    if (!previousContext.useAuth) return { headers: previousContext.headers };

    const authHeader = buildAuthHeader(config);
    if (!authHeader) return { headers: previousContext.headers };

    return {
        headers: {
            ...previousContext.headers,
            Authorization: authHeader,
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true,
});

export const Provider = ({ children }: { children: any }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};