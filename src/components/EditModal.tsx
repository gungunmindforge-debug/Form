/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Submission, SubmissionCategory, SubmissionPriority, SubmissionStatus } from '../types';


interface EditModalProps {
  submission: Submission;
  onSave: (updated: Submission) => void;
  onClose: () => void;
}

export default function EditModal({ submission, onSave, onClose }: EditModalProps) {
  // Input tracking states loaded with existing values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SubmissionCategory>('Technical Support');
  const [priority, setPriority] = useState<SubmissionPriority>('Medium');
  const [status, setStatus] = useState<SubmissionStatus>('New');
  const [description, setDescription] = useState('');

  // Local errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    description?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);

  // Sync inputs with incoming node
  useEffect(() => {
    if (submission) {
      setName(submission.name);
      setEmail(submission.email);
      setPhone(submission.phone);
      setSubject(submission.subject);
      setCategory(submission.category);
      setPriority(submission.priority);
      setStatus(submission.status);
      setDescription(submission.description);
      setErrors({});
    }
  }, [submission]);

  const categories: SubmissionCategory[] = [
    'Technical Support',
    'Billing',
    'Feedback',
    'Security',
    'Partnerships',
  ];

  const priorities: SubmissionPriority[] = ['Low', 'Medium', 'High'];
  const statuses: SubmissionStatus[] = ['New', 'In Progress', 'Resolved', 'Archived'];

  // Email format checks
  const validateEmail = (mail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail.trim());
  };

  // Phone validator helper
  const validatePhone = (num: string) => {
    const phoneRegex = /^(\+?\d{1,4}?[-.\s]?)?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(num.trim());
  };

  const handleInputValidation = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name cannot be blank.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email connection cannot be blank.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone coordinate cannot be blank.';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please provide a valid phone format.';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject summary is required.';
    } else if (subject.trim().length < 4) {
      newErrors.subject = 'Subject must be at least 4 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Detailed description is required.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleInputValidation()) {
      return;
    }

    setIsSaving(true);

    // Simulate reliable state transmission
    setTimeout(() => {
      onSave({
        ...submission,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subject: subject.trim(),
        category,
        priority,
        status,
        description: description.trim(),
      });
      setIsSaving(false);
    }, 400);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
      id="edit-overlay-root"
      onMouseDown={(e) => {
        // Close only when user clicks the backdrop (not when selecting inside the modal)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-205 flex flex-col max-h-[90vh] scale-100 transition-transform"
        id="edit-modal-card"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        
        {/* Modal Header */}

        <div className="p-5 bg-slate-50 border-b border-slate-100/90 flex items-center justify-between" id="edit-header-panel">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-slate-400 bg-white border px-2 py-0.5 rounded-md">ID: {submission.id}</span>
            <h3 className="font-display font-semibold text-base text-slate-900 mt-1">Override Ticket Specifications</h3>
          </div>
          <button
            id="btn-close-edit-modal"
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-205 rounded-lg hover:bg-slate-50 transition-colors text-xs"
          >
            Cancel
          </button>
        </div>

        {/* Modal Form inputs body */}
        <form onSubmit={handleFormSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 divide-y divide-slate-100">
          
          {/* User coordinates sector */}
          <div className="space-y-4 pb-4">
            <h4 className="text-[10px] whitespace-nowrap uppercase tracking-wider font-bold text-slate-400">Requestor Coordinates</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="edit-name" className="block font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  id="edit-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full text-xs px-3 py-2 border rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.name ? 'border-rose-350 focus:ring-1 focus:ring-rose-100' : 'border-slate-200 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-rose-600 font-medium">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="edit-email" className="block font-semibold text-slate-600">Email Coordinates</label>
                <input
                  type="email"
                  id="edit-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full text-xs px-3 py-2 border rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.email ? 'border-rose-350 focus:ring-1 focus:ring-rose-100' : 'border-slate-200 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-rose-600 font-medium">{errors.email}</span>}
              </div>

              {/* Contact Phone */}
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="edit-phone" className="block font-semibold text-slate-600">Contact Phone Number</label>
                <input
                  type="text"
                  id="edit-phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  className={`w-full text-xs px-3 py-2 border rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.phone ? 'border-rose-350 focus:ring-1 focus:ring-rose-100' : 'border-slate-200 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.phone && <span className="text-[10px] text-rose-600 font-medium">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Ticket Descriptions details Sector */}
          <div className="space-y-4 py-4 flex-1">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Ticket Content details</h4>
            
            <div className="space-y-3">
              {/* Subject */}
              <div className="space-y-1">
                <label htmlFor="edit-subject" className="block font-semibold text-slate-600">Inquiry Summary / Subject</label>
                <input
                  type="text"
                  id="edit-subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
                  }}
                  className={`w-full text-xs px-3 py-2 border rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                    errors.subject ? 'border-rose-350 focus:ring-1 focus:ring-rose-100' : 'border-slate-200 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.subject && <span className="text-[10px] text-rose-600 font-medium">{errors.subject}</span>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="edit-description" className="block font-semibold text-slate-600">Detailed Description</label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                  }}
                  className={`w-full text-xs px-3 py-2.5 border rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all resize-y ${
                    errors.description ? 'border-rose-350 focus:ring-1 focus:ring-rose-100' : 'border-slate-200 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                {errors.description && <span className="text-[10px] text-rose-600 font-medium">{errors.description}</span>}
              </div>
            </div>
          </div>

          {/* Submit Save handlers in modal footer */}
          <div className="p-6 bg-slate-50 flex items-center justify-end space-x-3 -mx-6 -mb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              id="btn-save-edit"
              disabled={isSaving}
              className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-75 disabled:pointer-events-none rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2 shadow-xs"
            >
              {isSaving ? (
                <span>Publishing updates...</span>
              ) : (
                <>
                  <Save size={14} />
                  <span>Commit Updates</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
