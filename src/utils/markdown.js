import GithubSlugger from 'github-slugger';

export function slugify(text) {
  const slugger = new GithubSlugger();
  return slugger.slug(text);
}

export function wordCount(markdown = '') {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ') // drop code blocks
    .replace(/[#>*_~`\-]/g, ' ')      // drop markdown punctuation
    .trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function readingTime(markdown = '') {
  const words = wordCount(markdown);
  const minutes = Math.max(1, Math.round(words / 200)); // 200 wpm average
  return minutes;
}

export function extractHeadings(markdown = '') {
  const lines = markdown.split('\n');
  const headings = [];
  const slugger = new GithubSlugger();

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.*)/.exec(line.trim());
    if (!match) continue;
    const depth = match[1].length; // 2 or 3
    const text = match[2].trim();
    const slug = slugger.slug(text);
    headings.push({ depth, text, slug });
  }
  return headings;
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
}

export function formatCompactNumber(number = 0) {
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k`;
  return String(number);
}
