import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://lqajosrokucfvlmmjyfo.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qitn0bJuo5xZBu6gnGt4YQ_1f9DwHrF'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
