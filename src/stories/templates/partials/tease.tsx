import Image from 'next/image';
import Link from 'next/link';

interface TeaseProps {
  title: string;
  uri: string;
  excerpt?: string;
  postType?: string;
  featuredImage?: {
    sourceUrl: string;
    altText?: string;
    srcSet?: string;
    sizes?: string;
  } | null;
  id?: string;
}

/**
 * Post teaser / card component for archive listings.
 * Mirrors: templates/partials/content/tease.twig
 */
export function Tease({ title, uri, excerpt, postType, featuredImage, id }: TeaseProps) {
  return (
    <article className={`tease tease-${postType ?? 'post'}`} id={id}>
      <Link href={uri} className="card-link">
        {featuredImage?.sourceUrl && (
          <div className="card-image">
            <Image
              src={featuredImage.sourceUrl}
              alt={featuredImage.altText ?? ''}
              width={600}
              height={400}
              sizes={featuredImage.sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'}
            />
          </div>
        )}
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          {excerpt && (
            <div
              className="card-text"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          )}
        </div>
      </Link>
    </article>
  );
}
