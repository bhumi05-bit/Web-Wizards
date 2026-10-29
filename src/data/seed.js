// Seed content with no external stock photos

export const seedUsers = [
  {
    username: 'bhumi',
    name: 'Bhumi',
    password: 'bhumi',
    role: 'Lead Engineer & Technical Writer',
    avatar: '',
    bio: 'Writing about React internals, security sanitisation pipelines, and building resilient full-stack applications.',
    joinedDate: '2025-01-15',
    location: 'India',
    website: 'https://bhumi.dev'
  },
  {
    username: 'ishika',
    name: 'Ishika',
    password: 'ishika',
    role: 'UI/UX Designer & Systems Architect',
    avatar: '',
    bio: 'Crafting thoughtful design systems, readable typography, and scalable web architectures. Passionate about developer experience.',
    joinedDate: '2025-02-10',
    location: 'India',
    website: 'https://ishika.design'
  }
];

export const seedCategories = [
  'All',
  'Security',
  'React',
  'Architecture',
  'Design',
  'Performance',
  'Career'
];

export const seedPosts = [
  {
    id: 'preventing-xss-in-markdown',
    title: 'Preventing XSS When Rendering User Markdown',
    slug: 'preventing-xss-in-markdown',
    category: 'Security',
    tags: ['security', 'react', 'markdown', 'frontend'],
    status: 'published',
    author: 'bhumi',
    coverImage: '',
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
    views: 482,
    likes: 34,
    content: `# Preventing XSS When Rendering User Markdown

Markdown looks harmless on the surface until a malicious user pastes raw \`<script>\` or \`<img onerror=...>\` tags into a post body and your web application faithfully renders them directly into the reader's browser DOM.

## The Fundamental Problem

Most standard Markdown parsers convert \`**bold text**\` to \`<strong>\` tags — but by design, they also pass arbitrary HTML straight through. That means:

\`\`\`html
<img src="invalid-url" onerror="alert('Malicious payload executed!')">
\`\`\`

...gets rendered as a live, executing HTML image tag with an active event handler.

## The Multi-Layer Defense Pipeline

Here is how our sanitisation pipeline secures author-submitted content:

1. **Parse AST**: Parse raw Markdown into an Abstract Syntax Tree using **react-markdown** and **remark-gfm**.
2. **Controlled Raw HTML**: Allow only safe inline tags like \`<mark>\` through **rehype-raw**.
3. **Strict Schema Sanitisation**: Run **rehype-sanitize** with a rigorous allowlist schema that strips event handlers (\`onclick\`, \`onerror\`), script tags, and \`javascript:\` URIs.
4. **Code Syntax Highlighting**: Highlight code blocks cleanly via **rehype-highlight**.

> "Sanitise at the boundary, not in the middle of your render tree. It should be impossible to add a new render path that skips it."

By locking down element tags and attribute keys, your CMS remains impervious to cross-site scripting attacks while giving legitimate authors rich expressive freedom.`
  },
  {
    id: 'debounced-autosave',
    title: 'Building a Debounced Auto-Save for a Draft Editor',
    slug: 'debounced-autosave',
    category: 'React',
    tags: ['react', 'ux', 'javascript', 'performance'],
    status: 'published',
    author: 'bhumi',
    coverImage: '',
    createdAt: '2026-08-10T14:30:00.000Z',
    updatedAt: '2026-08-11T08:15:00.000Z',
    views: 310,
    likes: 27,
    content: `# Building a Debounced Auto-Save for a Draft Editor

Saving every keystroke over network requests or local persistence causes memory churn, UI stutter, and potential race conditions. Conversely, saving only when the user navigates away risks losing precious work if a browser tab crashes unexpectedly.

## Debounce vs Throttle: What's the Difference?

- **Throttle**: Fires at most once every *N* milliseconds (great for scroll position listeners).
- **Debounce**: Waits until typing has paused for *N* milliseconds before executing the save function.

\`\`\`javascript
function useDebouncedSave(data, delayMs, onSave) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(data);
    }, delayMs);

    // Cleanup cancels pending timer on every keystroke
    return () => clearTimeout(timer);
  }, [data, delayMs, onSave]);
}
\`\`\`

## Key Takeaways

1. Always cancel the pending timeout inside the \`useEffect\` cleanup return.
2. Provide immediate UI feedback (e.g., "Editing...", "Saving...", "All changes saved").
3. Combine debounce with an explicit "Save Draft" button for anxious authors!`
  },
  {
    id: 'slugs-vs-ids',
    title: 'Why Slugs Beat IDs in Modern Web URLs',
    slug: 'slugs-vs-ids',
    category: 'Architecture',
    tags: ['routing', 'seo', 'architecture', 'web'],
    status: 'published',
    author: 'ishika',
    coverImage: '',
    createdAt: '2026-08-18T11:00:00.000Z',
    updatedAt: '2026-08-18T11:00:00.000Z',
    views: 265,
    likes: 19,
    content: `# Why Slugs Beat IDs in Modern Web URLs

Look at these two sample blog post URLs:

\`\`\`text
https://example.com/post/94821
https://example.com/post/why-slugs-beat-ids-in-modern-web-urls
\`\`\`

The second format is self-describing, memorable, easy to share across messaging apps, and provides crucial keyword context to search engine crawlers before they even parse the page HTML.

## Handling Collision Gracefully

When two writers compose posts with the same title ("My First Post"), simply appending sequential numbers (\`-2\`, \`-3\`) or short hashes guarantees route uniqueness without breaking human readability.

\`\`\`javascript
function ensureUniqueSlug(baseSlug, existingPosts, currentId) {
  let candidate = baseSlug;
  let counter = 2;
  while (existingPosts.some(p => p.id !== currentId && p.slug === candidate)) {
    candidate = \`\${baseSlug}-\${counter}\`;
    counter++;
  }
  return candidate;
}
\`\`\`

Slugs establish a durable contract between your web platform and your audience.`
  },
  {
    id: 'mastering-design-systems',
    title: 'Crafting Consistent Design Systems for Content Platforms',
    slug: 'crafting-consistent-design-systems-for-content-platforms',
    category: 'Design',
    tags: ['design', 'typography', 'accessibility', 'css'],
    status: 'published',
    author: 'ishika',
    coverImage: '',
    createdAt: '2026-08-25T16:20:00.000Z',
    updatedAt: '2026-08-26T10:10:00.000Z',
    views: 195,
    likes: 22,
    content: `# Crafting Consistent Design Systems for Content Platforms

Reading long-form content is fundamentally an optical experience. The interplay of line length, typographic scale, vertical rhythm, and color contrast directly dictates whether readers stay engaged or click away.

## Core Principles of Editorial UI

### 1. The 65-75 Character Measure
Lines of text that span across the full width of an ultrawide monitor strain the reader's eyes. Restricting article bodies to \`max-w-2xl\` or \`max-w-3xl\` keeps the character count per line within the sweet spot.

### 2. High-Contrast Dark Mode
Dark mode shouldn't be pitch black (\`#000000\`). A deep slate (\`#0F172A\`) paired with softened off-white typography (\`#F8FAFC\`) prevents harsh eye fatigue during late-night reading sessions.

### 3. Accessible Focus Indicators
Every interactive button, link, and input requires a distinct, high-visibility focus ring for keyboard navigation.`
  }
];

