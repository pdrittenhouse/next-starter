import Link from 'next/link';
import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_ADJACENT_POSTS } from '@/lib/wp/queries';
import { PageHeader } from './partials/page-header';
import { Comments } from './partials/comments';

interface SingleTemplateProps {
  node: {
    __typename?: string;
    databaseId: number;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    date?: string;
    modified?: string;
    status?: string;
    contentTypeName?: string;
    author?: {
      node: {
        id: string;
        name: string;
        slug: string;
        avatar?: { url: string; height: number; width: number };
      };
    } | null;
    featuredImage?: {
      node: {
        id: string;
        sourceUrl: string;
        altText?: string;
        caption?: string;
        srcSet?: string;
        sizes?: string;
      };
    } | null;
    categories?: {
      edges: { node: { id: string; name: string; slug: string } }[];
    } | null;
    tags?: {
      edges: { node: { id: string; name: string; slug: string } }[];
    } | null;
    terms?: {
      edges: { node: { id: string; name: string; slug: string; taxonomyName: string; uri: string } }[];
    } | null;
    commentStatus?: string;
    editorBlocks?: {
      name: string;
      clientId: string;
      parentClientId: string | null;
      renderedHtml: string;
    }[];
  };
}

/**
 * Single post/CPT template.
 * Mirrors: templates/pages/single.twig
 */
export async function SingleTemplate({ node }: SingleTemplateProps) {
  const postType = node.contentTypeName ?? node.__typename?.toLowerCase() ?? 'post';
  const author = node.author?.node;
  const formattedDate = node.date
    ? new Date(node.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Fetch adjacent posts for prev/next navigation
  let prevPost: { title: string; uri: string; date: string } | null = null;
  let nextPost: { title: string; uri: string; date: string } | null = null;

  if (node.date) {
    try {
      const { data } = await fetchGraphQL<{
        previous: { edges: { node: { title: string; uri: string; date: string } }[] };
        next: { edges: { node: { title: string; uri: string; date: string } }[] };
      }>(print(GET_ADJACENT_POSTS), { date: node.date });

      prevPost = data?.previous?.edges?.[0]?.node ?? null;
      nextPost = data?.next?.edges?.[0]?.node ?? null;
    } catch {
      // Silently fail — prev/next navigation is non-critical
    }
  }

  return (
    <div className="content-wrapper">
      <article className={`post-type-${postType}`} id={`post-${node.databaseId}`}>
        <PageHeader
          title={node.title}
          thumbnail={node.featuredImage?.node}
        />

        {node.content && (
          <section className="article-content">
            <div className="article-content--container">
              <div className="article-content--row">
                <div className="article-content--column">
                  <div
                    className="article-body"
                    dangerouslySetInnerHTML={{ __html: node.content }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Post pager — prev/next navigation */}
        <div className="post-pager">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <Link href="/news" className="back">
                  Back to Listing
                </Link>
              </div>
              {prevPost && (
                <div className="post-pager-item prev-post col">
                  <div className="post-pager-item-content">
                    <span className="label">Previous Post</span>
                    <span className="date">
                      {new Date(prevPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="title">{prevPost.title}</span>
                    <span className="pagination-link prev">
                      <Link href={prevPost.uri}>&laquo; {prevPost.title}</Link>
                    </span>
                  </div>
                </div>
              )}
              {nextPost && (
                <div className="post-pager-item next-post col">
                  <div className="post-pager-item-content">
                    <span className="label">Next Post</span>
                    <span className="date">
                      {new Date(nextPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="title">{nextPost.title}</span>
                    <span className="pagination-link next">
                      <Link href={nextPost.uri}>{nextPost.title} &raquo;</Link>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article footer — author and date */}
        {(author || formattedDate) && (
          <footer className="article-footer">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  {author && (
                    <p className="article-author">
                      <span>By</span>
                      <Link href={`/author/${author.slug}`}>
                        {' '}{author.name}{' '}
                      </Link>
                      {formattedDate && (
                        <>
                          <span>&bull;</span> {formattedDate}
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </footer>
        )}

        {/* Terms (categories, tags, custom taxonomies) */}
        {node.terms?.edges && node.terms.edges.length > 0 && (
          <div className="article-terms">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  {node.terms.edges.map(({ node: term }) => (
                    <Link
                      key={term.id}
                      href={term.uri}
                      className={`term term-${term.taxonomyName}`}
                    >
                      {term.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Comments */}
        <Comments
          postDatabaseId={node.databaseId}
          commentStatus={node.commentStatus}
        />
      </article>
    </div>
  );
}
