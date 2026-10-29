import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store.js';
import { readingTime, formatRelativeTime, formatCompactNumber } from '../utils/markdown.js';
import {
  PlusIcon,
  SearchIcon,
  EyeIcon,
  HeartIcon,
  EditIcon,
  TrashIcon,
  TrendingIcon,
  ClockIcon,
  XIcon
} from './Icons.jsx';
import { EmptyState } from './Skeleton.jsx';

export default function Dashboard() {
  const currentUser = useStore((s) => s.currentUser);
  const posts = useStore((s) => s.posts);
  const createDraft = useStore((s) => s.createDraft);
  const deletePost = useStore((s) => s.deletePost);
  const publishPost = useStore((s) => s.publishPost);
  const unpublishPost = useStore((s) => s.unpublishPost);
  const getFollowersCount = useStore((s) => s.getFollowersCount);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl mb-3 text-ink dark:text-darkInk">Author Dashboard</h2>
        <p className="text-sm text-inkMuted dark:text-darkInkMuted mb-6">
          Sign in to view your post analytics, manage drafts, and publish stories.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-full bg-moss dark:bg-emerald-600 text-white text-sm font-medium hover:bg-mossDark"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Filter posts written by current user
  const myPosts = useMemo(() => {
    return posts.filter((p) => p.author === currentUser.username);
  }, [posts, currentUser.username]);

  // Aggregate stats
  const totalViews = myPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const publishedCount = myPosts.filter((p) => p.status === 'published').length;
  const draftCount = myPosts.filter((p) => p.status === 'draft').length;
  const followersCount = getFollowersCount(currentUser.username);

  // Top 5 posts by views for Analytics Chart
  const topPosts = useMemo(() => {
    return [...myPosts]
      .filter((p) => p.status === 'published')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [myPosts]);

  const maxViews = Math.max(1, ...topPosts.map((p) => p.views || 0));

  // Filtered & Sorted list for table
  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myPosts
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
        if (q) {
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchTag;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [myPosts, query, statusFilter, categoryFilter, sortBy]);

  function handleCreatePost() {
    const id = createDraft();
    if (id) navigate(`/editor/${id}`);
  }

  function handleConfirmDelete(id) {
    deletePost(id);
    setDeleteConfirmId(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink dark:text-darkInk">
            Author Studio
          </h1>
          <p className="text-sm text-inkMuted dark:text-darkInkMuted mt-1">
            Manage your articles, review reader analytics, and craft new stories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreatePost}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-moss dark:bg-emerald-600 hover:bg-mossDark text-white text-sm font-medium transition-all shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Summary KPI Cards (Total, Published, Drafts, Views, Likes, Followers) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted block mb-1">
            Total Articles
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-darkInk">
            {myPosts.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted block mb-1">
            Published
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-moss dark:text-mossNeon">
            {publishedCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted block mb-1">
            Drafts
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-500">
            {draftCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted block mb-1">
            Total Views
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-indigo-500">
            {formatCompactNumber(totalViews)}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted block mb-1">
            Total Likes
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-clay dark:text-rose-400">
            {formatCompactNumber(totalLikes)}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted block mb-1">
            Followers
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">
            {followersCount}
          </span>
        </div>
      </div>

      {/* Visual Analytics Chart: Most Viewed Stories */}
      <section className="mb-10 p-6 rounded-3xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif text-xl font-bold text-ink dark:text-darkInk">
              Performance Analytics
            </h2>
          </div>
          <span className="text-xs font-mono text-inkMuted dark:text-darkInkMuted">
            Top 5 Published Stories
          </span>
        </div>

        {topPosts.length === 0 ? (
          <p className="text-sm text-inkMuted dark:text-darkInkMuted italic py-4 text-center">
            Publish articles to start tracking readership analytics and view charts.
          </p>
        ) : (
          <div className="space-y-4">
            {topPosts.map((post) => {
              const widthPct = Math.max(8, Math.round(((post.views || 0) / maxViews) * 100));
              return (
                <div key={post.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink dark:text-darkInk truncate max-w-md">
                      {post.title || 'Untitled Post'}
                    </span>
                    <div className="flex items-center gap-4 text-inkMuted dark:text-darkInkMuted shrink-0 font-mono">
                      <span>{post.views || 0} views</span>
                      <span>♥ {post.likes || 0}</span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-paper dark:bg-darkBg overflow-hidden border border-line/40 dark:border-darkLine">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-moss to-emerald-400 dark:from-emerald-600 dark:to-teal-400 transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Search, Filter & Sort Controls for Stories */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-inkMuted dark:text-darkInkMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your stories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm placeholder:text-inkMuted/60 dark:placeholder:text-darkInkMuted/60 outline-none focus:border-moss"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm outline-none focus:border-moss"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm outline-none focus:border-moss"
          >
            <option value="updated">Recently Updated</option>
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Post Rows or Empty State */}
      {visiblePosts.length === 0 ? (
        <EmptyState
          icon="✍️"
          title={myPosts.length === 0 ? 'No stories written yet' : 'No matching stories found'}
          description={
            myPosts.length === 0
              ? 'Draft your first technical article or design thoughts with our live Markdown editor.'
              : 'Try clearing your search query or switching your status filter.'
          }
          actionLabel={myPosts.length === 0 ? 'Write your first post' : 'Reset filters'}
          onAction={myPosts.length === 0 ? handleCreatePost : () => { setQuery(''); setStatusFilter('all'); }}
        />
      ) : (
        <div className="rounded-3xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs divide-y divide-line/60 dark:divide-darkLine overflow-hidden">
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/50 dark:hover:bg-darkLine/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-medium ${
                      post.status === 'published'
                        ? 'bg-moss/10 text-moss dark:bg-emerald-500/10 dark:text-mossNeon'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  {post.category && (
                    <span className="text-[11px] font-mono text-inkMuted dark:text-darkInkMuted uppercase">
                      {post.category}
                    </span>
                  )}
                  <span className="text-xs text-inkMuted dark:text-darkInkMuted">
                    Updated {formatRelativeTime(post.updatedAt)}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-ink dark:text-darkInk truncate">
                  {post.title || 'Untitled Draft'}
                </h3>

                <div className="flex items-center gap-4 text-xs text-inkMuted dark:text-darkInkMuted mt-1">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-3.5 h-3.5" />
                    <span>{post.views || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-3.5 h-3.5" />
                    <span>{post.likes || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>{readingTime(post.content)}m read</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit, Unpublish / Publish, Delete, View */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/editor/${post.id}`}
                  className="px-3 py-1.5 rounded-xl border border-line dark:border-darkLine hover:border-moss dark:hover:border-mossNeon text-xs font-medium text-ink dark:text-darkInk transition-colors"
                >
                  Edit
                </Link>

                {post.status === 'published' ? (
                  <>
                    <Link
                      to={`/post/${post.slug || post.id}`}
                      className="px-3 py-1.5 rounded-xl border border-line dark:border-darkLine hover:border-moss text-xs font-medium text-moss dark:text-mossNeon transition-colors"
                    >
                      View Live
                    </Link>
                    <button
                      type="button"
                      onClick={() => unpublishPost(post.id)}
                      className="px-3 py-1.5 rounded-xl border border-line dark:border-darkLine hover:border-amber-500 text-xs font-medium text-amber-600 dark:text-amber-400 transition-colors"
                    >
                      Unpublish
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => publishPost(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-moss dark:bg-emerald-600 hover:bg-mossDark text-white text-xs font-medium transition-colors"
                  >
                    Publish
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(post.id)}
                  className="p-2 rounded-xl text-inkMuted hover:text-clay dark:text-darkInkMuted dark:hover:text-rose-400 transition-colors"
                  title="Delete story"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-line dark:border-darkLine p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-ink dark:text-darkInk mb-2">
              Delete this story?
            </h3>
            <p className="text-xs text-inkMuted dark:text-darkInkMuted mb-6 leading-relaxed">
              This action cannot be undone. All views, comments, and analytics for this post will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-line dark:border-darkLine text-xs font-medium text-ink dark:text-darkInk"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-clay dark:bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
