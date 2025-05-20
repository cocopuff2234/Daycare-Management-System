import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://tcfxaiuukjsyotmjxzol.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZnhhaXV1a2pzeW90bWp4em9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTcyMjksImV4cCI6MjA2MTczMzIyOX0.eEVwDvLr56q0ILhUnjvuwy_h8D56C9QHmqZX3PYrwoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);