import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ACTIVITY_CONFIG,
  OnlineUser,
  ActivitySession,
  getStoredSession,
  getStoredUserName,
  updateStoredUserName,
  updatePresence,
  fetchOnlineUsers,
  cleanupStalePresence,
  removePresence,
  createDebounce,
} from '@/lib/workspace-activity';

interface UseWorkspaceActivityReturn {
  session: string;
  userName: string;
  onlineUsers: OnlineUser[];
  isOnline: boolean;
  updateUserName: (newName: string) => Promise<void>;
  exitWorkspace: () => Promise<void>;
}

export const useWorkspaceActivity = (
  workspaceId: string,
  isReady: boolean = true
): UseWorkspaceActivityReturn => {
  // Session state
  const [session] = useState(() => getStoredSession(workspaceId));
  const [userName, setUserName] = useState(() => getStoredUserName(workspaceId));
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);

  // Refs to avoid stale closures
  const userNameRef = useRef(userName);
  const intervalsRef = useRef<{
    presence?: NodeJS.Timeout;
    cleanup?: NodeJS.Timeout;
  }>({});

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  // Debounced fetch function
  const debouncedFetchUsers = useCallback(
    createDebounce(async () => {
      const now = Date.now();
      if (now - lastFetch < ACTIVITY_CONFIG.DEBOUNCE_DELAY) return;
      
      setLastFetch(now);
      const users = await fetchOnlineUsers(workspaceId);
      setOnlineUsers(users);
    }, 1000),
    [workspaceId, lastFetch]
  );

  // Core presence update function
  const handlePresenceUpdate = useCallback(async () => {
    const result = await updatePresence(workspaceId, session, userNameRef.current);
    setIsOnline(result.success);
    
    if (result.success) {
      console.log('✅ Presence updated for session:', session.slice(0, 8));
    }
  }, [workspaceId, session]);

  // Update user name function
  const updateUserNameHandler = useCallback(async (newName: string) => {
    setUserName(newName);
    updateStoredUserName(workspaceId, newName);
    
    const result = await updatePresence(workspaceId, session, newName);
    if (result.success) {
      console.log('✅ Name updated:', newName);
      // Refresh users list immediately
      const users = await fetchOnlineUsers(workspaceId);
      setOnlineUsers(users);
    }
  }, [workspaceId, session]);

  // Exit workspace function
  const exitWorkspace = useCallback(async () => {
    await removePresence(workspaceId, session);
    setIsOnline(false);
  }, [workspaceId, session]);

  // Cleanup function
  const cleanup = useCallback(() => {
    Object.values(intervalsRef.current).forEach(clearInterval);
    removePresence(workspaceId, session);
  }, [workspaceId, session]);

  // Main effect - handles all activity logic
  useEffect(() => {
    if (!isReady) return;

    const supabase = createClient();

    // Initial setup
    handlePresenceUpdate();
    debouncedFetchUsers();

    // Set up intervals
    intervalsRef.current.presence = setInterval(
      handlePresenceUpdate, 
      ACTIVITY_CONFIG.PRESENCE_UPDATE_INTERVAL
    );
    
    intervalsRef.current.cleanup = setInterval(
      () => cleanupStalePresence(workspaceId),
      ACTIVITY_CONFIG.CLEANUP_INTERVAL
    );

    // Real-time subscription
    const subscription = supabase
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
          debouncedFetchUsers();
        }
      )
      .subscribe((status) => {
        console.log('Activity subscription status:', status);
      });

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalsRef.current.presence!);
        handlePresenceUpdate(); // One final update
      } else {
        handlePresenceUpdate();
        intervalsRef.current.presence = setInterval(
          handlePresenceUpdate,
          ACTIVITY_CONFIG.PRESENCE_UPDATE_INTERVAL
        );
      }
    };

    // Event listeners
    const handlePageHide = () => cleanup();
    const handleBeforeUnload = () => cleanup();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [workspaceId, session, isReady, handlePresenceUpdate, debouncedFetchUsers, cleanup]);

  return {
    session,
    userName,
    onlineUsers,
    isOnline,
    updateUserName: updateUserNameHandler,
    exitWorkspace,
  };
};