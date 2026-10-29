import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../store/store.js';
import PostCard from './PostCard.jsx';
import { EmptyState, FeedSkeleton } from './Skeleton.jsx';
import { seedCategories } from '../data/seed.js';
import {
  TrendingIcon,
  SparklesIcon,
  SearchIcon,
  FilterIcon,
  XIcon
} from './Icons.jsx';

const PAGE_SIZE = 5;

export default function Feed() {
  const posts = useStore((s) => s.posts);
  const userInterests = useStore((s) => s.userInterests);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const queryParam = searchParams.get('q') || '';
  const tagParam = searchParams.get('tag') || null;
  const categoryParam = searchParams.get('category') || 'All';
  const showTrendingParam = searchParams.get('trending') === 'true';

  const [query, setQuery] = useState(queryParam);
  const [activeTag, setActiveTag] = useState(tagParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setQuery(queryParam);
    setActiveTag(tagParam);
    setActiveCategory(categoryParam);
  }, [queryParam, tagParam, categoryParam]);

  const published = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts]
  );

  // Trending Posts (Top 3 by views + likes)
  const trendingPosts = useMemo(() => {
    return [...published]
      .sort((a, b) => ((b.views || 0) + (b.likes || 0) * 3) - ((a.views || 0) + (a.likes || 0) * 3))
      .slice(0, 3);
  }, [published]);

  // Recommended Posts (Based on user interests)
  const recommendedPosts = useMemo(() => {
    const interestCats = userInterests?.categories || [];
    const interestTags = userInterests?.tags || [];
    return published
      .filter((p) => {
        const matchesCat = interestCats.includes(p.category);
        const matchesTag = p.tags?.some((t) => interestTags.includes(t));
        return matchesCat || matchesTag;
      })
      .slice(0, 3);
  }, [published, userInterests]);

  // All unique tags
  const allTags = useMemo(() => {
    const set = new Set();
    published.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [published]);

  // Filtered & Sorted Posts
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return published
      .filter((p) => {
        if (activeCategory && activeCategory !== 'All') {
          return p.category?.toLowerCase() === activeCategory.toLowerCase();
        }
        return true;
      })
      .filter((p) => (activeTag ? p.tags?.includes(activeTag) : true))
      .filter((p) => {
        if (!q) return true;
        const searchable = `${p.title} ${p.content} ${p.author} ${(p.tags || []).join(' ')} ${p.category || ''}`.toLowerCase();
        return searchable.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [published, query, activeTag, activeCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateQuery(value) {
    setQuery(value);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');
    setSearchParams(next);
  }

  function updateCategory(cat) {
    setActiveCategory(cat);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (cat && cat !== 'All') next.set('category', cat);
    else next.delete('category');
    setSearchParams(next);
  }

  function updateTag(tag) {
    setActiveTag(tag);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (tag) next.set('tag', tag);
    else next.delete('tag');
    setSearchParams(next);
  }

  function clearAllFilters() {
    setQuery('');
    setActiveTag(null);
    setActiveCategory('All');
    setPage(1);
    setSearchParams({});
  }

  const hasActiveFilters = Boolean(query || activeTag || (activeCategory && activeCategory !== 'All'));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Editorial Hero Banner */}
      {!hasActiveFilters && (
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-50/70 via-rose-50/50 to-emerald-50/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 border border-line/60 dark:border-darkLine p-6 sm:p-12 mb-12 shadow-2xs">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-darkCard px-3.5 py-1.5 text-xs font-medium text-moss dark:text-mossNeon shadow-2xs mb-5">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>A space for thoughtful writing & technical ideas</span>
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-[1.15] text-ink dark:text-darkInk mb-4 font-bold">
              Stories that stay <span className="text-clay dark:text-rose-400">with you.</span>
            </h1>

            <p className="text-inkMuted dark:text-darkInkMuted text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              Deep dives on web security, clean architecture, frontend engineering, and building resilient software.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('latest-stories')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="rounded-full bg-moss hover:bg-mossDark dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-2.5 text-white text-sm font-medium transition-all shadow-sm"
              >
                Explore stories ↓
              </button>
              <Link
                to="/editor/new"
                className="rounded-full border border-line dark:border-darkLine hover:border-moss dark:hover:border-mossNeon bg-white/80 dark:bg-darkCard px-6 py-2.5 text-ink dark:text-darkInk text-sm font-medium transition-all shadow-2xs"
              >
                Write an article
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {!hasActiveFilters && trendingPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <TrendingIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif text-2xl font-bold text-ink dark:text-darkInk">
              Trending Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/post/${post.slug || post.id}`}
                className="group relative rounded-2xl border border-line/80 dark:border-darkLine bg-white dark:bg-darkCard p-5 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-2xl font-bold text-line dark:text-darkLine group-hover:text-moss dark:group-hover:text-mossNeon transition-colors">
                      0{index + 1}
                    </span>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-paper dark:bg-darkBg text-inkMuted dark:text-darkInkMuted">
                      {post.category || 'General'}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-ink dark:text-darkInk group-hover:text-moss dark:group-hover:text-mossNeon transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-inkMuted dark:text-darkInkMuted pt-3 border-t border-line/40 dark:border-darkLine">
                  <span>@{post.author}</span>
                  <span>{post.views || 0} views</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Pills Navigation */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {seedCategories.map((cat) => {
            const isActive = activeCategory === cat || (!activeCategory && cat === 'All');
            return (
              <button
                key={cat}
                type="button"
                onClick={() => updateCategory(cat)}
                className={`text-xs font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-moss dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-darkCard border border-line dark:border-darkLine text-ink/70 dark:text-darkInk/70 hover:border-moss dark:hover:border-mossNeon'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Stories Heading & Search Toolbar */}
      <div id="latest-stories" className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-ink dark:text-darkInk mb-1">
              {activeCategory !== 'All' ? `${activeCategory} Stories` : 'Latest Stories'}
            </h2>
            <p className="text-sm text-inkMuted dark:text-darkInkMuted">
              Notes on building things, published as they're finished.
            </p>
          </div>

          {/* Result counter */}
          <span className="text-xs font-mono text-inkMuted dark:text-darkInkMuted shrink-0">
            {filtered.length} {filtered.length === 1 ? 'story' : 'stories'} found
          </span>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-inkMuted dark:text-darkInkMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search by keywords, author or content..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm placeholder:text-inkMuted/60 dark:placeholder:text-darkInkMuted/60 focus:border-moss dark:focus:border-mossNeon outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              aria-label="Sort articles"
              className="px-3.5 py-2.5 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm focus:border-moss dark:focus:border-mossNeon outline-none transition-all shadow-2xs"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="popular">Most liked</option>
              <option value="views">Most viewed</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-line dark:border-darkLine hover:border-clay text-clay dark:text-rose-400 text-xs font-medium transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-8">
            <span className="text-xs text-inkMuted dark:text-darkInkMuted mr-1 font-mono">
              Tags:
            </span>
            {allTags.map((tag) => {
              const isSelected = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => updateTag(isSelected ? null : tag)}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-moss dark:bg-emerald-600 border-moss text-white shadow-2xs'
                      : 'border-line dark:border-darkLine bg-white/50 dark:bg-darkCard/50 text-inkMuted dark:text-darkInkMuted hover:border-moss dark:hover:border-mossNeon'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Post Items or Empty State */}
        {isLoading ? (
          <FeedSkeleton count={3} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matching stories found"
            description="We couldn't find any stories matching your current filters or search terms. Try searching for other topics or resetting your filters."
            actionLabel="Clear all filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="space-y-4">
            {pageItems.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-line/60 dark:border-darkLine">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm font-medium hover:border-moss dark:hover:border-mossNeon disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs"
            >
              Previous
            </button>

            <span className="text-xs font-mono text-inkMuted dark:text-darkInkMuted px-2">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm font-medium hover:border-moss dark:hover:border-mossNeon disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs"
            >
              Next
            </button>
          </div>
        )}

        {/* Recommended for you Section */}
        {!hasActiveFilters && recommendedPosts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-line/80 dark:border-darkLine">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-2xl font-bold text-ink dark:text-darkInk">
                Recommended For You
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.slug || post.id}`}
                  className="rounded-2xl border border-line/80 dark:border-darkLine bg-white dark:bg-darkCard p-5 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono uppercase text-moss dark:text-mossNeon font-semibold">
                      {post.category}
                    </span>
                    <h3 className="font-serif text-base font-bold text-ink dark:text-darkInk line-clamp-2 mt-1 mb-2">
                      {post.title}
                    </h3>
                  </div>
                  <div className="text-xs text-inkMuted dark:text-darkInkMuted pt-3 border-t border-line/40 dark:border-darkLine">
                    By @{post.author}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
