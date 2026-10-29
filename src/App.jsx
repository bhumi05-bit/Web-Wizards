import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Feed from './components/Feed.jsx';
import PostViewer from './components/PostViewer.jsx';
import Dashboard from './components/Dashboard.jsx';
import Bookmarks from './components/Bookmarks.jsx';
import Profile from './components/Profile.jsx';
import Login from './components/Login.jsx';
import { useStore } from './store/store.js';

// Lazy-loaded Markdown Editor chunk
const Editor = lazy(() => import('./components/Editor.jsx'));

function EditorFallback() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center animate-pulse">
      <div className="h-8 w-64 bg-line dark:bg-darkLine rounded-xl mx-auto mb-4 skeleton" />
      <p className="text-sm text-inkMuted dark:text-darkInkMuted">Loading Markdown studio…</p>
    </div>
  );
}

export default function App() {
  const initTheme = useStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-paper dark:bg-darkBg text-ink dark:text-darkInk font-sans transition-colors duration-200">
      <Navbar />
      <main className="pb-16">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post/:slug" element={<PostViewer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/editor/:id"
            element={
              <Suspense fallback={<EditorFallback />}>
                <Editor />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto px-6 py-24 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <h1 className="font-serif text-3xl font-bold mb-2">404 - Page Not Found</h1>
                <p className="text-sm text-inkMuted dark:text-darkInkMuted mb-6">
                  The page you requested could not be located.
                </p>
                <a
                  href="/"
                  className="px-6 py-2.5 rounded-full bg-moss dark:bg-emerald-600 text-white text-sm font-medium hover:bg-mossDark"
                >
                  Back to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/60 dark:border-darkLine py-8 text-center text-xs text-inkMuted dark:text-darkInkMuted">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Marginalia Blog CMS — Written with React, Vite & Tailwind</p>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-moss dark:hover:text-mossNeon">Home</a>
            <a href="/bookmarks" className="hover:text-moss dark:hover:text-mossNeon">Reading List</a>
            <a href="/dashboard" className="hover:text-moss dark:hover:text-mossNeon">Author Studio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
