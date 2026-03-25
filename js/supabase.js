import { createClient } from
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL     = 'https://wljzqvpdpupefikpiuuy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsanpxdnBkcHVwZWZpa3BpdXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjE4NTEsImV4cCI6MjA4OTc5Nzg1MX0.t2TtOvBM4ibuIuVf4WwafcpD9fivm55RRhg8Vpzwo90'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  true
  }
})