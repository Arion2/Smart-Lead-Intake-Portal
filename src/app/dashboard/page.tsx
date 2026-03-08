'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  User,
  Building2,
  Mail,
  Calendar,
  SlidersHorizontal,
  Inbox,
  Download,
  CheckCircle2,
  Circle,
  TrendingUp,
  Users,
  Tag,
  Clock,
} from 'lucide-react';
import type { Lead } from '@/lib/supabase';

const ALL_CATEGORIES = [
  'All',
  'Automation',
  'Website',
  'AI Integration',
  'SEO',
  'Custom Software',
  'Other',
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Automation:        { bg: '#e8f0fe', text: '#3c5fd6' },
  Website:           { bg: '#fce8e6', text: '#c0392b' },
  'AI Integration':  { bg: '#e6f4ea', text: '#1e7e34' },
  SEO:               { bg: '#fff3e0', text: '#e65100' },
  'Custom Software': { bg: '#f3e5f5', text: '#7b1fa2' },
  Other:             { bg: '#f1f3f4', text: '#5f6368' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-mono)',
        background: colors.bg,
        color: colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      {category}
    </span>
  );
}

function StatsBar({ allLeads }: { allLeads: Lead[] }) {
  const total = allLeads.length;
  const reviewed = allLeads.filter((l) => l.reviewed).length;
  const pending = total - reviewed;

  const counts: Record<string, number> = {};
  allLeads.forEach((l) => { counts[l.ai_category] = (counts[l.ai_category] ?? 0) + 1; });
  const topCategory = total > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    : '—';

  const latest = total > 0
    ? formatDateShort(
        allLeads.slice().sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0].created_at
      )
    : '—';

  const stats = [
    { icon: <Users size={16} />, label: 'Total Leads', value: String(total) },
    { icon: <Clock size={16} />, label: 'Pending Review', value: String(pending) },
    { icon: <CheckCircle2 size={16} />, label: 'Reviewed', value: String(reviewed) },
    { icon: <Tag size={16} />, label: 'Top Category', value: topCategory },
    { icon: <TrendingUp size={16} />, label: 'Latest Submission', value: latest },
  ];

  return (
    <div
      className="animate-fade-up delay-100"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--muted)',
              marginBottom: '8px',
            }}
          >
            {s.icon}
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              {s.label}
            </span>
          </div>
          <p
            style={{
              fontSize: '22px',
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              color: 'var(--ink)',
              lineHeight: 1,
            }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function LeadCard({
  lead,
  index,
  onToggleReviewed,
}: {
  lead: Lead;
  index: number;
  onToggleReviewed: (id: string, reviewed: boolean) => void;
}) {
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: !lead.reviewed }),
      });
      if (res.ok) onToggleReviewed(lead.id, !lead.reviwed);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${index * 60}ms`,
        background: lead.reviewed ? '#fafaf8' : 'white',
        border: `1.5px solid ${lead.reviewed ? '#e0ddd8' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '24px',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        opacity: lead.reviewed ? 0.8 : 1,
      }}
      onMouseEnter={(e) => {
        if (!lead.reviewed) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#c8b8b0';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = lead.reviewed ? '#e0ddd8' : 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <User size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--ink)' }}>
              {lead.name}
            </span>
            {lead.reviewed && (
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--success)',
                  background: 'var(--success-light)',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontWeight: '600',
                }}
              >
                Reviewed
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Building2 size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{lead.business_name}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{lead.industry}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <a href={`mailto:${lead.email}`} style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
              {lead.email}
            </a>
          </div>
        </div>
        <CategoryBadge category={lead.ai_category} />
      </div>

      {/* AI Summaries */}
      <div
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '12px 14px',
          marginBottom: '14px',
        }}
      >
        <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
          AI Summary
        </p>
        <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>{lead.ai_summary}</p>
      </div>

      {/* Full request */}
      <details style={{ marginBottom: '14px' }}>
        <summary style={{ fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', userSelect: 'none', fontWeight: '500', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>▸</span> View full request
        </summary>
        <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6, paddingLeft: '16px', borderLeft: '2px solid var(--border)' }}>
          {lead.help_text}
        </p>
      </details>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={12} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {formatDate(lead.created_at)}
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: `1px solid ${lead.reviewed ? '#b8ddc8' : 'var(--border)'}`,
            background: lead.reviewed ? 'var(--success-light)' : 'transparent',
            color: lead.reviewed ? 'var(--success)' : 'var(--muted)',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: 'var(--font-body)',
            cursor: toggling ? 'wait' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {lead.reviewed ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {lead.reviewed ? 'Reviewed' : 'Mark reviewed'}
        </button>
      </div>
    </div>
  );
}

