"use client";
import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Note: Must use literal process.env.NEXT_PUBLIC_* access here.
// Webpack/Storybook statically replaces these at build time —
// dynamic access like process.env[key] does NOT work in client components.
const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || "http://headless-test.local/graphql",
});

const authLink = setContext((_request, previousContext) => {
    if (!previousContext.useAuth) return { headers: previousContext.headers };

    const user = process.env.NEXT_PUBLIC_WP_AUTH_USER;
    const pass = process.env.NEXT_PUBLIC_WP_AUTH_APP_PASSWORD;
    if (!user || !pass) return { headers: previousContext.headers };

    const token = btoa(`${user}:${pass}`);
    return {
        headers: {
            ...previousContext.headers,
            Authorization: `Basic ${token}`,
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