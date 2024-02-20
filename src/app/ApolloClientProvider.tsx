"use client";
import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

export const Provider = ({ children }: { children: any }) => {
    const client = new ApolloClient({
        uri: "http://headless-test.local/graphql",
        cache: new InMemoryCache(),
    });
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};