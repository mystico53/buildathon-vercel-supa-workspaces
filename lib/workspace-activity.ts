import { createClient } from './supabase/client';

// Constants
export const ACTIVITY_CONFIG = {
  PRESENCE_UPDATE_INTERVAL: 10000,
  CLEANUP_INTERVAL: 60000,
  USER_TIMEOUT: 30000,
  STALE_TIMEOUT: 120000,
  DEBOUNCE_DELAY: 2000,
} as const;

export interface OnlineUser {
  user_session: string;
  user_name: string;
}

export interface ActivitySession {
  session: string;
  userName: string;
}

// Generate consistent color for user based on session ID
export const getUserColor = (userSession: string): string => {
  let hash = 0;
  for (let i = 0; i < userSession.length; i++) {
    const char = userSession.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Session storage helpers
export const getStoredSession = (workspaceId: string): string => {
  if (typeof window === 'undefined') return crypto.randomUUID();
  
  const stored = sessionStorage.getItem(`workspace-session-${workspaceId}`);
  if (stored) return stored;
  
  const newSession = crypto.randomUUID();
  sessionStorage.setItem(`workspace-session-${workspaceId}`, newSession);
  return newSession;
};

export const getStoredUserName = (workspaceId: string): string => {
  if (typeof window === 'undefined') return `User-${crypto.randomUUID().slice(0, 4)}`;
  
  const sessionStored = sessionStorage.getItem(`workspace-name-${workspaceId}`);
  if (sessionStored) return sessionStored;
  
  const defaultName = `User-${crypto.randomUUID().slice(0, 4)}`;
  sessionStorage.setItem(`workspace-name-${workspaceId}`, defaultName);
  return defaultName;
};

export const updateStoredUserName = (workspaceId: string, userName: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`workspace-name-${workspaceId}`, userName);
  }
};

// Database operations
export const updatePresence = async (
  workspaceId: string, 
  userSession: string, 
  userName: string
): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('workspace_presence')
    .upsert({
      workspace_id: workspaceId,
      user_session: userSession,
      user_name: userName,
      last_seen: new Date().toISOString(),
    }, {
      onConflict: 'workspace_id,user_session'
    });

  if (error) {
    console.log('Presence error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const fetchOnlineUsers = async (workspaceId: string): Promise<OnlineUser[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('workspace_presence')
    .select('user_session, user_name')
    .eq('workspace_id', workspaceId)
    .gte('last_seen', new Date(Date.now() - ACTIVITY_CONFIG.USER_TIMEOUT).toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.log('Error fetching users:', error);
    return [];
  }

  return data || [];
};

export const cleanupStalePresence = async (workspaceId: string): Promise<void> => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('workspace_presence')
    .delete()
    .eq('workspace_id', workspaceId)
    .lt('last_seen', new Date(Date.now() - ACTIVITY_CONFIG.STALE_TIMEOUT).toISOString());

  if (error) {
    console.log('Error cleaning up stale presence:', error);
  }
};

export const removePresence = async (workspaceId: string, userSession: string): Promise<void> => {
  const supabase = createClient();
  
  await supabase
    .from('workspace_presence')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_session', userSession);
};

// Debounce utility
export const createDebounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};