import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import { Mail, KeyRound, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Check if user already exists
      const existingUser = db.findUser(email);
      if (existingUser) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      // Add user to database
      const newUser = db.addUser(name, email, password);
      if (!newUser) {
        setError('Error creating account. Please try again.');
        setLoading(false);
        return;
      }

      // Set user session
      db.setCurrentUser(newUser);
      setSuccess(true);

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }, 600);
  };

  return (
    <div className="w-full max-w-md p-8 bg-canvas border border-hairline rounded-lg shadow-level-4 transition-all duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Create your account.
        </h2>
        <p className="mt-2 text-sm text-body">
          Get started on organizing your subjects and study notes.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm bg-error-soft text-error-deep rounded-sm border border-error-soft font-medium animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-6 text-sm bg-link-bg-soft text-link-deep rounded-sm border border-link-bg-soft font-medium">
          Account created successfully! Redirecting to workspace...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-mute">
              <User size={16} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink placeholder:text-mute focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-hairline-strong transition-all h-[40px]"
              placeholder="Alex Johnson"
              required
            />
          </div>
        </div>

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
              placeholder="alex@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-mute">
              <KeyRound size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink placeholder:text-mute focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-hairline-strong transition-all h-[40px]"
              placeholder="•••••••• (Min 6 chars)"
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

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-mute mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-mute">
              <KeyRound size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink placeholder:text-mute focus:outline-none focus:border-hairline-strong focus:ring-1 focus:ring-hairline-strong transition-all h-[40px]"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-on-primary rounded-full hover:opacity-90 active:scale-[0.98] transition-all font-medium text-sm h-[40px] cursor-pointer mt-2"
        >
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-hairline text-center text-sm text-body">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-medium text-link hover:text-link-deep transition-colors"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
