'use client';

import { useState } from 'react';

interface CommentFormProps {
  postId: number;
  parentId?: number;
}

/**
 * Comment submission form.
 * Mirrors: templates/partials/content/comment-form.twig
 *
 * Posts to the WP REST API or WPGraphQL mutation.
 * For now, uses the standard WP comment POST endpoint.
 */
export function CommentForm({ postId, parentId }: CommentFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const wpUrl = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.replace('/graphql', '') ?? '';

    try {
      const res = await fetch(`${wpUrl}/wp-json/wp/v2/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postId,
          parent: parentId ?? 0,
          author_name: formData.get('author'),
          author_email: formData.get('email'),
          content: formData.get('comment'),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        const data = await res.json();
        setError(data.message ?? 'Failed to submit comment.');
      }
    } catch {
      setError('Failed to submit comment. Please try again.');
    }
  }

  if (submitted) {
    return (
      <div className="comment-form-success">
        <p>Your comment has been submitted and is awaiting moderation.</p>
      </div>
    );
  }

  return (
    <div className="comment-form-wrapper">
      <h3>Leave a Comment</h3>
      {error && <p className="comment-form-error" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-group">
          <label htmlFor="author">Name *</label>
          <input type="text" id="author" name="author" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Comment *</label>
          <textarea id="comment" name="comment" rows={5} required />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit Comment
        </button>
      </form>
    </div>
  );
}
