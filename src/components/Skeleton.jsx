import React from 'react';
import { Link } from 'react-router-dom';

export function PostCardSkeleton() {
  return (
    <div className="mb-6 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard p-6 shadow-sm overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-line dark:bg-darkLine skeleton" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 rounded bg-line dark:bg-darkLine skeleton" />
          <div className="h-2.5 w-16 rounded bg-line dark:bg-darkLine skeleton" />
        </div>
      </div>
      <div className="h-6 w-3/4 rounded bg-line dark:bg-darkLine skeleton mb-2.5" />
      <div className="h-4 w-full rounded bg-line dark:bg-darkLine skeleton mb-1.5" />
      <div className="h-4 w-2/3 rounded bg-line dark:bg-darkLine skeleton mb-4" />
      <div className="flex items-center justify-between pt-2 border-t border-line/60 dark:border-darkLine">
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-full bg-line dark:bg-darkLine skeleton" />
          <div className="h-6 w-14 rounded-full bg-line dark:bg-darkLine skeleton" />
        </div>
        <div className="h-6 w-20 rounded-full bg-line dark:bg-darkLine skeleton" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostViewerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 w-32 rounded bg-line dark:bg-darkLine skeleton mb-4" />
      <div className="h-10 w-4/5 rounded bg-line dark:bg-darkLine skeleton mb-6" />
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-line dark:bg-darkLine skeleton" />
        <div className="space-y-1">
          <div className="h-4 w-28 rounded bg-line dark:bg-darkLine skeleton" />
          <div className="h-3 w-40 rounded bg-line dark:bg-darkLine skeleton" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-line dark:bg-darkLine skeleton" />
        <div className="h-4 w-full rounded bg-line dark:bg-darkLine skeleton" />
        <div className="h-4 w-5/6 rounded bg-line dark:bg-darkLine skeleton" />
        <div className="h-4 w-3/4 rounded bg-line dark:bg-darkLine skeleton" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title = 'Nothing found here',
  description = 'Try exploring other stories or adjusting your search filters.',
  actionLabel,
  actionTo,
  onAction
}) {
  return (
    <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-line dark:border-darkLine bg-white/50 dark:bg-darkCard/40 backdrop-blur-sm my-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-moss/10 dark:bg-emerald-500/10 text-moss dark:text-mossNeon flex items-center justify-center text-3xl">
        {icon || '📚'}
      </div>
      <h3 className="font-serif text-2xl text-ink dark:text-darkInk mb-2">{title}</h3>
      <p className="text-sm text-inkMuted dark:text-darkInkMuted max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-moss hover:bg-mossDark text-paper dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-moss hover:bg-mossDark text-paper dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
