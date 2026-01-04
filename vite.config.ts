import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Defaults provided by the user
const DEFAULT_SUPABASE_URL = 'https://mfuzfqrcnucgkpvhierx.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdXpmcXJjbnVjZ2twdmhpZXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTI4NDcsImV4cCI6MjA4MzAyODg0N30.oSpbBxYZWnS4jLlPxJOQtWec5RPXXzt6SNfKYwuxIi0';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Satisfies Gemini SDK requirement for process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || ''),
    // Explicitly mapping Supabase keys for Vite's import.meta.env with fallbacks
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY),
    'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});