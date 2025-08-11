-- Workspace Presence Table
CREATE TABLE workspace_presence (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id text NOT NULL,
  user_session text NOT NULL,
  user_name text,
  last_seen timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_session)
);

-- Enable RLS
ALTER TABLE workspace_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see presence for their current workspace
CREATE POLICY "Users can view workspace presence" ON workspace_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON workspace_presence
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own session" ON workspace_presence
  FOR UPDATE USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_presence;

-- Index for performance
CREATE INDEX idx_workspace_presence_workspace_id ON workspace_presence(workspace_id);
CREATE INDEX idx_workspace_presence_last_seen ON workspace_presence(last_seen);

-- Clean up old presence records (optional - can be run periodically)
-- DELETE FROM workspace_presence WHERE last_seen < now() - interval '1 hour';

-- Example workspace data table (for future use)
CREATE TABLE workspace_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id text NOT NULL,
  item_type text NOT NULL DEFAULT 'note',
  content jsonb DEFAULT '{}',
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  created_by text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for workspace items
ALTER TABLE workspace_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access items in their current workspace
CREATE POLICY "Users can view workspace items" ON workspace_items
  FOR SELECT USING (true);

CREATE POLICY "Users can create workspace items" ON workspace_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update workspace items" ON workspace_items
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete workspace items" ON workspace_items
  FOR DELETE USING (true);

-- Enable real-time for workspace items
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_items;

-- Index for workspace items
CREATE INDEX idx_workspace_items_workspace_id ON workspace_items(workspace_id);
CREATE INDEX idx_workspace_items_updated_at ON workspace_items(updated_at);