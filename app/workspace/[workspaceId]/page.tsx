'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { setupWorkspaceSchema } from '@/lib/supabase/setup';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const [userSession] = useState(() => crypto.randomUUID());
  const [userName, setUserName] = useState(() => `User-${crypto.randomUUID().slice(0, 4)}`);
  const [isEditingName, setIsEditingName] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [schemaReady, setSchemaReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Check if database schema is set up
    setupWorkspaceSchema().then((result) => {
      if (result.success) {
        setSchemaReady(true);
      } else {
        setDbError(result.error);
      }
    });
  }, []);

  useEffect(() => {
    if (!schemaReady) return;
    const supabase = createClient();

    // Update user presence
    const updatePresence = async () => {
      const { error } = await supabase
        .from('workspace_presence')
        .upsert({
          workspace_id: workspaceId,
          user_session: userSession,
          user_name: userName,
          last_seen: new Date().toISOString(),
        });

      if (error) {
        console.log('Presence error:', error);
        // If table doesn't exist, show helpful message
        if (error.code === '42P01') {
          console.log('⚠️ Please run the SQL from supabase-setup.sql in your Supabase dashboard');
        }
      } else {
        console.log('✅ Presence updated for session:', userSession.slice(0, 8));
      }
    };

    // Initial presence update
    updatePresence();

    // Update presence every 10 seconds
    const presenceInterval = setInterval(updatePresence, 10000);

    // Subscribe to presence changes
    const presenceSubscription = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_presence',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('Presence change:', payload);
          fetchOnlineUsers();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Fetch current online users
    const fetchOnlineUsers = async () => {
      const { data, error } = await supabase
        .from('workspace_presence')
        .select('user_session, user_name')
        .eq('workspace_id', workspaceId)
        .gte('last_seen', new Date(Date.now() - 30000).toISOString());

      if (error) {
        console.log('Error fetching users:', error);
      } else if (data) {
        console.log('Online users found:', data.length);
        setOnlineUsers(data);
      }
    };

    fetchOnlineUsers();

    return () => {
      clearInterval(presenceInterval);
      presenceSubscription.unsubscribe();
    };
  }, [workspaceId, userSession, userName, schemaReady]);

  const copyWorkspaceUrl = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const exitWorkspace = async () => {
    // Clean up user presence before leaving
    const supabase = createClient();
    await supabase
      .from('workspace_presence')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_session', userSession);
    
    // Navigate back to home
    router.push('/');
  };

  if (!schemaReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          {!dbError ? (
            <>
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <div>
                <p className="font-semibold">Setting up workspace...</p>
                <p className="text-sm text-muted-foreground">
                  Checking database schema
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">⚠️</div>
              <div>
                <p className="font-semibold text-red-600 mb-2">Database Setup Required</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {dbError}
                </p>
                <div className="text-left bg-muted p-4 rounded text-xs space-y-2">
                  <p className="font-semibold">Setup Steps:</p>
                  <p>1. Go to your Supabase dashboard → SQL Editor</p>
                  <p>2. Copy and run the contents of <code>supabase-setup.sql</code></p>
                  <p>3. Refresh this page</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
                >
                  Refresh Page
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Workspace</h1>
            <p className="text-muted-foreground text-sm">ID: {workspaceId}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Online Users */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {onlineUsers.slice(0, 3).map((user, index) => {
                  const isCurrentUser = user.user_session === userSession;
                  const displayName = user.user_name || `User-${user.user_session.slice(0, 4)}`;
                  return (
                    <div
                      key={user.user_session}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold text-white ${
                        isCurrentUser ? 'border-white shadow-lg' : 'border-background'
                      }`}
                      style={{ backgroundColor: `hsl(${index * 120}, 70%, 50%)` }}
                      title={displayName}
                    >
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  );
                })}
                {onlineUsers.length > 3 && (
                  <div className="w-8 h-8 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {onlineUsers.length} online
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={copyWorkspaceUrl}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                Copy Link
              </button>
              
              <button
                onClick={exitWorkspace}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                Exit Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Your Profile</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Connected to workspace</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Name:</span>
                {isEditingName ? (
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false);
                      if (e.key === 'Escape') {
                        setUserName(`User-${userSession.slice(0, 4)}`);
                        setIsEditingName(false);
                      }
                    }}
                    className="text-xs bg-background border rounded px-1 py-0.5"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs hover:underline cursor-pointer"
                  >
                    {userName}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Session: {userSession.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* Workspace Info */}
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Workspace Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">ID:</span> {workspaceId}</p>
              <p><span className="text-muted-foreground">Created:</span> Just now</p>
              <p><span className="text-muted-foreground">Type:</span> Collaborative</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted">
                📝 Create Note
              </button>
              <button className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted">
                🎨 Start Drawing
              </button>
              <button className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted">
                💬 Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Collaborative Demo Area */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Shared Canvas</h3>
          <div className="min-h-64 bg-muted/20 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                This is your shared workspace canvas
              </p>
              <p className="text-sm text-muted-foreground">
                Anyone with this URL can collaborate here in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-muted/50 p-6">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• This workspace is identified by its URL - no sign-up required</li>
            <li>• Share the URL with others to invite them to collaborate</li>
            <li>• Everyone sees real-time updates and can see who else is online</li>
            <li>• Each person gets a temporary session ID for this browser session</li>
          </ul>
        </div>
      </div>
    </div>
  );
}