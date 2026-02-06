
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kyuhyxnfflnvxakunwuo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dWh5eG5mZmxudnhha3Vud3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDA3NjgsImV4cCI6MjA4NTkxNjc2OH0.G8BuiOiFIxz51qsevlYOu5Gdygy8CQVWclflywLdNSk'

export const supabase = createClient(supabaseUrl, supabaseKey)
