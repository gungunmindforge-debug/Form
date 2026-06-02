import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Client (Lazy load / Safe fallback check)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (isSupabaseConfigured) {
  console.log('[Backend] Supabase credentials detected. Running in Cloud Storage Sync mode.');
} else {
  console.log('[Backend] Running in Local Memory Fallback mode. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to sync cloud data.');
}

// In-Memory Fallback Cache Store
let localSubmissions: any[] = [
  {
    id: 'sub-mock-001',
    name: 'Chaitanya',
    phone: '8882061417',
    email: 'chaitanya23.purohit@example.com',
    subject: 'B.tech CSE query',
    category: 'Billing',
    priority: 'Low',
    description: 'When requesting a course syllabus, can I choose custom electives? Please clarify standard curriculum layout.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'sub-mock-002',
    name: 'Aishwarya Roy',
    phone: '9876543210',
    email: 'aishwarya.roy@example.com',
    subject: 'Data Science Bootcamp',
    category: 'Technical Support',
    priority: 'High',
    description: 'Interested in the upcoming data science immersive bootcamp. Are recordings provided for live weekend lectures?',
    status: 'New',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  }
];

// Helper to perform dynamic self-healing database operations on the "submissions" table.
// If the table doesn't have some columns, we detect the error and automatically prune them, retrying on the fly.
// If the table's id is a UUID type, we convert standard "sub-" string IDs into valid v4 UUID formats.
async function executeDbOperation(operationFn: (payload: any) => Promise<{ error: any }>, initialPayload: any) {
  const payload = { ...initialPayload };
  let attempts = 0;
  const maxAttempts = 12;

  console.log(`[Supabase Operation] Initializing db sync. Initial payload columns:`, Object.keys(payload));

  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`\n[Supabase Operation] Attempt #${attempts} - Syncing payload:`, payload);
      const { error } = await operationFn(payload);
      
      if (!error) {
        console.log(`[Supabase Operation] SUCCESS! Sync completed successfully on Attempt #${attempts}. Final columns:`, Object.keys(payload));
        return { success: true, payload };
      }

      console.warn(`[Supabase Operation] Attempt #${attempts} failed. Error Code: "${error.code}". Error Message: "${error.message}"`);
      const msg = error.message || '';

      // Check for Row Level Security policies blocking the insert / update
      if (msg.toLowerCase().includes('violates row-level security') || msg.toLowerCase().includes('row-level security') || error.code === '42501') {
        console.error('\n======================================================================');
        console.error('⚠️  SUPABASE PERMISSION ERROR: Row Level Security (RLS) is blocking this write!');
        console.error('👉 ACTION REQUIRED: Open the Supabase DB SQL Editor and disable RLS for submissions by running:');
        console.error('   ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;');
        console.error('   (Or configure an insert/active policy in the Database -> Policies tab)');
        console.error('======================================================================\n');
        return { success: false, error: new Error('Supabase RLS active: write is blocked. Read logs or run query: ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;') };
      }

      // Check PostgreSQL error code '42P21', PostgREST 'PGRST204' (undefined/missing column) or standard missing column messages
      if (error.code === '42P21' || error.code === 'PGRST204' || msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('column')) {
        let badColumn = '';

        // 1. Double quoted column matches (e.g. column "createdAt" of relation "submissions" does not exist)
        const doubleQuoteMatch = msg.match(/column "([^"]+)"/i);
        if (doubleQuoteMatch && doubleQuoteMatch[1]) {
          badColumn = doubleQuoteMatch[1];
          console.log(`[Supabase Matcher] Double quote pattern matched column identifier: "${badColumn}"`);
        }

        // 2. Single quoted column matches (e.g. Could not find the 'created_at' column of 'submissions' in the schema cache)
        if (!badColumn) {
          const singleQuoteMatch = msg.match(/'([^']+)' column/i);
          if (singleQuoteMatch && singleQuoteMatch[1]) {
            badColumn = singleQuoteMatch[1];
            console.log(`[Supabase Matcher] Single quote pattern matched column identifier: "${badColumn}"`);
          }
        }

        // 3. Fallback: Find all single-quoted strings in the error message and see which one is in the payload keys
        if (!badColumn) {
          const allSingleQuotes = [...msg.matchAll(/'([^']+)'/g)].map(m => m[1]);
          const keyMatch = allSingleQuotes.find(k => k !== 'submissions' && payload.hasOwnProperty(k));
          if (keyMatch) {
            badColumn = keyMatch;
            console.log(`[Supabase Matcher] Fallback single-quote filter matched payload key: "${badColumn}"`);
          }
        }

        // 4. Fallback: Find all double-quoted strings in the error message and see which one is in the payload keys
        if (!badColumn) {
          const allDoubleQuotes = [...msg.matchAll(/"([^"]+)"/g)].map(m => m[1]);
          const keyMatch = allDoubleQuotes.find(k => k !== 'submissions' && payload.hasOwnProperty(k));
          if (keyMatch) {
            badColumn = keyMatch;
            console.log(`[Supabase Matcher] Fallback double-quote filter matched payload key: "${badColumn}"`);
          }
        }

        if (badColumn) {
          console.log(`[Supabase Schema Heal] Pruning missing column "${badColumn}" from payload and retrying...`);
          delete payload[badColumn];
          continue;
        } else {
          console.warn('[Supabase Matcher] Could not safely extract which column is missing from the error message.');
        }
      }

      // Check for UUID format cast failure
      if (msg.includes('invalid input syntax for type uuid') || msg.includes('uuid')) {
        console.log('[Supabase Schema Heal] ID formatting error is likely a UUID type requirement. Converting key identifier to valid UUID v4.');
        payload.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        continue;
      }

      // Unrecoverable or other error
      return { success: false, error };
    } catch (err: any) {
      console.error('[Supabase Heal Exception]', err);
      return { success: false, error: err };
    }
  }

  return { success: false, error: new Error('Max schema correction retries exceeded') };
}

