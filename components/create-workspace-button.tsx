'use client';

import { useRouter } from 'next/navigation';

export function CreateWorkspaceButton() {
  const router = useRouter();

  const createWorkspace = () => {
    // Generate a random workspace ID
    const workspaceId = Math.random().toString(36).substring(2, 15);
    router.push(`/workspace/${workspaceId}`);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={createWorkspace}
        className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        🚀 Create New Workspace
      </button>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">or try a demo workspace</p>
        <button
          onClick={() => router.push('/workspace/demo-abc123')}
          className="text-xs text-primary hover:underline"
        >
          Join demo workspace →
        </button>
      </div>
    </div>
  );
}