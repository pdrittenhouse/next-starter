import React from 'react';
import { useQuery, useApolloClient, gql } from '@apollo/client';
import type { DocumentNode } from 'graphql';

interface DynamicThemeOptionsProps {
  fieldName: string;
  typeName: string;
  label: string;
}

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

const getLeafType = (type: FieldInfo['type']): { name: string | null; kind: string } => {
  if (type.name) return { name: type.name, kind: type.kind };
  if (type.ofType) {
    if (type.ofType.name) return { name: type.ofType.name, kind: type.ofType.kind };
    if (type.ofType.ofType) return { name: type.ofType.ofType.name, kind: type.ofType.ofType.kind };
  }
  return { name: null, kind: type.kind };
};

// Recursively introspect a type and build its field selection string
const introspectAndBuildSelection = async (
  client: any,
  typeName: string,
  depth: number,
  visited: Set<string>
): Promise<string[]> => {
  if (depth > 4 || visited.has(typeName)) return [];
  visited.add(typeName);

  const { data } = await client.query({
    query: gql`
      query IntrospectType_${typeName.replace(/[^a-zA-Z0-9]/g, '_')} {
        __type(name: "${typeName}") {
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
    `,
    context: { useAuth: true },
  });

  if (!data?.__type?.fields) return [];

  const selections: string[] = [];

  for (const field of data.__type.fields as FieldInfo[]) {
    const leaf = getLeafType(field.type);

    if (leaf.kind === 'SCALAR' || leaf.kind === 'ENUM') {
      selections.push(field.name);
    } else if (leaf.kind === 'OBJECT' && leaf.name) {
      const subSelections = await introspectAndBuildSelection(client, leaf.name, depth + 1, visited);
      if (subSelections.length > 0) {
        const indent = '  '.repeat(depth + 1);
        const subStr = subSelections.map(s => `${indent}${s}`).join('\n');
        selections.push(`${field.name} {\n${subStr}\n${'  '.repeat(depth)}}`);
      }
    } else if (leaf.kind === 'LIST') {
      // LIST of objects - try to get the inner type
      const innerType = field.type.ofType;
      if (innerType) {
        const innerLeaf = getLeafType(innerType);
        if (innerLeaf.kind === 'SCALAR' || innerLeaf.kind === 'ENUM') {
          selections.push(field.name);
        } else if (innerLeaf.kind === 'OBJECT' && innerLeaf.name) {
          const subSelections = await introspectAndBuildSelection(client, innerLeaf.name, depth + 1, visited);
          if (subSelections.length > 0) {
            const indent = '  '.repeat(depth + 1);
            const subStr = subSelections.map(s => `${indent}${s}`).join('\n');
            selections.push(`${field.name} {\n${subStr}\n${'  '.repeat(depth)}}`);
          }
        }
      }
    }
  }

  return selections;
};

export const DynamicThemeOptions: React.FC<DynamicThemeOptionsProps> = ({ fieldName, typeName, label }) => {
  const client = useApolloClient();
  const [dataQuery, setDataQuery] = React.useState<DocumentNode | null>(null);
  const [queryError, setQueryError] = React.useState<string | null>(null);

  // Recursively introspect and build the query
  React.useEffect(() => {
    let cancelled = false;

    const buildQuery = async () => {
      try {
        const visited = new Set<string>();
        const selections = await introspectAndBuildSelection(client, typeName, 0, visited);

        if (cancelled) return;

        if (selections.length === 0) {
          setQueryError(`No fields found on ${typeName}`);
          return;
        }

        const query = gql`
          query GetThemeOpts_${fieldName} {
            ${fieldName} {
              ${selections.join('\n              ')}
            }
          }
        `;
        setDataQuery(query);
      } catch (err: any) {
        if (!cancelled) setQueryError(err.message);
      }
    };

    buildQuery();
    return () => { cancelled = true; };
  }, [client, fieldName, typeName]);

  // Execute the data query
  const { loading, error, data } = useQuery(dataQuery || gql`query NoopThemeOptsData { __typename }`, {
    skip: !dataQuery,
  });

  if (queryError) return (
    <p style={{ color: 'red' }}>{label} Error: {queryError}</p>
  );
  if (loading || !dataQuery) return <p>Loading {label.toLowerCase()}...</p>;
  if (error) return (
    <p style={{ color: 'red' }}>{label} Error: {error.message}</p>
  );
  if (!data?.[fieldName]) return null;

  return (
    <details>
      <summary>{label}</summary>
      <pre>{JSON.stringify(data[fieldName], null, 2)}</pre>
    </details>
  );
};

export default DynamicThemeOptions;
