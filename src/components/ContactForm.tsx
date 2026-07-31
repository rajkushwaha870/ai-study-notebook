import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');

    // Simulate clean form submission
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'general', message: '' });
    }, 800);
  };

  return (
    <div className="bg-canvas border border-hairline rounded-xl p-6 sm:p-8 shadow-level-2 select-none">
      <h2 className="text-xl font-semibold text-ink tracking-tight mb-1">
        Send us a message
      </h2>
      <p className="text-xs text-mute mb-6">
        Fill out the form below and our team will get back to you within 24 hours.
      </p>

      {status === 'success' ? (
        <div className="p-6 bg-canvas-soft border border-hairline rounded-lg text-center space-y-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base font-semibold text-ink">Message Sent Successfully!</h3>
          <p className="text-xs text-body leading-relaxed max-w-sm mx-auto">
            Thank you for reaching out. We have received your message and sent a confirmation to your email.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 text-xs font-semibold text-link hover:underline cursor-pointer"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="p-3 bg-error-soft/30 border border-error/20 text-error text-xs rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5 font-mono">
                Your Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3 py-2 text-xs bg-canvas-soft border border-hairline focus:border-hairline-strong rounded-md outline-none transition-colors text-ink placeholder:text-mute"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5 font-mono">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 text-xs bg-canvas-soft border border-hairline focus:border-hairline-strong rounded-md outline-none transition-colors text-ink placeholder:text-mute"
                required
              />
            </div>
          </div>

          {/* Subject Topic */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5 font-mono">
              Inquiry Topic
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-canvas-soft border border-hairline focus:border-hairline-strong rounded-md outline-none transition-colors text-ink cursor-pointer"
            >
              <option value="general">General Support & Feedback</option>
              <option value="bug">Report a Bug / Issue</option>
              <option value="feature">Feature Request</option>
              <option value="privacy">Privacy & Data Security</option>
              <option value="business">Partnerships & Academic Plans</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5 font-mono">
              Your Message <span className="text-error">*</span>
            </label>
            <textarea
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="How can we help you with AI NoteBook?"
              className="w-full px-3 py-2 text-xs bg-canvas-soft border border-hairline focus:border-hairline-strong rounded-md outline-none transition-colors text-ink placeholder:text-mute resize-y"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-md font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-level-2 disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <span>Sending Message...</span>
            ) : (
              <>
                <span>Send Message</span>
                <Send size={14} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
