import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store.js';
import { readingTime, extractHeadings, formatRelativeTime, formatCompactNumber } from '../utils/markdown.js';
import SanitizedMarkdown from './SanitizedMarkdown.jsx';
import Comments from './Comments.jsx';
import { PostViewerSkeleton } from './Skeleton.jsx';
import {
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  ClockIcon,
  EyeIcon,
  UserIcon
} from './Icons.jsx';
import UserAvatar from './UserAvatar.jsx';

export default function PostViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const posts = useStore((s) => s.posts);
  const users = useStore((s) => s.users);
  const recordView = useStore((s) => s.recordView);
  const toggleLike = useStore((s) => s.toggleLike);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const likedPostIds = useStore((s) => s.likedPostIds);
  const bookmarkedPostIds = useStore((s) => s.bookmarkedPostIds);
  const currentUser = useStore((s) => s.currentUser);
  const toggleFollow = useStore((s) => s.toggleFollow);
  const isFollowing = useStore((s) => s.isFollowing);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const post = posts.find((p) => p.slug === slug || p.id === slug);
  const authorProfile = users.find((u) => u.username === post?.author);
  const hasRecorded = useRef(false);

  // Track view count
  useEffect(() => {
    if (post && !hasRecorded.current) {
      recordView(post.id);
      hasRecorded.current = true;
    }
  }, [post?.id]);

  // Update document title
  useEffect(() => {
    document.title = post ? `${post.title} — Marginalia` : 'Marginalia';
  }, [post]);

  // Reading progress bar calculation
  useEffect(() => {
    function handleScroll() {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl mb-3 text-ink dark:text-darkInk">Story Not Found</h2>
        <p className="text-inkMuted dark:text-darkInkMuted mb-6">
          This post doesn't exist, was unpublished, or has moved to a new address.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-moss dark:bg-emerald-600 text-white text-sm font-medium hover:bg-mossDark transition-colors"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  const toc = extractHeadings(post.content);
  const isLiked = likedPostIds.includes(post.id);
  const isBookmarked = bookmarkedPostIds.includes(post.id);
  const authorFollowed = isFollowing(post.author);

  // Related posts (same category or overlapping tags, excluding this post)
  const relatedPosts = posts
    .filter(
      (p) =>
        p.id !== post.id &&
        p.status === 'published' &&
        (p.category === post.category || p.tags?.some((t) => post.tags?.includes(t)))
    )
    .slice(0, 3);

  function handleShare(platform) {
    const url = window.location.href;
    const title = post.title;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
        '_blank'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    }
  }

  return (
    <>
      {/* Fixed Reading Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-linear-to-r from-moss via-emerald-500 to-clay dark:from-emerald-400 dark:to-rose-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-12">
        <article className="min-w-0">
          {/* Breadcrumb / Category Tag */}
          <div className="flex items-center gap-2 mb-4 text-xs font-medium">
            <Link to="/" className="text-inkMuted dark:text-darkInkMuted hover:text-moss">
              Feed
            </Link>
            <span className="text-inkMuted dark:text-darkInkMuted">/</span>
            {post.category && (
              <Link
                to={`/?category=${encodeURIComponent(post.category)}`}
                className="text-moss dark:text-mossNeon uppercase tracking-wider font-semibold"
              >
                {post.category}
              </Link>
            )}
          </div>

          {/* Post Title */}
          <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-[1.2] text-ink dark:text-darkInk mb-6">
            {post.title}
          </h1>

          {/* Author Row & Follow Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-line/70 dark:border-darkLine mb-8">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.author}`}>
                <UserAvatar
                  name={authorProfile?.name || post.author}
                  username={post.author}
                  size="lg"
                  className="hover:ring-2 hover:ring-moss dark:hover:ring-mossNeon transition-all"
                />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${post.author}`}
                    className="font-serif text-base font-bold text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon transition-colors"
                  >
                    {authorProfile?.name || post.author}
                  </Link>
                  {currentUser && currentUser.username !== post.author && (
                    <button
                      type="button"
                      onClick={() => toggleFollow(post.author)}
                      className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                        authorFollowed
                          ? 'border-line dark:border-darkLine bg-paper dark:bg-darkCard text-inkMuted dark:text-darkInkMuted'
                          : 'border-moss dark:border-emerald-500 text-moss dark:text-mossNeon hover:bg-moss hover:text-white dark:hover:bg-emerald-600'
                      }`}
                    >
                      {authorFollowed ? 'Following' : '+ Follow'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-inkMuted dark:text-darkInkMuted mt-0.5">
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{readingTime(post.content)} min read</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" />
                    <span>{formatCompactNumber(post.views || 0)} views</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Quick Actions (Likes, Bookmarks, Share) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLike(post.id)}
                aria-pressed={isLiked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  isLiked
                    ? 'border-clay/50 bg-clay/10 text-clay dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-400'
                    : 'border-line dark:border-darkLine hover:border-clay hover:text-clay dark:hover:border-rose-400 dark:hover:text-rose-400'
                }`}
              >
                <HeartIcon className="w-4 h-4" filled={isLiked} />
                <span>{post.likes || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleBookmark(post.id)}
                aria-pressed={isBookmarked}
                className={`p-2 rounded-full border text-xs font-medium transition-all ${
                  isBookmarked
                    ? 'border-moss/50 bg-moss/10 text-moss dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-mossNeon'
                    : 'border-line dark:border-darkLine hover:border-moss hover:text-moss dark:hover:border-mossNeon dark:hover:text-mossNeon'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
              >
                <BookmarkIcon className="w-4 h-4" filled={isBookmarked} />
              </button>

              {/* Share Popover Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="p-2 rounded-full border border-line dark:border-darkLine hover:border-moss dark:hover:border-mossNeon text-ink/70 dark:text-darkInk/70 transition-all"
                  title="Share story"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>

                {shareMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard p-2 shadow-xl z-30 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk transition-colors"
                    >
                      {copied ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <CopyIcon className="w-4 h-4" />
                      )}
                      <span>{copied ? 'Copied link!' : 'Copy link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk transition-colors"
                    >
                      <TwitterIcon className="w-4 h-4" />
                      <span>Share on X</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('whatsapp')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk transition-colors"
                    >
                      <WhatsappIcon className="w-4 h-4" />
                      <span>Share on WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                      <span>Share on LinkedIn</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Article Markdown Body */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-moss dark:prose-a:text-mossNeon prose-img:rounded-2xl prose-pre:rounded-2xl">
            <SanitizedMarkdown content={post.content} />
          </div>

          {/* Tag Pills */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-line/60 dark:border-darkLine">
              <span className="text-xs font-mono text-inkMuted dark:text-darkInkMuted mr-1">
                Topics:
              </span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-mono px-3 py-1 rounded-full bg-paper dark:bg-darkCard border border-line dark:border-darkLine text-inkMuted dark:text-darkInkMuted hover:border-moss dark:hover:border-mossNeon transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Author Bio Box */}
          {authorProfile && (
            <div className="mt-12 p-6 rounded-3xl border border-line dark:border-darkLine bg-white dark:bg-darkCard flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-2xs">
              <UserAvatar
                name={authorProfile.name}
                username={authorProfile.username}
                size="xl"
                className="shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-serif text-lg font-bold text-ink dark:text-darkInk">
                    Written by {authorProfile.name}
                  </h3>
                  <Link
                    to={`/profile/${authorProfile.username}`}
                    className="text-xs font-medium text-moss dark:text-mossNeon hover:underline"
                  >
                    View profile & articles →
                  </Link>
                </div>
                <p className="text-sm text-inkMuted dark:text-darkInkMuted leading-relaxed mb-3">
                  {authorProfile.bio}
                </p>
                <span className="text-xs font-mono text-inkMuted/60 dark:text-darkInkMuted/60">
                  {authorProfile.role} · Based in {authorProfile.location}
                </span>
              </div>
            </div>
          )}

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <section className="mt-16 pt-10 border-t border-line/80 dark:border-darkLine">
              <h3 className="font-serif text-2xl font-bold text-ink dark:text-darkInk mb-6">
                Related Stories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/post/${related.slug || related.id}`}
                    className="group rounded-2xl border border-line/80 dark:border-darkLine bg-white dark:bg-darkCard p-4 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-moss dark:text-mossNeon font-semibold">
                        {related.category || 'General'}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-ink dark:text-darkInk group-hover:text-moss dark:group-hover:text-mossNeon transition-colors line-clamp-2 mt-1 mb-2">
                        {related.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-inkMuted dark:text-darkInkMuted pt-2 border-t border-line/40 dark:border-darkLine">
                      {readingTime(related.content)} min read
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <Comments postId={post.id} />
        </article>

        {/* Sticky Table of Contents (Desktop Sidebar) */}
        {toc.length > 0 && (
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-inkMuted dark:text-darkInkMuted block">
                On this page
              </span>
              <nav className="space-y-1.5 text-xs">
                {toc.map((heading) => (
                  <a
                    key={heading.slug}
                    href={`#${heading.slug}`}
                    className={`block py-1 text-inkMuted dark:text-darkInkMuted hover:text-moss dark:hover:text-mossNeon transition-colors leading-relaxed ${
                      heading.depth === 3 ? 'pl-3 border-l border-line dark:border-darkLine' : 'font-medium'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>

              <div className="pt-6 border-t border-line/60 dark:border-darkLine">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-xs font-medium text-moss dark:text-mossNeon hover:underline flex items-center gap-1"
                >
                  ↑ Back to top
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
