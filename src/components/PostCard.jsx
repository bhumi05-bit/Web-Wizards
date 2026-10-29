import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store.js';
import { readingTime, formatRelativeTime, formatCompactNumber } from '../utils/markdown.js';
import { HeartIcon, BookmarkIcon, EyeIcon, ClockIcon } from './Icons.jsx';
import UserAvatar from './UserAvatar.jsx';

export default function PostCard({ post }) {
  const toggleLike = useStore((s) => s.toggleLike);
  const likedPostIds = useStore((s) => s.likedPostIds);
  const isLiked = likedPostIds.includes(post.id);

  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const bookmarkedPostIds = useStore((s) => s.bookmarkedPostIds);
  const isBookmarked = bookmarkedPostIds.includes(post.id);

  const users = useStore((s) => s.users);
  const authorProfile = users.find((u) => u.username === post.author);

  const excerpt = post.content
    ? post.content
        .replace(/^#.*$/m, '')
        .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // retain link text
        .replace(/[#>*_`~-]/g, ' ')
        .trim()
        .slice(0, 160)
    : '';

  return (
    <article className="group mb-6 rounded-2xl border border-line/80 dark:border-darkLine bg-white dark:bg-darkCard p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-darkBg/50 overflow-hidden">
      {/* Top author row & metadata */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <Link
          to={`/profile/${post.author}`}
          className="flex items-center gap-2.5 group/author"
        >
          <UserAvatar
            name={authorProfile?.name || post.author}
            username={post.author}
            size="sm"
            className="group-hover/author:ring-2 group-hover/author:ring-moss dark:group-hover/author:ring-mossNeon transition-all"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink dark:text-darkInk group-hover/author:text-moss dark:group-hover/author:text-mossNeon transition-colors">
              {authorProfile?.name || post.author}
            </span>
            <span className="text-[11px] text-inkMuted dark:text-darkInkMuted">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {post.category && (
            <Link
              to={`/?category=${encodeURIComponent(post.category)}`}
              className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-moss/10 text-moss dark:bg-emerald-500/10 dark:text-mossNeon hover:bg-moss/20 transition-colors"
            >
              {post.category}
            </Link>
          )}
          {post.status === 'draft' && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-clay/10 text-clay dark:bg-rose-500/10 dark:text-rose-400 font-medium">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Post Title */}
      <h2 className="font-serif text-xl sm:text-2xl mb-2.5 leading-snug font-bold">
        <Link
          to={`/post/${post.slug || post.id}`}
          className="text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon transition-colors"
        >
          {post.title || 'Untitled Post'}
        </Link>
      </h2>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-inkMuted dark:text-darkInkMuted font-sans text-sm sm:text-[15px] mb-4 line-clamp-2 leading-relaxed">
          {excerpt}…
        </p>
      )}

      {/* Bottom row: Tags & Interactions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60 dark:border-darkLine">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {post.tags &&
            post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className="text-[11px] font-mono text-inkMuted/80 dark:text-darkInkMuted/80 hover:text-moss dark:hover:text-mossNeon hover:underline"
              >
                #{tag}
              </Link>
            ))}
        </div>

        {/* Counters & Actions */}
        <div className="flex items-center gap-3 text-xs text-inkMuted dark:text-darkInkMuted">
          <span className="flex items-center gap-1" title="Reading time">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{readingTime(post.content)}m</span>
          </span>

          <span className="flex items-center gap-1" title="Views">
            <EyeIcon className="w-3.5 h-3.5" />
            <span>{formatCompactNumber(post.views || 0)}</span>
          </span>

          {/* Like Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleLike(post.id);
            }}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
              isLiked
                ? 'border-clay/50 bg-clay/10 text-clay dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-400'
                : 'border-line dark:border-darkLine hover:border-clay hover:text-clay dark:hover:border-rose-400 dark:hover:text-rose-400'
            }`}
          >
            <HeartIcon className="w-3.5 h-3.5" filled={isLiked} />
            <span className="font-mono">{formatCompactNumber(post.likes || 0)}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleBookmark(post.id);
            }}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark for later'}
            className={`p-1.5 rounded-full border transition-all ${
              isBookmarked
                ? 'border-moss/50 bg-moss/10 text-moss dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-mossNeon'
                : 'border-line dark:border-darkLine hover:border-moss hover:text-moss dark:hover:border-mossNeon dark:hover:text-mossNeon'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" filled={isBookmarked} />
          </button>
        </div>
      </div>
    </article>
  );
}
