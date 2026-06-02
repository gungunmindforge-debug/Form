/**
 * @license
 * SPDX-Licenseba-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search, Filter, ArrowUpDown, ChevronUp, ChevronDown, Edit3, Trash2,
  Eye, Download, RefreshCcw, ClipboardList, CheckCircle2, AlertTriangle, AlertCircle, Calendar, Lock, Unlock,
  Database, Copy, Check, ExternalLink, Sparkles, Server
} from 'lucide-react';
import { Submission, SubmissionStatus, SubmissionPriority, SubmissionCategory, SortField, SortOrder, FilterState } from '../types';
import AdminGate from './AdminGate';

interface AdminViewProps {
  submissions: Submission[];
  onDeleteSubmission: (id: string) => void;
  onEditSubmission: (sub: Submission) => void;
  onUpdateStatus: (id: string, status: SubmissionStatus) => void;
  setActivePage: (page: 'home' | 'submit' | 'admin' | '404') => void;
}

export default function AdminView({ submissions, onDeleteSubmission, onEditSubmission, onUpdateStatus, setActivePage }: AdminViewProps) {
  // Session Access Gate check
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('formcore_admin_authorized') === 'true';
    } catch {
      return false;
    }
  });

  // Supabase Live Sync Monitor State
  const supabaseConfig = {
    isConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
    hasAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
  };
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Filters & sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Single submission modal inspect view
  const [activeInspectNode, setActiveInspectNode] = useState<Submission | null>(null);

  // Deletion confirm modal storage
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const categories: string[] = ['All', 'Technical Support', 'Billing', 'Feedback', 'Security', 'Partnerships'];
  const priorities: string[] = ['All', 'Low', 'Medium', 'High'];
  const statuses: string[] = ['All', 'New', 'In Progress', 'Resolved', 'Archived'];

  const handleUnlock = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem('formcore_admin_authorized', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('formcore_admin_authorized');
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for sorting toggling
  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to newest/desc on switch
    }
  };

  // Safe delete executor
  const triggerDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteSubmission(pendingDeleteId);
      setPendingDeleteId(null);
      if (activeInspectNode?.id === pendingDeleteId) {
        setActiveInspectNode(null);
      }
    }
  };

  // Priority mapping weights for advanced sorting
  const priorityWeight = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  // Status order weighting for sorting
  const statusWeight = {
    New: 1,
    'In Progress': 2,
    Resolved: 3,
    Archived: 4,
  };

  // Clean data export downloader (XLSX)
  const handleExportXLSX = async () => {
    console.log('[AdminView] Export XLSX clicked');
    // Export only the fields requested: name, contact, email, subject
    // Map "contact" => submission.phone
    const rows = [
      ['Name', 'Contact', 'Email', 'Subject'],
      ...sortedSubmissions.map((sub) => [sub.name, sub.phone, sub.email, sub.subject]),
    ];

    // Import xlsx (ESM-friendly for Vite)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mod = await import('xlsx');
    const XLSX = (mod as any).default ?? mod;



    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

    const fileName = `formcore_submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear query resets
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
  };

  // Filter application pipeline
  const filteredSubmissions = submissions.filter((sub) => {
    // 1. Live text search match (against name, phone, email, subject, description)
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      sub.name.toLowerCase().includes(q) ||
      sub.phone.toLowerCase().includes(q) ||
      sub.email.toLowerCase().includes(q) ||
      sub.subject.toLowerCase().includes(q) ||
      sub.description.toLowerCase().includes(q) ||
      sub.id.toLowerCase().includes(q);

    // 2. Select filter matches (no category filter now)
    const matchesCategory = true;

    // Logged date dropdown mapping using existing priorityFilter state
    // All => no restriction
    // Low => last 7 days, Medium => this month, High => older than 30 days
    const now = Date.now();
    const createdAtMs = new Date(sub.createdAt).getTime();
    const daysOld = (now - createdAtMs) / (1000 * 60 * 60 * 24);

    const matchesPriority =
      priorityFilter === 'All' ||
      (priorityFilter === 'Low' && daysOld <= 7) ||
      (priorityFilter === 'Medium' && createdAtMs >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()) ||
      (priorityFilter === 'High' && daysOld > 30);

    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Sort application pipeline
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let result = 0;

    if (sortField === 'createdAt') {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === 'name') {
      result = a.name.localeCompare(b.name);
    } else if (sortField === 'subject') {
      result = a.subject.localeCompare(b.subject);
    } else if (sortField === 'category') {
      result = a.category.localeCompare(b.category);
    } else if (sortField === 'priority') {
      result = priorityWeight[a.priority] - priorityWeight[b.priority];
    } else if (sortField === 'status') {
      result = statusWeight[a.status] - statusWeight[b.status];
    }

    return sortOrder === 'asc' ? result : -result;
  });

  // Dynamic status pill class helper
  const getStatusPillClass = (status: SubmissionStatus) => {
    switch (status) {
      case 'New': return 'bg-amber-100/70 text-amber-805 border border-amber-200/50';
      case 'In Progress': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'Resolved': return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
      case 'Archived': return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Dynamic priority tag class helper
  const getPriorityTagClass = (prio: SubmissionPriority) => {
    switch (prio) {
      case 'Low': return 'bg-slate-100 text-slate-600';
      case 'Medium': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'High': return 'bg-rose-50 text-rose-800 border border-rose-100/50';
    }
  };

  if (!isUnlocked) {
    return <AdminGate onUnlock={handleUnlock} />;
  }

  return (
    <div className="space-y-6 animate-slide-up" id="admin-workspace-master">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="admin-header-row">
        <div>
          <h2 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center">
            <ClipboardList className="mr-2 text-slate-800" size={24} />
            Submission Logs Coordination
          </h2>
          <p className="text-xs text-slate-450 mt-1">Review validation checks, update live ticket processes or edit system state overrides.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto" id="admin-top-actions">
          <button
				id="admin-export-xlsx-button"
				onClick={handleExportXLSX}
            disabled={submissions.length === 0}
            className="flex-grow md:flex-none flex items-center justify-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download size={14} className="mr-2 text-slate-400" />
            Backup Database as .xlsx
          </button>

          <button
            id="admin-go-home-dashboard"
            onClick={() => setActivePage('home')}
            className="flex-grow md:flex-none flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            title="Go to Home dashboard"
          >
            Home
          </button>

          <button
            id="admin-lock-session"
            onClick={handleLock}
            className="flex-grow md:flex-none flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 border border-slate-250 rounded-xl text-xs font-semibold transition-colors"
          >
            <Lock size={13} className="mr-2 text-slate-450" />
            Lock Portal
          </button>
        </div>
      </div>

      {/* SUPABASE CLOUD INTEGRATION HUB */}
      <section className="bg-white border border-slate-200/65 rounded-2xl p-5 shadow-xs space-y-4" id="supabase-collaboration-hub">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${supabaseConfig?.isConfigured ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              <Database size={18} className={supabaseConfig?.isConfigured ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Cloud Database Sync Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                {supabaseConfig?.isConfigured ? (
                  <>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 relative flex shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                    <span className="text-emerald-700 font-semibold uppercase text-[10px]">Active Integration Mode</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-amber-700 font-semibold uppercase text-[10px]">Local Memory Fallback Mode</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            id="toggle-supabase-manual-cta"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-650 transition-all flex items-center gap-1 shrink-0"
          >
            <Sparkles size={12} className="text-indigo-500" />
            {showSetupGuide ? 'Collapse Setup Guide' : 'Link Your Supabase Database'}
          </button>
        </div>

        
        {!showSetupGuide && (
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-200/40 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
            <div>
              {supabaseConfig?.isConfigured ? (
                <span>
                  Synchronizing records to live host: <strong className="font-mono text-slate-700 select-all">{supabaseConfig.supabaseUrl}</strong>. Database connection is healthy.
                </span>
              ) : (
                <span>
                  The server is currently caching submissions locally in-memory. Resetting the Node service will clear these. Link a database to persist them forever.
                </span>
              )}
            </div>
            {!supabaseConfig?.isConfigured && (
              <button
                id="btn-quick-guide-open"
                onClick={() => setShowSetupGuide(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold shrink-0 transition-opacity hover:opacity-90"
              >
                Show Instructions & SQL Schema &rarr;
              </button>
            )}
          </div>
        )}

        {showSetupGuide && (
          <div className="space-y-4 pt-1 animate-slide-up" id="supabase-setup-guide-wrapper">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-600">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Server size={14} className="text-slate-500" />
                  1. Configure Keys in AI Studio Settings (Secrets)
                </h4>
                <p className="leading-relaxed text-slate-500">
                  To establish a live link, open the <strong>Secrets</strong> panel (or the gear icon settings) in <strong>AI Studio Build</strong> and save these keys:
                </p>
                <div className="space-y-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">SECRET NAME</span>
                    <span className="text-slate-400 font-sans text-[10px]">&larr; RECOMMENDED VALUE &rarr;</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/55">
                    <span className="font-bold text-slate-700">VITE_SUPABASE_URL</span>
                    <span className="text-slate-500 truncate max-w-[200px]" title="e.g. https://xxxxxx.supabase.co">https://yourproject.supabase.co</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-700">VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-slate-500 truncate max-w-[200px]" title="anon key starting with eyJ...">eyJaY29udGVudCI...</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-450 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed">
                  💡 <strong>Safe Client Fallback:</strong> The backend is designed with a self-healing layer. If your table has older/different columns or demands UUIDs, the system auto-heals without throwing exceptions!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Database size={14} className="text-slate-500" />
                    2. Execute the Database SQL Schema
                  </h4>
                  <button
                    id="copy-sql-cta"
                    onClick={() => {
                      const sqlText = `create table submissions (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  category text,
  priority text,
  description text,
  status text default 'New',
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);`;
                      navigator.clipboard.writeText(sqlText);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border transition-all ${
                      copiedSql
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {copiedSql ? <Check size={11} /> : <Copy size={11} />}
                    {copiedSql ? 'Copied' : 'Copy SQL'}
                  </button>
                </div>
                <p className="leading-relaxed text-slate-500">
                  Open the <strong>SQL Editor</strong> in your Supabase dashboard, paste this script, and click <strong>Run</strong>:
                </p>
                <pre className="font-mono text-[10px] bg-slate-900 text-slate-300 p-3.5 rounded-xl overflow-x-auto border border-slate-950 shadow-inner max-h-[160px] leading-relaxed">
{`create table submissions (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  category text,
  priority text,
  description text,
  status text default 'New',
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </section> 

      {/* Filter Options Sector & Search bar */}
      <section className="bg-white border border-slate-200/65 rounded-2xl p-4 space-y-4 shadow-xs" id="admin-filter-console">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Live Text Search input */}
          <div className="space-y-1">
            <label htmlFor="adminSearch" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Search by name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} className="stroke-[2.25]" />
              </span>
              <input
                type="text"
                id="adminSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, email, info..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {/* Logged date (dropdown) */}
          <div className="space-y-1">
            <label htmlFor="loggedDateFilter" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Logged date
            </label>
            <select
              id="loggedDateFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All </option>
              <option value="Low">Recent (Last 7 days)</option>
              <option value="Medium">This month</option>
              <option value="High">Older than 30 days</option>
            </select>
          </div>

          {/* Status SELECT filter */}
          <div className="space-y-1">
            <label htmlFor="statFilter" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Process Status
            </label>
            <select
              id="statFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {statuses.map((stat) => (
                <option key={stat} value={stat}>{stat === 'All' ? 'All Statuses' : stat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filter tags alert if any match is active */}
        {(searchQuery !== '' || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All') && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 animate-fade-in" id="filter-pill-feedback">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-400">Filters Activated:</span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-mono text-[10px]">
                  Text: "{searchQuery}"
                </span>
              )}
              {categoryFilter !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-mono text-[10px]">
                  Category: {categoryFilter}
                </span>
              )}
              {priorityFilter !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-mono text-[10px]">
                  Priority: {priorityFilter}
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-mono text-[10px]">
                  Status: {statusFilter}
                </span>
              )}
            </div>

            <button
              id="clear-all-filters-cta"
              onClick={handleResetFilters}
              className="text-indigo-650 hover:text-indigo-800 font-semibold text-xs flex items-center transition-colors hover:underline"
            >
              <RefreshCcw size={11} className="mr-1" />
              Reset Active Filters
            </button>
          </div>
        )}
      </section>

      {/* Main Table View Component */}
      <div className="bg-white border border-slate-200/65 rounded-2xl overflow-hidden shadow-xs" id="admin-table-deck">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-slate-150 text-left text-xs text-slate-700" id="submission-logs-grid-table">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]" id="admin-table-head">
              <tr>
                <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSortToggle('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Contact Info</span>
                    <ArrowUpDown size={11} className={sortField === 'name' ? 'text-slate-800' : 'text-slate-300'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSortToggle('subject')}>
                  <div className="flex items-center space-x-1">
                    <span>Subject / Ticket Details</span>
                    <ArrowUpDown size={11} className={sortField === 'subject' ? 'text-slate-800' : 'text-slate-300'} />
                  </div>
                </th>

                <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSortToggle('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Process Status</span>
                    <ArrowUpDown size={11} className={sortField === 'status' ? 'text-slate-800' : 'text-slate-300'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSortToggle('createdAt')}>
                  <div className="flex items-center space-x-1">
                    <span>Logged At</span>
                    <ArrowUpDown size={11} className={sortField === 'createdAt' ? 'text-slate-800' : 'text-slate-300'} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100" id="submission-table-body-container">
              {sortedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">

                    <div className="mx-auto flex flex-col items-center justify-center max-w-sm">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 text-slate-400 mb-3 animate-pulse">
                        <Search size={20} />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">No logs match current credentials</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Adjust your active filters or search query selections to discover items.



                      </p>
                      <button
                        id="empty-table-reset-cta"
                        onClick={handleResetFilters}
                        className="mt-4 px-4 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                      >
                        Reset Workspace Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/40 transition-colors" id={`row-item-${sub.id}`}>

                    {/* Contact details cell */}
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">{sub.name}</p>
                        <p className="text-[10px] text-slate-450 font-mono select-all truncate max-w-[160px]">{sub.email}</p>
                        <p className="text-[10px] text-slate-5	00 font-mono truncate">{sub.phone}</p>
                      </div>
                    </td>

                    {/* Subject cell */}
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-800 truncate max-w-[220px]" title={sub.subject}>
                          {sub.subject}
                        </p>
                        <p className="text-[10px] text-slate-450 line-clamp-1 max-w-[220px]" title={sub.description}>
                          {sub.description}
                        </p>
                      </div>
                    </td>



                    {/* Status cell with inline status dropdown */}
                    <td className="px-6 py-4">
                      <select
                        id={`update-status-dropdown-${sub.id}`}
                        value={sub.status}
                        onChange={(e) => onUpdateStatus(sub.id, e.target.value as SubmissionStatus)}
                        className={`text-[11px] font-bold rounded-full px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer ${getStatusPillClass(sub.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>

                    {/* Logged Date cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 flex flex-col justify-center min-h-[64px]">
                      <div className="flex items-center space-x-1">
                        <Calendar size={11} className="text-slate-300" />
                        <span>{new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(sub.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>

                    {/* Action buttons drawer triggers cell */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          id={`btn-inspect-sub-${sub.id}`}
                          onClick={() => setActiveInspectNode(sub)}
                          className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-205 text-slate-700 transition-colors flex items-center text-[10px] font-medium"
                          title="Inspect Details"
                        >
                          <Eye size={12} className="mr-1" />
                          View
                        </button>
                        <button
                          id={`btn-edit-sub-${sub.id}`}
                          onClick={() => onEditSubmission(sub)}
                          className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-205 text-slate-700 transition-colors flex items-center text-[10px] font-medium"
                          title="Edit ticket"
                        >
                          <Edit3 size={12} className="mr-1" />
                          Edit
                        </button>
                        <button
                          id={`btn-delete-sub-${sub.id}`}
                          onClick={() => triggerDelete(sub.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                          title="Delete ticket record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info logs summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-slate-450 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2" id="admin-summary-footer">
          <span>
            Displaying <strong className="text-slate-800">{sortedSubmissions.length}</strong> of <strong className="text-slate-800">{submissions.length}</strong> total submissions stored in local database.
          </span>
          <span className="font-mono text-[10px]">
            Sorted by <strong className="text-slate-700">{sortField}</strong> ({sortOrder})
          </span>
        </div>
      </div>

      {/* MODAL 1: Detail Inspections modal card overlay */}
      {activeInspectNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          id="inspect-overlay-root"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveInspectNode(null);
          }}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 scale-100 transition-transform duration-300 space-y-5"
            id="inspect-card"
            onMouseDown={(e) => e.stopPropagation()}
          >


            {/* Header inspect panel */}
            <div className={`p-6 bg-slate-50 border-b border-slate-100/80 flex items-start justify-between gap-4`}>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-slate-400 bg-white border px-2 py-0.5 rounded-md">ID: {activeInspectNode.id.substring(0, 8)}...</span>
                <h3 className="font-display font-semibold text-lg text-slate-900 mt-2 truncate max-w-[380px]">{activeInspectNode.subject}</h3>
                <p className="text-[11px] text-slate-450 mt-1 flex items-center">
                  <span>Logged under {activeInspectNode.category}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(activeInspectNode.createdAt).toLocaleString()}</span>
                </p>
              </div>
              <button
                id="btn-close-inspect"
                onClick={() => setActiveInspectNode(null)}
                className="p-1 px-2 text-slate-400 hover:text-slate-705 bg-white border border-slate-205 rounded-lg hover:bg-slate-50 transition-colors text-xs"
              >
                Close
              </button>
            </div>

            {/* Main content body in inspect */}
            <div className="p-6 space-y-5 text-sm" id="inspect-panel-content">
              {/* Grid meta specs */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/50 text-xs">
                <div>
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Submitted By</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{activeInspectNode.name}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Urgency / Priority</span>
                  <span className={`inline-block px-2 py-0.5 mt-1 font-bold rounded text-[10px] ${getPriorityTagClass(activeInspectNode.priority)}`}>
                    {activeInspectNode.priority}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Email Coordinates</span>
                  <span className="font-mono text-slate-700 select-all block mt-0.5 truncate">{activeInspectNode.email}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Process State</span>
                  <span className={`inline-block px-2 py-0.5 mt-1 font-bold rounded-full text-[10px] ${getStatusPillClass(activeInspectNode.status)}`}>
                    {activeInspectNode.status}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/50">
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">Contact Phone</span>
                  <span className="font-mono mt-0.5 text-slate-750 block">{activeInspectNode.phone}</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <span className="block font-semibold text-slate-450 text-xs uppercase tracking-wide text-[10px]">Description & Content details:</span>
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/40 text-slate-755 leading-relaxed font-sans text-xs max-h-48 overflow-y-auto whitespace-pre-line select-text">
                  {activeInspectNode.description}
                </div>
              </div>
            </div>

            {/* Action hooks footer in modal */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 -mx-6 -mb-6">
              <button
                id="btn-inspect-sub-delete"
                onClick={() => {
                  triggerDelete(activeInspectNode.id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-semibold"
              >
                Delete Log Record
              </button>

              <div className="flex space-x-2">
                <button
                  id="btn-inspect-sub-edit"
                  onClick={() => {
                    onEditSubmission(activeInspectNode);
                    setActiveInspectNode(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-905 text-slate-900 border border-slate-250 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold"
                >
                  Edit Specifications
                </button>
                <button
                  id="btn-inspect-sub-close"
                  onClick={() => setActiveInspectNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
                >
                  Dismiss Drawer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Safely Delete confirm overlay modal */}
      {pendingDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
          id="delete-overlay-root"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPendingDeleteId(null);
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-center scale-100 transition-transform"
            onMouseDown={(e) => e.stopPropagation()}
          >

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle size={24} className="text-rose-550" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display font-semibold text-base text-slate-900">Execute Irreversible Deletion?</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                This action is structurally permanent and cannot be undone. All database and local storage logs for this request ID will be deleted.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                id="btn-delete-cancel"
                onClick={() => setPendingDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel / Retain Log
              </button>
              <button
                id="btn-delete-confirm"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Destroy Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

