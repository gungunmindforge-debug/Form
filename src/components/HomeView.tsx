/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Inbox, Users2, ShieldCheck } from 'lucide-react';
import { Submission, ActivePage, DashboardStats } from '../types';

interface HomeViewProps {
  stats: DashboardStats;
  recentSubmissions: Submission[];
  setActivePage: (page: ActivePage) => void;
}

export default function HomeView({ stats, recentSubmissions, setActivePage }: HomeViewProps) {
  return (
    <div className="space-y-10 animate-slide-up" id="home-view-container">


      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-md" id="home-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(51,65,85,0.4),rgba(15,23,42,0))] pointer-events-none" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold tracking-wide border border-slate-700/50">
            <Sparkles size={12} className="text-yellow-400 fill-yellow-400" />
            <span>Secure Enterprise Data Hub</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-tight" id="hero-title">
            Streamlined request collection & ticket coordination.
          </h1>
          <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed max-w-2xl" id="hero-desc">
            Submit priority service requests, technical tickets, support updates, and secure inquiries. Inspect status tracking, filtered search, and perform administrative overrides instantly in the management dashboard.
          </p>
          <div className="pt-4 flex flex-wrap gap-4" id="hero-actions">
            <button
              id="cta-home-submit"
              onClick={() => setActivePage('submit')}
              className="flex items-center justify-center px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors shadow-sm duration-200 group text-sm"
            >
              Submit New Request
              <ArrowRight size={16} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              id="cta-home-admin"
              onClick={() => setActivePage('admin')}
              className="flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-medium hover:bg-slate-750 hover:text-white transition-colors border border-slate-700/60 text-sm"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </section>


      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" id="stats-section">

        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/65 shadow-xs flex flex-col justify-between" id="stat-total">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Requests</span>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-semibold text-slate-900 font-display">{stats.total}</span>
            <span className="ml-2 text-xs text-slate-400">submitted</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>


        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/65 shadow-xs flex flex-col justify-between" id="stat-new">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">New Tickets</span>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-semibold text-amber-600 font-display">{stats.newCount}</span>
            <span className="ml-2 text-xs text-slate-400">unresolved</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.total > 0 ? (stats.newCount / stats.total) * 105 : 0}%` }} 
            />
          </div>
        </div>


        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/65 shadow-xs flex flex-col justify-between" id="stat-progress">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">In Progress</span>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-semibold text-indigo-600 font-display">{stats.inProgress}</span>
            <span className="ml-2 text-xs text-slate-400">active</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>


        <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-slate-200/65 shadow-xs flex flex-col justify-between" id="stat-resolved">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Resolved</span>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-semibold text-emerald-600 font-display">{stats.resolved}</span>
            <span className="ml-2 text-xs text-slate-400">addressed</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>


        <div className="lg:col-span-1 p-6 rounded-2xl bg-rose-50 border border-rose-200/60 shadow-xs flex flex-col justify-between relative overflow-hidden" id="stat-high-priority">
          <span className="text-xs uppercase tracking-wider font-semibold text-rose-500">Urgent Tickets</span>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-semibold text-rose-700 font-display">{stats.highPriority}</span>
            {stats.highPriority > 0 && (
              <span className="ml-2.5 relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
            )}
            <span className="ml-2 text-xs text-rose-500">immediate focus</span>
          </div>
          <div className="mt-4 h-1 w-full bg-rose-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-650 rounded-full transition-all duration-500" 
              style={{ width: `${stats.total > 0 ? (stats.highPriority / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>
      </section>


      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="primary-features">
        

        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between bg-slate-50 p-6 rounded-2xl border border-slate-200/50" id="guide-column">
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center">
              <ShieldCheck size={18} className="mr-2 text-indigo-500 stroke-[2.25]" />
              Submission Guidelines
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              FormCore manages request intake with strict validations to safeguard resolution response times. Keep requests concise.
            </p>
            
            <div className="space-y-4 pt-1">
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-800 border border-slate-200">1</div>
                <div>
                  <h4 className="text-sm font-medium text-slate-905">Detail Specifics</h4>
                  <p className="text-xs text-slate-450 mt-0.5">State your email, phone, and describe the request clearly in the form.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-800 border border-slate-200">2</div>
                <div>
                  <h4 className="text-sm font-medium text-slate-905">Automatic Tracking</h4>
                  <p className="text-xs text-slate-450 mt-0.5">Tickets are instantly categorized and assigned a 'New' state upon submission.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-800 border border-slate-200">3</div>
                <div>
                  <h4 className="text-sm font-medium text-slate-905">Admin Actions</h4>
                  <p className="text-xs text-slate-450 mt-0.5">Authorized delegates can update the status, edit properties or trigger deletion safely.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/60">
            <div className="rounded-xl bg-white p-4 border border-slate-200/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-105 rounded-lg text-slate-900">
                  <Inbox size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Storage Status</h4>
                  <p className="text-xs text-slate-800 font-medium">Local Client Sync: Active</p>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/65 p-6 space-y-6 flex flex-col justify-between" id="recent-feed-column">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900">Recent Intake Queue</h3>
                <p className="text-xs text-slate-450 mt-0.5">The latest submissions added to local storage</p>
              </div>
              <button
                id="view-all-submissions"
                onClick={() => setActivePage('admin')}
                className="text-xs font-semibold text-indigo-650 hover:text-indigo-800 flex items-center transition-colors px-2.5 py-1 rounded-md hover:bg-slate-50"
              >
                View Admin Panel
                <ArrowRight size={12} className="ml-1" />
              </button>
            </div>

            {recentSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50" id="no-recent-submissions-empty animate-pulse">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 text-slate-400 mb-3">
                  <FileText size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No submissions discovered</h4>
                <p className="text-xs text-slate-450 max-w-xs mt-1">There are currently no request records stored under this workspace sessions.</p>
                <button
                  id="empty-cta-submit"
                  onClick={() => setActivePage('submit')}
                  className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Create First Submission
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100" id="recent-submissions-list">
                {recentSubmissions.map((sub) => {
                  const priorityColors = {
                    Low: 'bg-slate-100 text-slate-700',
                    Medium: 'bg-blue-50 text-blue-700 border-blue-100',
                    High: 'bg-rose-50 text-rose-700 border-rose-100',
                  };

                  const statusColors = {
                    'New': 'bg-amber-100 text-amber-800',
                    'In Progress': 'bg-indigo-100 text-indigo-800',
                    'Resolved': 'bg-emerald-100 text-emerald-800',
                    'Archived': 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <div key={sub.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between space-x-4 hover:bg-slate-50/40 rounded-lg px-2 transition-colors">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2 text-xs">
                          <span className="font-semibold text-slate-900 truncate max-w-[150px]">{sub.name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-mono text-[10px] bg-slate-100/60 px-1.5 py-0.5 rounded">{sub.category}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">{new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-800 truncate">{sub.subject}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{sub.description}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[sub.status]}`}>
                          {sub.status}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-md ${priorityColors[sub.priority]}`}>
                          {sub.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <span>Powered by dynamic React State routing & localStorage.</span>
            <span className="font-mono text-[10px] text-slate-500">{recentSubmissions.length} active logs</span>
          </div>
        </div>
      </section> 
    </div>
  );
}
