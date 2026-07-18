import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import { supabase } from '../../utils/supabaseClient';
import { KeyRound, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const checkUser = async () => {
      const user = await db.getCurrentUserAsync();
      if (user) {
        window.location.href = '/dashboard';
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (oAuthError) {
        setError(oAuthError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start Google Authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-canvas border border-hairline rounded-lg shadow-level-4 transition-all duration-300">
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

        <div className="relative flex items-center justify-center my-4">
          <span className="absolute inset-x-0 h-px bg-hairline"></span>
          <span className="relative px-3 text-xs bg-canvas text-mute font-mono uppercase tracking-wider">or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-canvas border border-hairline text-ink rounded-full hover:bg-canvas-soft-2 active:scale-[0.98] transition-all font-medium text-sm h-[40px] cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.1.14 2.01c-.8 1.2-1.8 2.2-3.1 3l4.81 3.73c2.81-2.59 4.49-6.4 4.49-10.59z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.81-3.73c-1.33.89-3.04 1.43-5.15 1.43-3.97 0-7.34-2.68-8.54-6.29H1.46v3.86C3.44 20.48 7.42 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M3.46 14.5c-.3-1-.46-2.07-.46-3.17s.16-2.17.46-3.17V4.3H1.46C.53 6.16 0 8.23 0 10.43s.53 4.27 1.46 6.13l2.8-2.06z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.42 0 3.44 3.52 1.46 7.42l3.81 2.96c1.2-3.61 4.57-6.29 8.54-6.29z"
            />
          </svg>
          Continue with Google
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
