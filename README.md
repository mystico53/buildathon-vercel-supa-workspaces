# Buildathon Vercel Supabase Workspaces

🚀 **URL-based collaborative workspaces with Next.js and Supabase - no authentication required**

## ✨ Features

- **🔗 URL-based Access**: Share a link, start collaborating instantly
- **👥 Real-time Multi-user**: See who's online and collaborate in real-time  
- **🎨 Visual User Presence**: Color-coded avatars with current user highlighting
- **✏️ Customizable Names**: Click to edit your display name
- **📋 One-click Sharing**: Copy workspace URL to clipboard
- **🚪 Clean Exit**: Leave workspace with presence cleanup
- **⚡ Zero Auth**: No sign-ups, no login - just share the URL

## 🏗️ Architecture

Built following the **"Assemble, Don't Build"** philosophy:
- **Next.js 15** with App Router for dynamic workspace routing
- **Supabase** for real-time presence and data synchronization  
- **Tailwind CSS** for responsive UI components
- **UUID-based Sessions** for temporary user identification

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/mystico53/buildathon-vercel-supa-workspaces.git
   cd buildathon-vercel-supa-workspaces
   npm install
   ```

2. **Setup Supabase**
   - Create a new Supabase project
   - Copy your API keys to `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
     ```
   - Run the SQL from `supabase-setup.sql` in your Supabase dashboard

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Test Multi-user**
   - Open http://localhost:3000
   - Click "Create New Workspace" 
   - Share the URL with others or open in multiple tabs

## 🎯 How It Works

### URL = Workspace Identity
```
yourapp.com/workspace/abc-123  ← Everyone with this URL collaborates
```

### Real-time Presence
- Each browser gets a unique session UUID
- Supabase tracks who's online in each workspace
- Real-time subscriptions update user presence instantly

### No Authentication Needed
- Workspace ID in URL provides access control
- Temporary session IDs for user identification
- No user accounts, passwords, or sign-ups required

## 🏗️ Database Schema

The system uses two main tables:

**workspace_presence** - Tracks who's online
- `workspace_id` - Links to URL parameter
- `user_session` - Browser-generated UUID  
- `user_name` - Customizable display name
- `last_seen` - For cleanup of inactive users

**workspace_items** - Stores collaborative data
- `workspace_id` - Scopes data to workspace
- `content` - JSON blob for flexible data storage
- Row-level security filters by workspace

## 🔧 Key Components

- **`[workspaceId]/page.tsx`** - Dynamic workspace routing
- **`connection-test.tsx`** - Supabase connection validation  
- **`create-workspace-button.tsx`** - Workspace creation UI
- **`supabase-setup.sql`** - Complete database schema

## 🎨 User Experience

1. **Visit Homepage** - See connection status and create workspace button
2. **Create Workspace** - Generates random ID, redirects to `/workspace/[id]`
3. **Share URL** - Copy button shares workspace instantly
4. **See Others** - Online users appear as colored avatar circles
5. **Customize** - Click your name to edit it
6. **Exit Cleanly** - Exit button removes your presence

## 🌟 Perfect For

- **Hackathons/Buildathons** - Quick collaborative demos
- **Temporary Collaboration** - No account setup friction  
- **Proof of Concepts** - Real-time features without auth complexity
- **Educational Projects** - Learn real-time web development

## 🔮 Extension Ideas

- Add canvas drawing with shared cursors
- Real-time text editing (like Google Docs)
- File sharing within workspaces  
- Voice/video calls integration
- Persistent workspace data
- Custom workspace URLs

## 📚 Built With Buildathon Philosophy

This project demonstrates **rapid development through intelligent assembly**:

✅ **Leverage existing solutions** (Supabase real-time, Next.js routing)  
✅ **Minimize custom code** (URL-based auth, temporary sessions)  
✅ **Maximum demo value** (End-to-end collaboration in minutes)  
✅ **Component reuse** (Tailwind, shadcn/ui patterns)

Perfect example of getting **80% functionality in 20% of the time** by choosing the right tools and patterns.

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**
