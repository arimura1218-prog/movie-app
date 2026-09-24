import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhlrvfsimqlbkooxcmuv.supabase.co';
const supabaseKey = 'sb_publishable_JeTOHCZcT77SeINlX4pw9g_IXlhx9gl';

export const supabase = createClient(supabaseUrl, supabaseKey);