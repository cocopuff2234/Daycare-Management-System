import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://tcfxaiuukjsyotmjxzol.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZnhhaXV1a2pzeW90bWp4em9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTcyMjksImV4cCI6MjA2MTczMzIyOX0.eEVwDvLr56q0ILhUnjvuwy_h8D56C9QHmqZX3PYrwoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formData = {
  email: 'example@example.com',
  password: 'password123'
};

try {
  const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  });

  if (error) {
	console.error('Sign-up error:', error.message || error);
	throw new Error(error.message || 'Unknown error occurred during sign-up');
  }

  console.log('Sign-up successful:', data);
} catch (err) {
  console.error('Unhandled error during sign-up:', err.message || err);
  // Optionally, display an error message to the user
}