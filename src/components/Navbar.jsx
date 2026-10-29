import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/store.js';
import {
  SunIcon,
  MoonIcon,
  SearchIcon,
  BookmarkIcon,
  PlusIcon,
  MenuIcon,
  XIcon,
  TrendingIcon,
  UserIcon
} from './Icons.jsx';
import UserAvatar from './UserAvatar.jsx';

export default function Navbar() {
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const createDraft = useStore((s) => s.createDraft);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const bookmarkedPostIds = useStore((s) => s.bookmarkedPostIds);
  const posts = useStore((s) => s.posts);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Search suggestions
  const publishedPosts = posts.filter((p) => p.status === 'published');
  const searchResults = navSearch.trim()
    ? publishedPosts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(navSearch.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(navSearch.toLowerCase())) ||
            p.tags.some((t) => t.toLowerCase().includes(navSearch.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(navSearch.trim())}`);
      setIsSearchOpen(false);
    }
  }

  function handleNewPost() {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const id = createDraft();
    if (id) navigate(`/editor/${id}`);
  }

  return (
    <header className="border-b border-line dark:border-darkLine bg-paper/95 dark:bg-darkBg/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-8 h-8 rounded-xl bg-moss dark:bg-emerald-600 text-white flex items-center justify-center font-serif text-lg font-bold group-hover:scale-105 transition-transform shadow-sm">
            M
          </span>
          <span className="font-serif text-2xl tracking-tight text-ink dark:text-darkInk font-semibold">
            Marginalia
          </span>
        </Link>

        {/* Global Live Search (Desktop) */}
        <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xs">
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="w-4 h-4 text-inkMuted dark:text-darkInkMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => {
                setNavSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search stories, tags..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk placeholder:text-inkMuted/60 dark:placeholder:text-darkInkMuted/60 focus:border-moss dark:focus:border-mossNeon outline-none transition-all shadow-2xs"
            />
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && navSearch.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-darkCard rounded-2xl border border-line dark:border-darkLine shadow-xl overflow-hidden py-2 z-50 animate-fade-in">
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-inkMuted dark:text-darkInkMuted border-b border-line/50 dark:border-darkLine">
                Suggested Stories
              </div>
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-xs text-inkMuted dark:text-darkInkMuted italic">
                  No matching stories found.
                </div>
              ) : (
                searchResults.map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.slug || post.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-paper dark:hover:bg-darkLine transition-colors"
                  >
                    <span className="text-xs font-medium text-ink dark:text-darkInk line-clamp-1">
                      {post.title}
                    </span>
                    <span className="text-[11px] text-moss dark:text-mossNeon">
                      #{post.category || 'General'} · {post.author}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Navigation links & Actions (Desktop) */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <Link
            to="/"
            className={`transition-colors font-medium ${
              location.pathname === '/'
                ? 'text-moss dark:text-mossNeon'
                : 'text-ink/80 dark:text-darkInk/80 hover:text-moss dark:hover:text-mossNeon'
            }`}
          >
            Feed
          </Link>

          <Link
            to="/?trending=true"
            className="flex items-center gap-1.5 text-ink/80 dark:text-darkInk/80 hover:text-moss dark:hover:text-mossNeon transition-colors font-medium"
          >
            <TrendingIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Trending</span>
          </Link>

          <Link
            to="/bookmarks"
            className="relative flex items-center gap-1.5 text-ink/80 dark:text-darkInk/80 hover:text-moss dark:hover:text-mossNeon transition-colors font-medium"
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>Saved</span>
            {bookmarkedPostIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-moss/15 dark:bg-emerald-500/20 text-moss dark:text-mossNeon font-semibold">
                {bookmarkedPostIds.length}
              </span>
            )}
          </Link>

          {currentUser && (
            <Link
              to="/dashboard"
              className={`transition-colors font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-moss dark:text-mossNeon'
                  : 'text-ink/80 dark:text-darkInk/80 hover:text-moss dark:hover:text-mossNeon'
              }`}
            >
              Dashboard
            </Link>
          )}

          {/* Theme Toggler */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-inkMuted dark:text-darkInkMuted hover:bg-paper dark:hover:bg-darkCard hover:text-ink dark:hover:text-darkInk transition-colors"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Write Post Button */}
          <button
            onClick={handleNewPost}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-moss dark:bg-emerald-600 hover:bg-mossDark dark:hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-xs hover:shadow"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          {/* User Profile / Auth */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-line dark:border-darkLine">
              <Link
                to={`/profile/${currentUser.username}`}
                className="flex items-center gap-2 group"
                title="View Profile"
              >
                <UserAvatar
                  name={currentUser.name}
                  username={currentUser.username}
                  size="sm"
                  className="group-hover:ring-2 group-hover:ring-moss dark:group-hover:ring-mossNeon transition-all"
                />
                <span className="text-xs font-medium text-ink dark:text-darkInk hidden lg:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs text-inkMuted dark:text-darkInkMuted hover:text-clay dark:hover:text-clayLight transition-colors ml-1"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-full border border-line dark:border-darkLine hover:border-moss dark:hover:border-mossNeon text-xs font-medium text-ink dark:text-darkInk transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Actions: Theme + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-ink dark:text-darkInk"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 text-ink dark:text-darkInk rounded-lg"
          >
            {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-line dark:border-darkLine bg-paper dark:bg-darkBg px-6 py-5 space-y-4 animate-fade-in shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="w-4 h-4 text-inkMuted dark:text-darkInkMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search stories, categories..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-line dark:border-darkLine bg-white dark:bg-darkCard text-ink dark:text-darkInk outline-none"
            />
          </form>

          <div className="flex flex-col space-y-3 pt-2 text-base font-medium">
            <Link
              to="/"
              className="text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon"
            >
              Feed
            </Link>
            <Link
              to="/?trending=true"
              className="flex items-center gap-2 text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon"
            >
              <TrendingIcon className="w-4 h-4 text-amber-500" />
              <span>Trending Stories</span>
            </Link>
            <Link
              to="/bookmarks"
              className="flex items-center justify-between text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon"
            >
              <div className="flex items-center gap-2">
                <BookmarkIcon className="w-4 h-4" />
                <span>Saved Posts</span>
              </div>
              {bookmarkedPostIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-moss/20 text-moss dark:text-mossNeon">
                  {bookmarkedPostIds.length}
                </span>
              )}
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/dashboard"
                  className="text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon"
                >
                  Dashboard
                </Link>
                <Link
                  to={`/profile/${currentUser.username}`}
                  className="flex items-center gap-2 text-ink dark:text-darkInk hover:text-moss dark:hover:text-mossNeon"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Profile ({currentUser.username})</span>
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-line dark:border-darkLine flex items-center justify-between gap-3">
            <button
              onClick={handleNewPost}
              className="flex-1 py-2.5 rounded-xl bg-moss dark:bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Write Post</span>
            </button>
            {currentUser ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2.5 rounded-xl border border-line dark:border-darkLine text-clay dark:text-clayLight text-sm font-medium"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl border border-line dark:border-darkLine text-center text-ink dark:text-darkInk text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
