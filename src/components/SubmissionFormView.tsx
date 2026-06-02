import React, { useState } from 'react';
import { FileText, User, Mail, Phone, Info, HelpCircle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { SubmissionCategory, SubmissionPriority, Submission } from '../types';

interface SubmissionFormViewProps {
  onSubmitSuccess: (data: Omit<Submission, 'id' | 'createdAt' | 'status'>) => void;
  setActivePage: (p: 'home' | 'submit' | 'admin' | '404') => void;
}

export default function SubmissionFormView({ onSubmitSuccess, setActivePage }: SubmissionFormViewProps) {
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SubmissionCategory>('Billing');
  const [priority, setPriority] = useState<SubmissionPriority>('Low');
  const [description, setDescription] = useState('');

  // UI state feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Field touch and validation tracking
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    description?: string;
  }>({});

  const categories: SubmissionCategory[] = [
    'Technical Support',
    'Billing',
    'Feedback',
    'Security',
    'Partnerships',
  ];

  const priorities: SubmissionPriority[] = ['Low', 'Medium', 'High', ];

  // Phone Validator helper (Checks basic structure, numbers, spaces, minimal formatting)
  const validatePhone = (num: string) => {
    // Allows optional leading +, digits, dashes, spaces, parenthetical brackets
    const phoneRegex = /^(\+?\d{1,4}?[-.\s]?)?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(num.trim());
  };

  // Email validation helper
  const validateEmail = (mail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail.trim());
  };

  const handleInputValidation = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please provide a valid format (e.g. +91 9876543210).';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Course is required.';
    } else if (subject.trim().length < 2) {
      newErrors.subject = 'Course should be distinct (min 2 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Run active validators
    const isValid = handleInputValidation();

    if (!isValid) {
      return;
    }

    // Begin Loading state
    setIsSubmitting(true);

    // Simulate reliable persistence timer
    setTimeout(() => {
      try {
        onSubmitSuccess({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          subject: subject.trim(),
          category,
          priority,
          description: description.trim(),
        });

        // Set state to success
        setSubmitSuccess(true);
        setIsSubmitting(false);

        // Reset inputs
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setCategory('Billing');
        setPriority('Low');
        setDescription('');
      } catch (err: any) {
        setSubmitError(err?.message || 'Failed to submit the query. Please retry.');
        setIsSubmitting(false);
      }
    }, 800);
  };

  

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up" id="portal-form-container">
      <div>
        <h2 className="font-display font-semibold text-xl text-slate-900 tracking-tight">Post Your Inquiry</h2>
        <p className="text-sm text-slate-450 mt-2">Fill in the details so the team can respond to your request.</p>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 text-sm animate-fade-in" id="form-error-banner">
          <XCircle size={18} className="mt-0.5 text-rose-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold">Workflow Error</h4>
            <p className="text-xs text-rose-600">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmission} className="bg-white rounded-3xl border border-slate-200/65 overflow-hidden shadow-xs divide-y divide-slate-100" id="portal-request-form">
        
        {/* Contact Information Sector */}
        <div className="p-6 space-y-5">
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center">
            <User size={14} className="mr-2 text-slate-400 stroke-[2.25]" />
            Contact Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullname" className="block text-xs font-semibold text-slate-600">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  id="fullname"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Chaitanya Purohit"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-300 focus:ring-rose-100'
                      : 'border-slate-200 focus:ring-slate-100'
                  }`}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'fullname-error' : undefined}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-600 font-medium" id="fullname-error">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="emailaddress" className="block text-xs font-semibold text-slate-600">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  id="emailaddress"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="e.g. chaitanya@example.com"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-100'
                      : 'border-slate-200 focus:ring-slate-100'
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-medium" id="email-error">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="phonenumber" className="block text-xs font-semibold text-slate-600">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={15} />
                </span>
                <input
                  type="text"
                  id="phonenumber"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="e.g. +91 8882061423"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-300 focus:ring-rose-100'
                      : 'border-slate-200 focus:ring-slate-100'
                  }`}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-600 font-medium" id="phone-error">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>



        {/* Content & Descriptions details Sector */}
        <div className="p-6 space-y-5">
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase flex items-center">
            <FileText size={14} className="mr-2 text-slate-400 stroke-[2.25]" />
            Course Details
          </h3>

          <div className="space-y-4">
            {/* Subject Field */}
            <div className="space-y-1.5">
              <label htmlFor="formsubject" className="block text-xs font-semibold text-slate-600">
                Inquiry Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="formsubject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
                }}
                placeholder="Which Course Are you Looking For?"
                className={`w-full text-sm px-4 py-2.5 rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.subject
                    ? 'border-rose-300 focus:ring-rose-100'
                    : 'border-slate-200 focus:ring-slate-100'
                }`}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? 'subject-error' : undefined}
              />
              {errors.subject && (
                <p className="text-[11px] text-rose-600 font-medium" id="subject-error">{errors.subject}</p>
              )}
            </div>

            {/* Description Area */}
            <div className="space-y-1.5">
              <label htmlFor="formdescription" className="block text-xs font-semibold text-slate-600">
                Detailed Inquiry <span className="text-rose-500"></span>
              </label>
              <textarea
                id="formdescription"
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                placeholder="IF REQUIRED: Please provide any specific details, questions, or context related to your course inquiry. "
                className={`w-full text-sm px-4 py-3 rounded-xl border bg-slate-50/50 hover:bg-slate-50 /50 focus:bg-white focus:outline-none focus:ring-2 transition-all resize-y ${
                  errors.description
                    ? 'border-rose-305 focus:ring-rose-100'
                    : 'border-slate-200 focus:ring-slate-100'
                }`}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'desc-error' : undefined}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-450 px-1 mt-0.5">
                <span>Please be specific. Minimum 10 characters required.</span>
                <span className={description.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'}>
                  {description.trim().length} characters registered
                </span>
              </div>
              {errors.description && (
                <p className="text-[11px] text-rose-600 font-medium" id="desc-error">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls layout */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-[11px] text-slate-500 max-w-sm">
            <Info size={14} className="mr-2 text-slate-400 shrink-0" />
            <span>We aim to respond to all inquiries within 24-48 hours on business days.  </span>
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
          
           <button
              type="submit"
              id="submit-form-button"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-75 disabled:pointer-events-none transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-white" />
                  <span>Logging Request...</span>
                </>
              ) : (
                <span>Save Support Inquiry</span>
              )}
            </button>
            
          </div>
        </div>
      </form>
    </div>
  );
}