// ==================== API ENDPOINTS ====================

// 1. GET ALL SUBMISSIONS
app.get('/api/submissions', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*');
      
      if (error) {
        console.warn('[Backend] Supabase query returned error, using local storage cache:', error);
        res.json(localSubmissions);
      } else if (data) {
        // Map database columns to type properties gracefully
        const mapped = data.map((item: any) => ({
          id: item.id || '',
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          subject: item.subject || '',
          category: item.category || 'Billing',
          priority: item.priority || 'Low',
          description: item.description || '',
          status: item.status || 'New',
          createdAt: item.createdAt || item.created_at || item.createdat || new Date().toISOString()
        }));
        // Seed local list with database records so the local list stays in sync as backup
        localSubmissions = mapped;
        res.json(mapped);
      } else {
        res.json(localSubmissions);
      }
    } catch (err: any) {
      console.warn('[Backend] Supabase fetch exception, local fallback loaded:', err.message || err);
      res.json(localSubmissions);
    }
  } else {
    res.json(localSubmissions);
  }
});

// 2. CREATE A NEW SUBMISSION
app.post('/api/submissions', async (req, res) => {
  const { name, email, phone, subject, category, priority, description } = req.body;
  
  if (!name || !email || !phone || !subject) {
    res.status(400).json({ error: 'Missing mandatory submission fields: name, email, phone, and subject are required.' });
    return;
  }

  const newSub = {
    id: `sub-${Math.random().toString(36).substring(2, 11)}`,
    name,
    email: email.toLowerCase(),
    phone,
    subject,
    category: category || 'Billing',
    priority: priority || 'Low',
    description: description || '',
    status: 'New',
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      const insertFn = async (dataToInsert: any) => {
        return await supabase
          .from('submissions')
          .insert([dataToInsert]);
      };

      const result = await executeDbOperation(insertFn, {
        id: newSub.id,
        name: newSub.name,
        email: newSub.email,
        phone: newSub.phone,
        subject: newSub.subject,
        category: newSub.category,
        priority: newSub.priority,
        description: newSub.description,
        status: newSub.status,
        createdAt: newSub.createdAt,
        created_at: newSub.createdAt
      });

      if (result.success && result.payload) {
        newSub.id = result.payload.id || newSub.id;
        console.log(`[Backend] Saved record using self-healed columns (ID: ${newSub.id}).`);
      } else {
        console.warn('[Backend] Supabase insert failed despite self-healing attempts, saving locally as fallback:', result.error);
      }
    } catch (err: any) {
      console.warn('[Backend] Supabase insert exception, cached in-memory:', err.message || err);
    }
  }

  // Prepend to local submissions as offline backup cache
  localSubmissions = [newSub, ...localSubmissions];
  res.status(201).json(newSub);
});

// 3. COMPLETE SUBMISSION UPDATE (EDIT MODAL TICKET SAVE)
app.put('/api/submissions/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, subject, category, priority, description, status } = req.body;

  if (supabase) {
    try {
      const updateFn = async (dataToUpdate: any) => {
        return await supabase
          .from('submissions')
          .update(dataToUpdate)
          .eq('id', id);
      };

      const result = await executeDbOperation(updateFn, {
        name,
        email: email?.toLowerCase(),
        phone,
        subject,
        category,
        priority,
        description,
        status
      });

      if (!result.success) {
        console.warn('[Backend] Supabase self-healing update failed:', result.error);
      }
    } catch (err: any) {
      console.warn('[Backend] Supabase update exception:', err.message || err);
    }
  }

  // Update local submissions lists
  localSubmissions = localSubmissions.map(item => 
    item.id === id 
      ? { ...item, name, email, phone, subject, category, priority, description, status } 
      : item
  );
  res.json({ success: true, message: 'Submission updated successfully.' });
});

// 4. STEP STATUS QUICK OVERRIDE
app.put('/api/submissions/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }

  if (supabase) {
    try {
      const updateFn = async (dataToUpdate: any) => {
        return await supabase
          .from('submissions')
          .update(dataToUpdate)
          .eq('id', id);
      };

      const result = await executeDbOperation(updateFn, { status });
      if (!result.success) {
        console.warn('[Backend] Supabase status quick-update failed:', result.error);
      }
    } catch (err: any) {
      console.warn('[Backend] Supabase status quick-update exception:', err.message || err);
    }
  }

  localSubmissions = localSubmissions.map(item => 
    item.id === id ? { ...item, status } : item
  );
  res.json({ success: true, message: 'Status updated successfully.' });
});

// 5. DESTROY SUBMISSION RECORD
app.delete('/api/submissions/:id', async (req, res) => {
  const { id } = req.params;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);
      if (error) {
        console.warn('[Backend] Supabase delete failed:', error);
      }
    } catch (err: any) {
      console.warn('[Backend] Supabase delete exception:', err.message || err);
    }
  }

  localSubmissions = localSubmissions.filter(item => item.id !== id);
  res.json({ success: true, message: 'Submission deleted successfully.' });
});

// 6. GET SUPABASE CONFIG AND CONNECTION STATUS
app.get('/api/supabase-config', (req, res) => {
  res.json({
    isConfigured: isSupabaseConfigured,
    supabaseUrl: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/)[^.]+(\.supabase\.co)/, '$1******$2') : null,
    hasAnonKey: !!supabaseAnonKey,
  });
});


// ==================== VITE CLIENT INTEGRATION ====================

async function launch() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Standard container portal running at http://localhost:${PORT}`);
  });
}

launch();
