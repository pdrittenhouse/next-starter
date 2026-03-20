import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { lcFirst } from '@/lib/wp/utils';

interface DynamicTaxonomyProps {
  pluralName: string;
  label: string;
}

const buildQuery = (pluralName: string) => {
  const fieldName = lcFirst(pluralName);
  return gql`
  query GetDynamic_${fieldName} {
    ${fieldName}(first: 100) {
      edges {
        node {
          id
          name
          slug
          description
          uri
          count
        }
      }
    }
  }
`;
};

export const DynamicTaxonomy: React.FC<DynamicTaxonomyProps> = ({ pluralName, label }) => {
  const fieldName = lcFirst(pluralName);
  const query = React.useMemo(() => buildQuery(pluralName), [pluralName]);
  const { loading, error, data } = useQuery(query);

  if (loading) return <p>Loading {label.toLowerCase()}...</p>;
  if (error) return (
    <p style={{ color: 'red' }}>{label} Error: {error.message}</p>
  );

  const items = data?.[fieldName]?.edges;
  if (!items) return null;

  return (
    <details>
      <summary>{label} ({items.length})</summary>
      <pre>{JSON.stringify(data[fieldName], null, 2)}</pre>
    </details>
  );
};

export default DynamicTaxonomy;
