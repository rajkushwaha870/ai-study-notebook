import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables (PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY) are missing.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
