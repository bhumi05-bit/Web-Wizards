# Marginalia — Blog Platform with Markdown Editor & CMS

A full-featured, responsive React 18 + Vite Markdown Blogging Platform & CMS featuring dark mode, author studio, live split preview, engagement analytics, nested comments, profile customization, and intelligent content discovery.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open the local URL printed in your terminal (typically `http://localhost:5173`).

### Production Build
```bash
npm run build
npm run preview
```

### Demo Accounts (Mock Auth)
* **Bhumi** (Lead Engineer & Technical Writer):
  - Username: `bhumi`
  - Password: `bhumi` (or `bhumi123`)
* **Ishika** (UI/UX Designer & Systems Architect):
  - Username: `ishika`
  - Password: `ishika` (or `ishika123`)

---

## Implemented Functionality Checklist

### 1. Writing, Editing, Drafts & Publishing
- [x] **Markdown Studio**: Split-view editor with live synchronized preview, edit-only mode, and preview-only mode.
- [x] **Rich Formatting Toolbar**: Bold (`**`), Italic (`*`), Strikethrough (`~~`), Headings (H1, H2, H3), Links, Quotes (`>`), Inline Code, Code Blocks with syntax highlighting, Unordered Lists, Ordered Lists.
- [x] **Image Inserter**: Custom URL & Alt text modal with royalty-free Unsplash presets (Code, Security, Design, Architecture).
- [x] **Debounced Auto-Save**: Real-time 800ms debounce that cancels pending saves during active keystrokes, with visual status indicators ("Saving...", "Saved at 4:15 PM").
- [x] **Word Count & Reading Time**: Live calculated indicators for word count and estimated reading time.
- [x] **Post Cover Images & Categories**: Cover image URLs and category tagging for every story.

### 2. Likes, Bookmarks, Comments & Sharing
- [x] **Likes**: Heart animation with instant optimistic like count tracking.
- [x] **Bookmarks / Reading List**: Save articles for offline reading, complete with dedicated `/bookmarks` view.
- [x] **Nested Comment Threads**: Multi-level reply threads with author avatars, relative timestamps, and likes on comments.
- [x] **XSS Sanitisation**: `DOMPurify` protection for comments + multi-stage `rehype-sanitize` AST pipeline for post markdown.
- [x] **Social Sharing**: Copy link to clipboard with animated toast feedback, plus quick sharing to Twitter/X, WhatsApp, and LinkedIn.
- [x] **Related Posts & View Counter**: Automatic reading view incrementor and related stories matching category and tags.

### 3. Author Dashboard & Analytics
- [x] **Summary KPI Cards**: Total articles, published stories, drafts, total views, total likes, and followers count.
- [x] **Performance Charts**: Visual progress charts of top 5 most-viewed stories comparing views and likes.
- [x] **Post Management**: Full-text search within author posts, status filters (All, Published, Drafts), and sorting options (Updated, Views, Likes, Title A-Z).
- [x] **Actions**: Instant Edit, Unpublish/Publish toggle, and permanent Delete with confirmation modal.

### 4. UI/UX, Themes & Responsiveness
- [x] **Dark / Light Mode**: Persistent theme toggle in Navbar with smooth CSS transitions and dark mode typography (`prose-invert`).
- [x] **Responsive Mobile Design**: Mobile drawer navigation, adaptive editor tabs (Write / Preview / Split), responsive cards and tables.
- [x] **Reading Progress Bar**: Fixed top progress bar indicating scroll percentage (0% to 100%) through articles.
- [x] **Skeleton Loading & Empty States**: Shimmering skeleton loaders for feed/articles and friendly empty state illustrations.

### 5. Author Profiles & Social Following
- [x] **Author Profile Page** (`/profile/:username`): High-res avatar, name, username, bio, role, location, website, and publication stats.
- [x] **Author's Stories**: Dedicated tabs for published articles and drafts.
- [x] **Follow / Following System**: Follow authors, view follower counts, and track mutual connections.
- [x] **Edit Profile Modal**: Change name, bio, role, location, website, and choose from avatar portrait presets.

### 6. Categories, Tags, Trending & Recommendations
- [x] **Category Taxonomy**: Filter stories across `Security`, `React`, `Architecture`, `Design`, `Performance`, and `Career`.
- [x] **Tag Cloud**: Clickable `#tags` on cards and feed with URL sync (`?tag=...`).
- [x] **Trending Stories**: Ranked `#1`, `#2`, `#3` trending stories section on the feed.
- [x] **Search Suggestions**: Global autocomplete search bar showing matching stories and categories as you type.
- [x] **Personalized Recommendations**: "Recommended for You" section tailored to user reading interests.

---

## Technical Stack

* **Frontend Framework**: React 18
* **Build Tool**: Vite 5 with code splitting and custom Rollup chunks
* **Routing**: React Router v6
* **State Management**: Zustand v4 with `persist` middleware (local browser storage)
* **Styling**: Tailwind CSS v3 with `@tailwindcss/typography` & dark mode
* **Markdown Engine**: `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`, `rehype-slug`, `rehype-highlight`
* **Sanitization**: `DOMPurify` + strict Rehype schema
