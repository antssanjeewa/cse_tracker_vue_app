import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://koevusjggapfimievpld.supabase.co'
const supabaseKey = 'sb_publishable_KENbWDLkCcVVtsDr7MuZAg_ojvqONUk'

export const supabase = createClient(supabaseUrl, supabaseKey)
