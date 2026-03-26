import { print } from 'graphql';
import { fetchGraphQL } from '@/lib/wp/client';
import { GET_COMMENTS_BY_POST } from '@/lib/wp/queries';
import { CommentForm } from './comment-form';

interface Comment {
  id: string;
  databaseId: number;
  content: string;
  date: string;
  parentDatabaseId: number;
  author: {
    node: {
      id?: string;
      name: string;
      url?: string;
    };
  };
}

interface CommentsProps {
  postDatabaseId: number;
  commentStatus?: string;
}

/**
 * Comments section with threaded comments and reply form.
 * Mirrors: single.twig comment-box section
 */
export async function Comments({ postDatabaseId, commentStatus }: CommentsProps) {
  if (commentStatus === 'closed') return null;

  let comments: Comment[] = [];
  try {
    const { data } = await fetchGraphQL<{
      comments: { edges: { node: Comment }[] };
    }>(print(GET_COMMENTS_BY_POST), { contentId: postDatabaseId });
    comments = data?.comments?.edges?.map((e) => e.node) ?? [];
  } catch {
    // Silently fail
  }

  // Build threaded structure
  const topLevel = comments.filter((c) => !c.parentDatabaseId);
  const children = comments.filter((c) => c.parentDatabaseId);

  function getChildren(parentId: number): Comment[] {
    return children.filter((c) => c.parentDatabaseId === parentId);
  }

  function renderComment(comment: Comment, depth = 0) {
    const replies = getChildren(comment.databaseId);
    const formattedDate = new Date(comment.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        key={comment.id}
        className={`comment comment-depth-${depth}`}
        id={`comment-${comment.databaseId}`}
      >
        <div className="comment-content">
          <p className="comment-author">
            {comment.author?.node?.url ? (
              <a href={comment.author.node.url} rel="nofollow">
                {comment.author.node.name}
              </a>
            ) : (
              comment.author?.node?.name ?? 'Anonymous'
            )}
          </p>
          <p className="comment-date">{formattedDate}</p>
          <div dangerouslySetInnerHTML={{ __html: comment.content }} />
        </div>
        {replies.length > 0 && (
          <div className="comment-replies">
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="comment-box">
      <div className="container">
        <div className="row">
          <div className="col">
            {/* Comment list */}
            {topLevel.length > 0 && (
              <div className="comments">
                <h3>Comments</h3>
                {topLevel.map((comment) => renderComment(comment))}
              </div>
            )}

            {/* Comment form */}
            <CommentForm postId={postDatabaseId} />
          </div>
        </div>
      </div>
    </section>
  );
}
