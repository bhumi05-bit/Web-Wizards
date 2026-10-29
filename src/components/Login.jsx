import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/store.js';

export default function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  // Empty by default - no auto login or prefill
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    if (!password) {
      setError('Password is required. Please enter your password.');
      return;
    }

    const result = login(username.trim(), password);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid username or password.');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 sm:mt-20 px-4 sm:px-6">
      <div className="rounded-3xl border border-line dark:border-darkLine bg-white dark:bg-darkCard p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="w-10 h-10 rounded-2xl bg-moss dark:bg-emerald-600 text-white flex items-center justify-center font-serif text-xl font-bold mx-auto mb-3 shadow-sm">
            M
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink dark:text-darkInk mb-2">
            Author Sign In
          </h1>
          <p className="text-xs text-inkMuted dark:text-darkInkMuted">
            Enter your credentials to access your dashboard and write stories.
          </p>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-medium text-ink dark:text-darkInk mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoFocus
              autoComplete="off"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. bhumi or ishika"
              required
              className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-ink dark:text-darkInk" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-inkMuted dark:text-darkInkMuted hover:text-moss"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your password..."
              required
              className="w-full text-xs rounded-xl border border-line dark:border-darkLine bg-paper dark:bg-darkBg text-ink dark:text-darkInk p-2.5 outline-none focus:border-moss"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-moss dark:bg-emerald-600 hover:bg-mossDark text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            Sign In with Password
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-inkMuted dark:text-darkInkMuted">
          <Link to="/" className="hover:text-moss dark:hover:text-mossNeon">
            ← Back to public stories
          </Link>
        </div>
      </div>
    </div>
  );
}
