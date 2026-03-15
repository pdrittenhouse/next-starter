import React from 'react';
import { useQuery, useApolloClient, gql } from '@apollo/client';
import type { DocumentNode } from 'graphql';

interface DynamicPostTypeProps {
  pluralName: string;
  singleName: string;
  label: string;
  withContent?: boolean;
}

// WPGraphQL root query fields use lowerCamelCase
const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const ucFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Fields that are part of the ContentNode interface (already handled)
const SKIP_FIELDS = new Set([
  '__typename', 'id', 'databaseId', 'slug', 'date', 'modified', 'status',
  'uri', 'title', 'content', 'excerpt', 'featuredImage', 'author',
  'terms', 'contentType', 'template', 'isPreview', 'previewRevisionDatabaseId',
  'previewRevisionId', 'guid', 'enclosure', 'isRestricted', 'link',
  'desiredSlug', 'editingLockedBy', 'isContentNode', 'isTermNode',
  'enqueuedScripts', 'enqueuedStylesheets', 'contentTypeName',
  'dateGmt', 'modifiedGmt', 'lastEditedBy',
]);

// Introspection query to discover fields and interfaces on a specific type
const buildIntrospectionQuery = (typeName: string) => gql`
  query Introspect_${typeName} {
    __type(name: "${typeName}") {
      interfaces {
        name
      }
      fields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  }
`;

interface FieldInfo {
  name: string;
  type: {
    name: string | null;
    kind: string;
    ofType?: {
      name: string | null;
      kind: string;
      ofType?: {
        name: string | null;
        kind: string;
      } | null;
    } | null;
  };
}

// Get the leaf type name from a potentially wrapped type (NON_NULL, LIST)
const getLeafType = (type: FieldInfo['type']): { name: string | null; kind: string } => {
  if (type.name) return { name: type.name, kind: type.kind };
  if (type.ofType) {
    if (type.ofType.name) return { name: type.ofType.name, kind: type.ofType.kind };
    if (type.ofType.ofType) return { name: type.ofType.ofType.name, kind: type.ofType.ofType.kind };
  }
  return { name: null, kind: type.kind };
};

// Build a field selection string for a scalar or simple object field
const buildFieldSelection = (field: FieldInfo): string | null => {
  if (SKIP_FIELDS.has(field.name)) return null;
  const leaf = getLeafType(field.type);
  if (leaf.kind === 'SCALAR' || leaf.kind === 'ENUM') {
    return field.name;
  }
  // Skip connections and complex objects we can't auto-resolve
  return null;
};

const buildListingQuery = (pluralName: string): DocumentNode => {
  const fieldName = lcFirst(pluralName);

  return gql`
    query GetDynamic_${fieldName} {
      ${fieldName}(first: 100) {
        edges {
          node {
            id
            databaseId
            slug
            date
            modified
            status
            uri
            ... on NodeWithTitle {
              title
            }
          }
        }
      }
    }
  `;
};

const buildContentQuery = (pluralName: string, customFields: string[], interfaces: Set<string>): DocumentNode => {
  const fieldName = lcFirst(pluralName);
  const customFieldsStr = customFields.length > 0
    ? '\n          ' + customFields.join('\n          ')
    : '';

  const titleFragment = interfaces.has('NodeWithTitle') ? `
            ... on NodeWithTitle {
              title
            }` : '';
  const contentFragment = interfaces.has('NodeWithContentEditor') ? `
            ... on NodeWithContentEditor {
              content
            }` : '';
  const excerptFragment = interfaces.has('NodeWithExcerpt') ? `
            ... on NodeWithExcerpt {
              excerpt
            }` : '';
  const authorFragment = interfaces.has('NodeWithAuthor') ? `
            ... on NodeWithAuthor {
              author {
                node {
                  id
                  name
                  slug
                }
              }
            }` : '';
  const featuredImageFragment = interfaces.has('NodeWithFeaturedImage') ? `
            ... on NodeWithFeaturedImage {
              featuredImage {
                node {
                  id
                  sourceUrl
                  altText
                  caption
                  srcSet
                  sizes
                }
              }
            }` : '';

  return gql`
    query GetDynamicWithContent_${fieldName} {
      ${fieldName}(first: 100) {
        edges {
          node {
            id
            databaseId
            slug
            date
            modified
            status
            uri${titleFragment}${contentFragment}${excerptFragment}${authorFragment}${featuredImageFragment}
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
            }${customFieldsStr}
          }
        }
      }
    }
  `;
};

export const DynamicPostType: React.FC<DynamicPostTypeProps> = ({ pluralName, singleName, label, withContent = false }) => {
  const fieldName = lcFirst(pluralName);
  const typeName = ucFirst(singleName);
  const [dataQuery, setDataQuery] = React.useState<DocumentNode | null>(null);

  // Introspect the type to discover custom fields (only needed for withContent)
  const introspectionQuery = React.useMemo(() => buildIntrospectionQuery(typeName), [typeName]);
  const { data: introData } = useQuery(introspectionQuery, {
    context: { useAuth: true },
    skip: !withContent,
  });

  // Extract implemented interfaces from introspection
  const implementedInterfaces = React.useMemo(() => {
    const names = introData?.__type?.interfaces?.map((i: { name: string }) => i.name) ?? [];
    return new Set<string>(names);
  }, [introData]);

  // Build the appropriate query
  React.useEffect(() => {
    if (!withContent) {
      setDataQuery(buildListingQuery(pluralName));
      return;
    }

    if (!introData?.__type?.fields) {
      // Fallback if introspection fails - use content query with no custom fields
      setDataQuery(buildContentQuery(pluralName, [], implementedInterfaces));
      return;
    }

    const fields: FieldInfo[] = introData.__type.fields;
    const customFields = fields
      .map(buildFieldSelection)
      .filter((f): f is string => f !== null);

    setDataQuery(buildContentQuery(pluralName, customFields, implementedInterfaces));
  }, [introData, pluralName, withContent, implementedInterfaces]);

  // Execute the data query
  const fallbackQuery = withContent ? buildContentQuery(pluralName, [], implementedInterfaces) : buildListingQuery(pluralName);
  const { loading, error, data } = useQuery(dataQuery || fallbackQuery, {
    skip: !dataQuery,
  });

  const suffix = withContent ? ' (with content)' : '';
  if (loading || !dataQuery) return <p>Loading {label.toLowerCase()}{suffix}...</p>;
  if (error) return (
    <p style={{ color: 'red' }}>{label}{suffix} Error: {error.message}</p>
  );

  const items = data?.[fieldName]?.edges;
  if (!items) return null;

  return (
    <details>
      <summary>{label}{suffix} ({items.length})</summary>
      <pre>{JSON.stringify(data[fieldName], null, 2)}</pre>
    </details>
  );
};

export default DynamicPostType;
