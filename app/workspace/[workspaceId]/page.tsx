'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setupWorkspaceSchema } from '@/lib/supabase/setup';
import { useWorkspaceActivity } from '@/hooks/useWorkspaceActivity';
import { UserActivityIndicator, UserProfileCard } from '@/components/UserActivityIndicator';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  
  const [schemaReady, setSchemaReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Use the consolidated activity hook
  const {
    session,
    userName,
    onlineUsers,
    isOnline,
    updateUserName,
    exitWorkspace,
  } = useWorkspaceActivity(workspaceId, schemaReady);

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

  const copyWorkspaceUrl = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleExitWorkspace = async () => {
    await exitWorkspace();
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
        {/* Header with Activity Indicator */}
        <UserActivityIndicator
          currentSession={session}
          onlineUsers={onlineUsers}
          isOnline={isOnline}
          onCopyWorkspaceUrl={copyWorkspaceUrl}
          onExitWorkspace={handleExitWorkspace}
        />

        {/* Workspace ID Display */}
        <div className="text-muted-foreground text-sm">
          Workspace ID: {workspaceId}
        </div>

        {/* Main Workspace Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <UserProfileCard
            session={session}
            userName={userName}
            isOnline={isOnline}
            onUpdateUserName={updateUserName}
          />

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