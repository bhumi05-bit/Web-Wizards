import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { useStore } from '../store/store.js';
import { formatRelativeTime } from '../utils/markdown.js';
import { HeartIcon, MessageSquareIcon, TrashIcon } from './Icons.jsx';
import UserAvatar from './UserAvatar.jsx';

function sanitizePlainText(text) {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

function CommentForm({ onSubmit, placeholder = 'Share your thoughts…', small = false, autoFocus = false }) {
  const [text, setText] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text.trim());
        setText('');
      }}
      className="flex flex-col sm:flex-row gap-2.5"
    >
      <input
        type="text"
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk outline-none focus:border-moss dark:focus:border-mossNeon transition-colors px-4 ${
          small ? 'py-1.5 text-xs' : 'py-2.5 text-sm'
        }`}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className={`rounded-2xl bg-moss dark:bg-emerald-600 hover:bg-mossDark text-white font-medium transition-all shadow-xs disabled:opacity-40 shrink-0 ${
          small ? 'px-4 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'
        }`}
      >
        Post
      </button>
    </form>
  );
}

function CommentThread({ postId, comment, children }) {
  const likeComment = useStore((s) => s.likeComment);
  const addComment = useStore((s) => s.addComment);
  const deleteComment = useStore((s) => s.deleteComment);
  const currentUser = useStore((s) => s.currentUser);
  const [replying, setReplying] = useState(false);

  const canDelete =
    currentUser && (currentUser.username === comment.authorUsername || currentUser.name === comment.author);

  return (
    <div className="group relative">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <UserAvatar
          name={comment.author}
          username={comment.authorUsername}
          size="sm"
          className="shrink-0 mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-line/70 dark:border-darkLine bg-white dark:bg-darkCard p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-ink dark:text-darkInk">
                  {comment.author}
                </span>
                {comment.authorUsername && (
                  <span className="text-xs font-mono text-moss dark:text-mossNeon">
                    @{comment.authorUsername}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-inkMuted dark:text-darkInkMuted">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            <p className="text-sm text-ink/90 dark:text-darkInk/90 leading-relaxed break-words">
              {sanitizePlainText(comment.text)}
            </p>
          </div>

          {/* Comment Actions (Like, Reply, Delete) */}
          <div className="flex items-center gap-4 mt-1.5 ml-2 text-xs text-inkMuted dark:text-darkInkMuted font-medium">
            <button
              type="button"
              onClick={() => likeComment(postId, comment.id)}
              className="flex items-center gap-1 hover:text-clay dark:hover:text-rose-400 transition-colors"
            >
              <HeartIcon className="w-3.5 h-3.5" filled={(comment.likes || 0) > 0} />
              <span>{comment.likes || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 hover:text-moss dark:hover:text-mossNeon transition-colors"
            >
              <MessageSquareIcon className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>

            {canDelete && (
              <button
                type="button"
                onClick={() => deleteComment(postId, comment.id)}
                className="hover:text-clay dark:hover:text-rose-400 transition-colors"
                title="Delete comment"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replying && (
            <div className="mt-3 mb-3 ml-2 max-w-lg">
              <CommentForm
                small
                autoFocus
                placeholder={`Reply to ${comment.author}…`}
                onSubmit={(text) => {
                  addComment(postId, text, comment.id);
                  setReplying(false);
                }}
              />
            </div>
          )}

          {/* Child Replies Thread */}
          {children && (
            <div className="pl-4 sm:pl-6 border-l-2 border-line/60 dark:border-darkLine mt-3 space-y-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comments({ postId }) {
  const comments = useStore((s) => s.comments[postId] || []);
  const addComment = useStore((s) => s.addComment);
  const currentUser = useStore((s) => s.currentUser);

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesOf = (id) => comments.filter((c) => c.parentId === id);

  function renderThread(comment) {
    const replies = repliesOf(comment.id);
    return (
      <CommentThread key={comment.id} postId={postId} comment={comment}>
        {replies.map(renderThread)}
      </CommentThread>
    );
  }

  return (
    <section className="mt-16 pt-10 border-t border-line/80 dark:border-darkLine">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl font-bold text-ink dark:text-darkInk">
          Discussion ({comments.length})
        </h3>
        {!currentUser && (
          <span className="text-xs text-inkMuted dark:text-darkInkMuted">
            Commenting as Guest
          </span>
        )}
      </div>

      {/* Main Comment Box */}
      <div className="mb-10 p-4 rounded-3xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
        <CommentForm
          placeholder="Share your thoughts, ask questions, or contribute feedback…"
          onSubmit={(text) => addComment(postId, text)}
        />
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-sm text-inkMuted dark:text-darkInkMuted italic py-6 text-center">
          No comments yet. Start the conversation by sharing your thoughts above!
        </p>
      ) : (
        <div className="space-y-6">{topLevel.map(renderThread)}</div>
      )}
    </section>
  );
}
