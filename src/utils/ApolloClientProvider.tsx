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

/**
 * Authenticated requests are deliberately NOT supported from this client.
 *
 * This is a `"use client"` module, so anything it reads from
 * `process.env.NEXT_PUBLIC_*` is statically inlined into a public JS chunk at
 * build time. The previous implementation read NEXT_PUBLIC_WP_AUTH_USER and
 * NEXT_PUBLIC_WP_AUTH_APP_PASSWORD here and built a Basic auth header, which
 * compiled the WordPress application password into
 * `.next/static/chunks/*.js` — served to every visitor.
 *
 * `context: { useAuth: true }` is now a no-op on this client. It remains
 * meaningful for the server-side `fetchGraphQL` in `@/lib/wp/client`, which
 * reads the non-public WP_AUTH_* vars.
 *
 * The only consumer of client-side auth was the `/data` diagnostic page, whose
 * introspection queries work without credentials once "Enable Public
 * Introspection" is on in WP Admin > GraphQL > Settings. If a browser-side
 * authenticated query is genuinely needed later, proxy it through a route
 * handler so the credential stays on the server.
 */
const authLink = setContext((_request, previousContext) => {
    return { headers: previousContext.headers };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    generalSettings: { merge: true },
                },
            },
        },
    }),
    devtools: { enabled: process.env.NODE_ENV === 'development' },
});

export const Provider = ({ children }: { children: any }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};