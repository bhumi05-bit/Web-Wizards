import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../store/store.js';
import { wordCount, readingTime } from '../utils/markdown.js';
import SanitizedMarkdown from './SanitizedMarkdown.jsx';
import { seedCategories } from '../data/seed.js';
import {
  EyeIcon,
  EditIcon,
  ImageIcon,
  CheckIcon,
  ClockIcon,
  XIcon
} from './Icons.jsx';

const AUTOSAVE_DELAY_MS = 800;

const IMAGE_PRESETS = [
  {
    label: 'Code & Tech',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Web Security',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Design & UI',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80'
  },
  {
    label: 'Architecture',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'
  }
];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const posts = useStore((s) => s.posts);
  const updatePost = useStore((s) => s.updatePost);
  const publishPost = useStore((s) => s.publishPost);
  const currentUser = useStore((s) => s.currentUser);
  const createDraft = useStore((s) => s.createDraft);

  // If id === 'new', create a draft and redirect to it
  useEffect(() => {
    if (id === 'new') {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      const newId = createDraft();
      if (newId) navigate(`/editor/${newId}`, { replace: true });
    }
  }, [id, currentUser]);

  const post = posts.find((p) => p.id === id);

  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'Technology');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(', ') || '');
  const [saveState, setSaveState] = useState('saved'); // 'editing' | 'saving' | 'saved'
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');

  const textareaRef = useRef(null);
  const saveTimer = useRef(null);

  // Initialize state when post loads
  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setCategory(post.category || 'Technology');
      setCoverImage(post.coverImage || '');
      setTagsInput(post.tags?.join(', ') || '');
    }
  }, [post?.id]);

  // Debounced auto-save
  useEffect(() => {
    if (!post) return;
    setSaveState('editing');

    saveTimer.current = setTimeout(() => {
      setSaveState('saving');
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      updatePost(post.id, {
        title,
        content,
        category,
        coverImage,
        tags
      });
      setSaveState('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(saveTimer.current);
  }, [title, content, category, coverImage, tagsInput]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6 text-center">
        <h2 className="font-serif text-2xl mb-3 text-ink dark:text-darkInk">Sign in required</h2>
        <p className="text-sm text-inkMuted dark:text-darkInkMuted mb-6">
          You need to be logged in to create and edit articles.
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

  if (id !== 'new' && !post) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6 text-center">
        <h2 className="font-serif text-2xl mb-3 text-ink dark:text-darkInk">Draft not found</h2>
        <p className="text-sm text-inkMuted dark:text-darkInkMuted mb-6">
          This post draft doesn't exist or was removed.
        </p>
        <Link to="/dashboard" className="text-sm text-moss dark:text-mossNeon underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const words = wordCount(content);
  const minutes = readingTime(content);

  function insertMarkdown(before, after = before, placeholder = 'text') {
    const field = textareaRef.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function handleInsertImageSubmit(e) {
    e.preventDefault();
    if (!modalImageUrl.trim()) return;
    const alt = modalImageAlt.trim() || 'Image description';
    insertMarkdown(`![${alt}](`, `${modalImageUrl.trim()})`, '');
    setModalImageUrl('');
    setModalImageAlt('');
    setShowImageModal(false);
  }

  function handleSaveDraft() {
    if (!post) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updatePost(post.id, {
      title,
      content,
      category,
      coverImage,
      tags
    });
    setSaveState('saved');
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }

  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef(null);

  function handlePublish() {
    if (!post) return;
    if (!title.trim()) {
      setTitleError('Please enter a title for your blog post before publishing.');
      titleInputRef.current?.focus();
      return;
    }
    if (!content.trim()) {
      setTitleError('Please write some content before publishing.');
      textareaRef.current?.focus();
      return;
    }
    setTitleError('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updatePost(post.id, {
      title: title.trim(),
      content,
      category,
      coverImage,
      tags
    });

    publishPost(post.id);
    const updated = useStore.getState().posts.find((p) => p.id === post.id);
    navigate(`/post/${updated?.slug || post.id}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-line dark:border-darkLine">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-xs text-inkMuted dark:text-darkInkMuted hover:text-moss dark:hover:text-mossNeon font-medium"
          >
            ← Dashboard
          </Link>
          <span className="text-xs text-line dark:text-darkLine">|</span>
          <span className="text-xs font-mono text-inkMuted dark:text-darkInkMuted flex items-center gap-1.5">
            {saveState === 'saving' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
            {saveState === 'saved' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            <span>
              {saveState === 'saving'
                ? 'Saving changes…'
                : saveState === 'saved'
                ? `Saved ${lastSavedTime ? `at ${lastSavedTime}` : ''}`
                : 'Editing…'}
            </span>
          </span>
        </div>

        {/* View mode toggle (Write / Preview / Split) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-line/40 dark:bg-darkCard p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-darkLine text-ink dark:text-darkInk shadow-2xs font-semibold'
                  : 'text-inkMuted dark:text-darkInkMuted hover:text-ink'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-darkLine text-ink dark:text-darkInk shadow-2xs font-semibold'
                  : 'text-inkMuted dark:text-darkInkMuted hover:text-ink'
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden md:block px-3 py-1 rounded-lg transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-darkLine text-ink dark:text-darkInk shadow-2xs font-semibold'
                  : 'text-inkMuted dark:text-darkInkMuted hover:text-ink'
              }`}
            >
              Split View
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-1.5 rounded-xl border border-line dark:border-darkLine hover:border-moss dark:hover:border-mossNeon text-xs font-medium text-ink dark:text-darkInk transition-all"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="px-5 py-2 rounded-xl bg-moss hover:bg-mossDark dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 hover:scale-102 active:scale-98 cursor-pointer"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Publish Story</span>
          </button>
        </div>
      </div>

      {/* Helpful Error / Guidance Banner */}
      {titleError && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center justify-between animate-fade-in">
          <span>⚠️ {titleError}</span>
          <button type="button" onClick={() => setTitleError('')} className="p-1 hover:opacity-70">
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Title Input */}
      <div className="relative mb-4">
        <label className="block text-[11px] font-mono uppercase text-inkMuted/80 dark:text-darkInkMuted/80 mb-1">
          Post Title (required to publish)
        </label>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          placeholder="Enter your blog title here (e.g. My First Story)..."
          className={`w-full font-serif text-3xl sm:text-4xl font-bold bg-transparent text-ink dark:text-darkInk placeholder:text-inkMuted/30 dark:placeholder:text-darkInkMuted/30 outline-none pb-2 border-b transition-colors ${
            titleError ? 'border-amber-500 focus:border-amber-600' : 'border-line dark:border-darkLine focus:border-moss'
          }`}
        />
      </div>

      {/* Metadata Bar (Category & Tags) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard shadow-2xs">
        <div>
          <label className="block text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2 outline-none focus:border-moss"
          >
            {seedCategories.filter((c) => c !== 'All').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-inkMuted dark:text-darkInkMuted mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. react, security, web, architecture"
            className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2 outline-none focus:border-moss"
          />
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {/* Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className="flex flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-t-2xl border border-b-0 border-line dark:border-darkLine bg-white dark:bg-darkCard">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**', 'bold text')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Bold (**text**)"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*', 'italic text')}
                  className="px-2.5 py-1 rounded-lg text-xs italic border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Italic (*text*)"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
                  className="px-2.5 py-1 rounded-lg text-xs line-through border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Strikethrough"
                >
                  S
                </button>
                <span className="text-line dark:text-darkLine">|</span>
                <button
                  type="button"
                  onClick={() => insertMarkdown('# ', '', 'Heading 1')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="H1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ', '', 'Heading 2')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="H2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ', '', 'Heading 3')}
                  className="px-2 py-1 rounded-lg text-xs font-semibold border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="H3"
                >
                  H3
                </button>
                <span className="text-line dark:text-darkLine">|</span>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](https://example.com)', 'link text')}
                  className="px-2.5 py-1 rounded-lg text-xs border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Insert Link"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="px-2.5 py-1 rounded-lg text-xs border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk flex items-center gap-1"
                  title="Insert Image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ', '', 'Quote text')}
                  className="px-2.5 py-1 rounded-lg text-xs border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Blockquote"
                >
                  Quote
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`', 'code')}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Inline Code"
                >
                  `Code`
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('```javascript\n', '\n```', '// Your code here')}
                  className="px-2 py-1 rounded-lg text-xs font-mono border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Code Block"
                >
                  {'{ }'}
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ', '', 'List item')}
                  className="px-2 py-1 rounded-lg text-xs border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Unordered List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('1. ', '', 'First item')}
                  className="px-2 py-1 rounded-lg text-xs border border-line dark:border-darkLine hover:bg-paper dark:hover:bg-darkLine text-ink dark:text-darkInk"
                  title="Numbered List"
                >
                  1. List
                </button>
              </div>

              {/* Indicator stats */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-inkMuted dark:text-darkInkMuted pr-2">
                <span>{words} words</span>
                <span>·</span>
                <span>{minutes}m read</span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story in Markdown... Use toolbar buttons above to insert formatting, headings, links, and images."
              rows={24}
              className="editor-textarea w-full p-4 rounded-b-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk text-sm focus:border-moss dark:focus:border-mossNeon outline-none resize-y leading-relaxed font-mono shadow-2xs"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between p-2.5 rounded-t-2xl border border-b-0 border-line dark:border-darkLine bg-white dark:bg-darkCard px-4">
              <span className="text-xs font-mono uppercase tracking-wider text-inkMuted dark:text-darkInkMuted font-semibold">
                Live Markdown Preview
              </span>
              <span className="text-xs font-mono text-moss dark:text-mossNeon font-medium">
                Sanitised & Formatted
              </span>
            </div>

            <div className="p-6 rounded-b-2xl border border-line dark:border-darkLine bg-white dark:bg-darkCard min-h-[500px] max-h-[700px] overflow-y-auto prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif shadow-2xs">
              {title && <h1 className="font-serif text-3xl font-bold mb-4">{title}</h1>}
              <SanitizedMarkdown content={content} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Publish Bar */}
      <div className="mt-8 pt-5 border-t border-line dark:border-darkLine flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-inkMuted dark:text-darkInkMuted font-mono">
          Ready to share? Make sure you have entered a title and written your post.
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-5 py-2 rounded-xl border border-line dark:border-darkLine hover:border-moss text-xs font-medium text-ink dark:text-darkInk transition-all"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-2 rounded-xl bg-moss hover:bg-mossDark dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-102"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Publish Story</span>
          </button>
        </div>
      </div>

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-line dark:border-darkLine p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-ink dark:text-darkInk">
                Insert Image
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-inkMuted hover:text-ink dark:text-darkInkMuted dark:hover:text-darkInk"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInsertImageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={modalImageUrl}
                  onChange={(e) => setModalImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  required
                  className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1">
                  Alt Text (for accessibility)
                </label>
                <input
                  type="text"
                  value={modalImageAlt}
                  onChange={(e) => setModalImageAlt(e.target.value)}
                  placeholder="e.g. Architecture diagram of auth flow"
                  className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-[11px] font-mono text-inkMuted dark:text-darkInkMuted mb-2">
                  Or pick a royalty-free Unsplash preset:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setModalImageUrl(preset.url);
                        setModalImageAlt(preset.label);
                      }}
                      className="text-left text-xs p-2 rounded-xl border border-line dark:border-darkLine hover:border-moss hover:bg-paper dark:hover:bg-darkLine transition-all flex items-center gap-2"
                    >
                      <img src={preset.url} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 rounded-xl border border-line dark:border-darkLine text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modalImageUrl.trim()}
                  className="px-5 py-2 rounded-xl bg-moss dark:bg-emerald-600 text-white text-xs font-medium hover:bg-mossDark transition-all disabled:opacity-40"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
