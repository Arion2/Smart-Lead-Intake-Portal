'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

const INDUSTRIES = [
  'Healthcare',
  'Real Estate',
  'Legal',
  'Finance',
  'Professional Services',
  'Other',
];

type FormData = {
  name: string;
  email: string;
  business_name: string;
  industry: string;
  help_text: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

export default function HomePage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    business_name: '',
    industry: '',
    help_text: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [aiResult, setAiResult] = useState<{ summary: string; category: string } | null>(null);

  function validate(): boolean {
    const newErrors: FieldErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.business_name.trim()) newErrors.business_name = 'Business name is required';
    if (!form.industry) newErrors.industry = 'Please select an industry';
    if (!form.help_text.trim()) {
      newErrors.help_text = 'Please tell us what you need help with';
    } else if (form.help_text.trim().length < 20) {
      newErrors.help_text = 'Please provide a bit more detail (at least 20 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Something went wrong.');
      } else {
        setAiResult({ summary: data.lead.ai_summary, category: data.lead.ai_category });
        setSubmitted(true);
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  if (submitted && aiResult) {
    return (
      <div className="noise-bg min-h-screen flex items-center justify-center p-6">
        <div
          className="animate-fade-up max-w-lg w-full"
          style={{
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: '16px',
            padding: '48px 40px',
            textAlign: 'center',
          }}
        >
          <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
            <CheckCircle
              size={48}
              style={{ color: 'var(--success)', margin: '0 auto 16px' }}
            />
          </div>
          <h2
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'var(--ink)',
            }}
          >
            We&rsquo;ve received your request
          </h2>
          <p
            className="animate-fade-up delay-200"
            style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: 1.6 }}
          >
            Our team will review your submission and reach out shortly. Here&rsquo;s
            what our AI picked up:
          </p>

          <div
            className="animate-fade-up delay-300"
            style={{
              background: 'var(--cream)',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              padding: '20px 24px',
              textAlign: 'left',
              marginBottom: '32px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>
                Category
              </span>
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: '500',
                  letterSpacing: '0.05em',
                }}
              >
                {aiResult.category}
              </span>
            </div>
            <div>
              <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>
                Summary
              </span>
              <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.5 }}>
                {aiResult.summary}
              </p>
            </div>
          </div>

          <div className="animate-fade-up delay-400" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setSubmitted(false);
                setAiResult(null);
                setForm({ name: '', email: '', business_name: '', industry: '', help_text: '' });
              }}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1.5px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted)',
                transition: 'all 0.2s',
              }}
            >
              Submit another
            </button>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'var(--ink)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'opacity 0.2s',
              }}
            >
              View Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="noise-bg min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'white',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                background: 'var(--accent)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>L</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: '700',
                color: 'var(--ink)',
              }}
            >
              LeadPortal
            </span>
          </div>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--muted)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'color 0.2s',
            }}
          >
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '48px' }}>
          <p
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '16px',
            }}
          >
            New Inquiry
          </p>
          <h1
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '700',
              lineHeight: 1.15,
              color: 'var(--ink)',
              marginBottom: '16px',
            }}
          >
            Tell us what you
            <br />
            need help with
          </h1>
          <p
            className="animate-fade-up delay-200"
            style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.7 }}
          >
            Fill in the form below and we&rsquo;ll be in touch. Our AI will instantly
            categorize your request so the right team member can respond faster.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up delay-300"
          style={{
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            padding: '36px',
          }}
          noValidate
        >
          {/* Row: Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label className="field-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className={`field-input ${errors.name ? 'error' : ''}`}
                autoComplete="name"
              />
              {errors.name && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className={`field-input ${errors.email ? 'error' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Row: Business + Industry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label className="field-label" htmlFor="business_name">Business Name</label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                value={form.business_name}
                onChange={handleChange}
                placeholder="Acme Corp"
                className={`field-input ${errors.business_name ? 'error' : ''}`}
                autoComplete="organization"
              />
              {errors.business_name && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.business_name}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className={`field-input ${errors.industry ? 'error' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              {errors.industry && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.industry}
                </p>
              )}
            </div>
          </div>

          {/* Help text */}
          <div style={{ marginBottom: '28px' }}>
            <label className="field-label" htmlFor="help_text">What do you need help with?</label>
            <textarea
              id="help_text"
              name="help_text"
              value={form.help_text}
              onChange={handleChange}
              placeholder="Describe your project, challenge, or goal. The more detail you share, the better we can help…"
              rows={5}
              className={`field-input ${errors.help_text ? 'error' : ''}`}
              style={{ resize: 'vertical', minHeight: '120px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '6px' }}>
              {errors.help_text ? (
                <p style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.help_text}
                </p>
              ) : (
                <span />
              )}
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {form.help_text.length} chars
              </span>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              style={{
                background: 'var(--accent-light)',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent)',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={16} />
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '15px 24px',
              background: submitting ? '#999' : 'var(--ink)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s, transform 0.1s',
            }}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Analyzing your request…
              </>
            ) : (
              <>
                Submit Request
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted)' }}>
            Your information is kept private and never shared with third parties.
          </p>
        </form>
      </main>
    </div>
  );
}
