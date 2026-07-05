import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-md p-8 bg-canvas border border-hairline rounded-lg shadow-level-4 transition-all duration-300">
      <div className="mb-6">
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-mute hover:text-ink transition-colors mb-6 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Login
        </a>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Reset password.
        </h2>
        <p className="mt-2 text-sm text-body">
          {success
            ? 'Check your inbox for further instructions.'
            : "Enter your email address and we'll simulate sending you a recovery link."}
        </p>
      </div>

      {success ? (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 bg-link-bg-soft text-link-deep rounded-sm border border-link-bg-soft text-sm leading-relaxed">
            We have sent a simulated password reset link to <strong className="font-semibold">{email}</strong>.
            In a production app, this link would expire in 24 hours.
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            className="w-full py-2 px-4 border border-hairline rounded-full text-ink hover:bg-canvas-soft-2 font-medium text-sm h-[40px] transition-colors cursor-pointer"
          >
            Send another link
          </button>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-on-primary rounded-full hover:opacity-90 active:scale-[0.98] transition-all font-medium text-sm h-[40px] cursor-pointer"
          >
            {loading ? 'Sending link...' : 'Send Recovery Link'}
            {!loading && <Send size={16} />}
          </button>
        </form>
      )}
    </div>
  );
}
