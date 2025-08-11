import { createClient } from './client';

export async function setupWorkspaceSchema() {
  const supabase = createClient();

  try {
    // Test if tables exist by trying to select from them
    const { error } = await supabase
      .from('workspace_presence')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist
      console.log('⚠️ Workspace tables not found.');
      console.log('Please run the SQL commands from supabase-setup.sql in your Supabase dashboard:');
      console.log('1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql');
      console.log('2. Copy and run the contents of supabase-setup.sql');
      throw new Error('Database tables not found. Please run supabase-setup.sql');
    }

    if (error) {
      console.log('Database connection error:', error);
      throw error;
    }

    console.log('✅ Workspace schema is set up correctly');
    return { success: true, error: null };
  } catch (err) {
    console.log('Setup check error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Setup error' };
  }
}

export async function cleanupOldPresence() {
  const supabase = createClient();
  
  try {
    // Clean up presence records older than 1 hour
    const { error } = await supabase
      .from('workspace_presence')
      .delete()
      .lt('last_seen', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (error) {
      console.log('Cleanup error:', error);
    } else {
      console.log('✅ Old presence records cleaned up');
    }
  } catch (err) {
    console.log('Cleanup error:', err);
  }
}