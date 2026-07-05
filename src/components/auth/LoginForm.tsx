import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import { KeyRound, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const user = db.getCurrentUser();
    if (user) {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate network latency
    setTimeout(() => {
      const user = db.findUser(email);
      if (!user || user.passwordHash !== password) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      db.setCurrentUser(user);
      window.location.href = '/dashboard';
    }, 600);
  };

  return (
    <div className="w-full max-w-md p-8 bg-canvas border border-hairline rounded-lg shadow-level-4 transition-all duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back.
        </h2>
        <p className="mt-2 text-sm text-body">
          Enter your credentials to access your study notebook.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm bg-error-soft text-error-deep rounded-sm border border-error-soft font-medium animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-mute">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink placeholder:text-mute focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-hairline-strong transition-all h-[40px]"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-mute">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs text-link hover:text-link-deep transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-mute">
              <KeyRound size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink placeholder:text-mute focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-hairline-strong transition-all h-[40px]"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-mute hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-on-primary rounded-full hover:opacity-90 active:scale-[0.98] transition-all font-medium text-sm h-[40px] cursor-pointer"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-hairline text-center text-sm text-body">
        Don't have an account?{' '}
        <a
          href="/signup"
          className="font-medium text-link hover:text-link-deep transition-colors"
        >
          Sign up for free
        </a>
      </div>
    </div>
  );
}
