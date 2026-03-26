import Image from 'next/image';

interface PageHeaderProps {
  title?: string;
  thumbnail?: {
    sourceUrl: string;
    altText?: string;
    srcSet?: string;
    sizes?: string;
  } | null;
}

/**
 * Page header with title and optional featured image.
 * Mirrors: templates/partials/content/page-header.twig
 */
export function PageHeader({ title, thumbnail }: PageHeaderProps) {
  if (!title && !thumbnail) return null;

  return (
    <header className="page-header">
      <div className="page-header--container">
        <div className="page-header--row">
          <div className="page-header--content">
            {thumbnail?.sourceUrl && (
              <Image
                src={thumbnail.sourceUrl}
                alt={thumbnail.altText ?? ''}
                width={1600}
                height={900}
                sizes={thumbnail.sizes ?? '(max-width: 768px) 100vw, 1600px'}
                className="article-image"
                priority
              />
            )}
            {title && (
              <h2 className="article-title">{title}</h2>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
