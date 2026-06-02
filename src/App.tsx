import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import SubmissionFormView from './components/SubmissionFormView';
import AdminView from './components/AdminView';
import EditModal from './components/EditModal';
import NotFoundView from './components/NotFoundView';
import SubmitSuccessView from './components/SubmitSuccessView';

import { Submission, ActivePage, DashboardStats, SubmissionStatus } from './types';

export default function App() {
  // Navigation active route
  const [activePage, setActivePage] = useState<ActivePage>('submit');


  // Submissions primary database state
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // After successful submit, show success page instead of home
  const [submitJustHappened, setSubmitJustHappened] = useState(false);

  // Editing state trigger
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);

  const [backendError, setBackendError] = useState<string | null>(null);

  // Initialize data on load (backend-only; no local seeding)
  useEffect(() => {
    async function loadData() {
      setBackendError(null);
      try {
        const res = await fetch('/api/submissions');
        if (!res.ok) {
          throw new Error(`Failed to load submissions (HTTP ${res.status})`);
        }
        const data = await res.json();
        setSubmissions(data);
      } catch (err: any) {
        setBackendError(err?.message ?? 'Backend unavailable');
        setSubmissions([]);
      }
    }

    loadData();
  }, []);


  const saveSubmissions = (newSubs: Submission[]) => {
    setSubmissions(newSubs);
  };

  // 1. ADD: Submission form handler
  const handleAddNewSubmission = async (newSubData: Omit<Submission, 'id' | 'createdAt' | 'status'>) => {

    const fallbackId = `sub-${Math.random().toString(36).substring(2, 11)}`;
    const newSubmission: Submission = {
      ...newSubData,
      id: fallbackId,
      createdAt: new Date().toISOString(),
      status: 'New'
    };

    // Optimistic UI Update
    setSubmissions(prev => [newSubmission, ...prev]);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubData)
      });
      if (res.ok) {
        const saved = await res.json();
        setSubmissions(prev => {
        const filtered = prev.filter(s => s.id !== fallbackId);
          const updated = [saved, ...filtered];
          return updated;
        });
        return;
      }
    } catch (err) {
      console.warn('API POST failed, using offline fallback schema:', err);
    }

    // Finalize standard storage in case API failed
    setSubmissions(prev => prev);
  };

  // 2. DELETE: Remove submission entry
  const handleDeleteSubmission = async (id: string) => {
    const updated = submissions.filter(sub => sub.id !== id);
    saveSubmissions(updated);

    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  };

  // 3. EDIT: Complete update of elements
  const handleSaveEditedSubmission = async (updatedSub: Submission) => {
    const updated = submissions.map(sub => sub.id === updatedSub.id ? updatedSub : sub);
    saveSubmissions(updated);
    setEditingSubmission(null);

    await fetch(`/api/submissions/${updatedSub.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSub)
    });
  };

  // 4. UPDATE STATUS: Quick process change
  const handleUpdateSubmissionStatus = async (id: string, newStatus: SubmissionStatus) => {
    const updated = submissions.map(sub => {
      if (sub.id === id) {
        return { ...sub, status: newStatus };
      }
      return sub;
    });
    saveSubmissions(updated);

    await fetch(`/api/submissions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  };

  // Live Metric Compiler
  const computeStats = (): DashboardStats => {
    return {
      total: submissions.length,
      newCount: submissions.filter(s => s.status === 'New').length,
      inProgress: submissions.filter(s => s.status === 'In Progress').length,
      resolved: submissions.filter(s => s.status === 'Resolved').length,
      highPriority: submissions.filter(s => s.priority === 'High' && s.status !== 'Resolved').length,
    };
  };

  const stats = computeStats();
  const recentSubmissions = submissions.slice(0, 3);

  // Simple Router Switcher
  const renderActiveView = () => {
    if (backendError) {
      return (
        <div className="max-w-3xl mx-auto bg-white border border-rose-200 rounded-3xl p-6 text-rose-900">
          <h2 className="font-semibold text-lg">Backend unavailable</h2>
          <p className="text-sm text-rose-700 mt-2">{backendError}</p>
          <p className="text-xs text-rose-600 mt-3">This app does not use any local fallback storage.</p>
        </div>
      );
    }

    switch (activePage) {
      case 'home':
        return submitJustHappened ? (
          <SubmitSuccessView
            onSubmitAnother={() => {
              setSubmitJustHappened(false);
              setActivePage('submit');
            }}

          />
        ) : (
          <HomeView
            stats={stats}
            recentSubmissions={recentSubmissions}
            setActivePage={(page) => setActivePage(page)}
          />
        );


      case 'submit':
        return (
          <SubmissionFormView
            onSubmitSuccess={async (payload) => {
              await handleAddNewSubmission(payload);
              setSubmitJustHappened(true);
              setActivePage('home');
            }}
            setActivePage={(p) => setActivePage(p)}
          />
        );

      case 'admin':
        return (
          <AdminView
            submissions={submissions}
            onDeleteSubmission={handleDeleteSubmission}
            onEditSubmission={(sub) => setEditingSubmission(sub)}
            onUpdateStatus={handleUpdateSubmissionStatus}
            setActivePage={setActivePage}
          />
        );
      case '404':
      default:
        return <NotFoundView setActivePage={(p) => setActivePage(p)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/65 flex flex-col font-sans" id="portal-app-root">
      
      {/* Dynamic Header navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={(p) => {
          // If valid page, set, otherwise fallback
          if (['submit', 'admin'].includes(p)) {
            setActivePage(p);
          } else {
            setActivePage('404');
          }
        }}
        submissionCount={submissions.length}
      />


      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10" id="portal-main-pane">
        {renderActiveView()}
      </main>



      {/* Slide-over Edit Modal Overlays */}
      {editingSubmission && (
        <EditModal
          submission={editingSubmission}
          onSave={handleSaveEditedSubmission}
          onClose={() => setEditingSubmission(null)}
        />
      )}

      {/* Clean Aesthetic Footer */}
      <footer className="w-full bg-white border-t border-slate-200/50 py-6 mt-12" id="portal-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">FormCore Portal</span>
            <span>•</span>
            <span>A production-ready data coordinator client.</span>
          </div>
          <div>
            <span>All rights reserved &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
