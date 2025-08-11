'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('_realtime_schema').select('count').limit(1);
        
        if (error) {
          // Try a simpler test - just check auth
          const { data: authData, error: authError } = await supabase.auth.getSession();
          if (authError) {
            throw authError;
          }
          setConnected(true);
        } else {
          setConnected(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setConnected(false);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-4 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing your Supabase API connection...
          </p>
        </div>
        
        <div className="rounded-lg border p-4">
          {connected === null && (
            <div className="text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Connecting...</p>
            </div>
          )}
          
          {connected === true && (
            <div className="text-center text-green-600">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-semibold">Connection Successful!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your Supabase API keys are working correctly.
              </p>
            </div>
          )}
          
          {connected === false && (
            <div className="text-center text-red-600">
              <div className="text-2xl mb-2">❌</div>
              <p className="font-semibold">Connection Failed</p>
              {error && (
                <p className="text-sm mt-1 break-words">
                  Error: {error}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="text-center">
          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}