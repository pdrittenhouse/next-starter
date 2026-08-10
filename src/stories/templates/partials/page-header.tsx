import Image from 'next/image';

interface PageHeaderProps {
  title?: string;
  thumbnail?: {
    sourceUrl: string;
    altText?: string;
    srcSet?: string;
    sizes?: string;
  } | null;
  /**
   * When true, adds `remove-page-header-containers` class to opt the page-header
   * out of container styling independently of the global body
   * `include-content-containers` class. Mirrors the WP option
   * `remove_page_header_containers` (page-header.twig line 44).
   */
  removeContainer?: boolean;
}

/**
 * Page header with title and optional featured image.
 * Mirrors: templates/partials/content/page-header.twig
 */
export function PageHeader({ title, thumbnail, removeContainer }: PageHeaderProps) {
  if (!title && !thumbnail) return null;

  const headerClass = ['page-header', removeContainer ? 'remove-page-header-containers' : null]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClass}>
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