export const seedComments = {
  'preventing-xss-in-markdown': [
    {
      id: 'c-101',
      postId: 'preventing-xss-in-markdown',
      parentId: null,
      author: 'Ishika',
      authorUsername: 'ishika',
      authorAvatar: '',
      text: 'Brilliant breakdown of rehype-sanitize, Bhumi! Clean architecture is so essential.',
      likes: 5,
      createdAt: '2026-08-03T11:20:00.000Z'
    },
    {
      id: 'c-102',
      postId: 'preventing-xss-in-markdown',
      parentId: 'c-101',
      author: 'Bhumi',
      authorUsername: 'bhumi',
      authorAvatar: '',
      text: 'Thank you Ishika! Keeping everything sanitized at the boundary makes security foolproof.',
      likes: 3,
      createdAt: '2026-08-03T12:05:00.000Z'
    }
  ],
  'slugs-vs-ids': [
    {
      id: 'c-201',
      postId: 'slugs-vs-ids',
      parentId: null,
      author: 'Bhumi',
      authorUsername: 'bhumi',
      authorAvatar: '',
      text: 'Slugs make technical articles so much cleaner to share and bookmark. Love this explanation!',
      likes: 4,
      createdAt: '2026-08-19T09:15:00.000Z'
    }
  ]
};
