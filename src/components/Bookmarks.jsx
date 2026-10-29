import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store.js';
import PostCard from './PostCard.jsx';
import { EmptyState } from './Skeleton.jsx';
import { BookmarkIcon } from './Icons.jsx';

export default function Bookmarks() {
  const posts = useStore((s) => s.posts);
  const bookmarkedPostIds = useStore((s) => s.bookmarkedPostIds);

  const saved = posts.filter((p) => bookmarkedPostIds.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-line dark:border-darkLine">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookmarkIcon className="w-6 h-6 text-moss dark:text-mossNeon" filled />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink dark:text-darkInk">
              Reading List
            </h1>
          </div>
          <p className="text-sm text-inkMuted dark:text-darkInkMuted">
            Articles and stories you have bookmarked for later reading.
          </p>
        </div>

        <span className="text-xs font-mono text-inkMuted dark:text-darkInkMuted">
          {saved.length} {saved.length === 1 ? 'article' : 'articles'} saved
        </span>
      </div>

      {/* Post List or Empty State */}
      {saved.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="Your reading list is empty"
          description="Whenever you find an interesting article on the feed, tap the bookmark icon to save it here for leisurely reading later."
          actionLabel="Explore stories"
          actionTo="/"
        />
      ) : (
        <div className="space-y-4">
          {saved.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