function exportToCSV(leads: Lead[]) {
  const headers = ['Name', 'Email', 'Business Name', 'Industry', 'AI Category', 'AI Summary', 'What they need help with', 'Reviewed', 'Submitted At'];
  const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [
    escape(l.name), escape(l.email), escape(l.business_name), escape(l.industry),
    escape(l.ai_category), escape(l.ai_summary), escape(l.help_text),
    l.reviewed ? 'Yes' : 'No', escape(new Date(l.created_at).toLocaleString()),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAllLeads(data.leads);
    } catch (e) {
      setError('Failed to load leads. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    setLeads(activeCategory === 'All' ? allLeads : allLeads.filter((l) => l.ai_category === activeCategory));
  }, [activeCategory, allLeads]);

  function handleToggleReviewed(id: string, reviewed: boolean) {
    setAllLeads((prev) => prev.map((l) => (l.id === id ? { ...l, reviewed } : l)));
  }

  return (
    <div className="noise-bg min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'white', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>L</span>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: 'var(--ink)' }}>Dashboard</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => exportToCSV(leads)}
              disabled={leads.length === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                background: leads.length > 0 ? 'var(--ink)' : 'transparent',
                border: `1.5px solid ${leads.length > 0 ? 'var(--ink)' : 'var(--border)'}`,
                borderRadius: '6px', cursor: leads.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '13px', fontFamily: 'var(--font-body)',
                color: leads.length > 0 ? 'white' : 'var(--muted)',
                transition: 'all 0.2s', opacity: leads.length === 0 ? 0.5 : 1,
              }}
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={() => fetchLeads(true)}
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                background: 'transparent', border: '1.5px solid var(--border)', borderRadius: '6px',
                cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)',
                color: 'var(--muted)', transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>
            Lead Submissions
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            {loading ? 'Loading…' : `${leads.length} submission${leads.length !== 1 ? 's' : ''}${activeCategory !== 'All' ? ` in ${activeCategory}` : ' total'}`}
          </p>
        </div>

        {!loading && allLeads.length > 0 && <StatsBar allLeads={allLeads} />}

        {/* Filter bar */}
        <div className="animate-fade-up delay-200" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--muted)', marginRight: '4px' }} />
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const colors = cat !== 'All' ? CATEGORY_COLORS[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: '20px',
                  border: isActive ? '1.5px solid transparent' : '1.5px solid var(--border)',
                  background: isActive ? (colors ? colors.bg : 'var(--ink)') : 'white',
                  color: isActive ? (colors ? colors.text : 'white') : 'var(--muted)',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  fontWeight: isActive ? '600' : '400', cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading leads…</p>
          </div>
        ) : error ? (
          <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '20px 24px', color: 'var(--accent)', fontSize: '15px' }}>
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px', color: 'var(--muted)' }}>
            <Inbox size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: '500' }}>No submissions yet</p>
            <p style={{ fontSize: '14px' }}>{activeCategory !== 'All' ? `No leads found in "${activeCategory}".` : 'Submit the first lead using the intake form.'}</p>
            <Link href="/" style={{ marginTop: '8px', padding: '10px 20px', background: 'var(--ink)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Go to intake form
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {leads.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} onToggleReviewed={handleToggleReviewed} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
