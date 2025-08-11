# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3001 or 3000)
- `npm run build` - Build production application (required before deployment)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks (must pass for deployment)

## Project Architecture

This is a Next.js 15 App Router application implementing URL-based collaborative workspaces with **no authentication system**. Built as a "Finance Workspace App" using Supabase real-time features.

### Core Architecture Patterns

**Authentication-Free Design**: No login, signup, or user accounts. The entire authentication system has been removed to provide instant access to workspace functionality.

**URL = Identity**: Workspaces are identified by URL paths (`/workspace/[workspaceId]`). Anyone with the URL can access the workspace immediately.

**Real-time Collaboration**: Uses Supabase real-time subscriptions for presence tracking and collaborative features. Each browser session gets a UUID for temporary identification.

**Simplified Navigation**: The new `components/navbar.tsx` provides consistent navigation across all pages with prominent workspace creation access.

**Two-Layer Supabase Integration** (auth layer removed):
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components/API routes
- `lib/supabase/middleware.ts` - Minimal middleware (auth functionality removed)

### Key Components & Flow

**Home Page**: `app/page.tsx` uses the shared `Navbar` component and prominently features workspace creation through `CreateWorkspaceButton`.

**Shared Navigation**: `components/navbar.tsx` provides consistent navigation with:
- "Finance Workspace App" branding
- Deploy button integration  
- Theme switcher
- No authentication elements

**Workspace Entry Point**: `app/workspace/[workspaceId]/page.tsx` is the main workspace interface. It:
1. Validates database schema via `setupWorkspaceSchema()`
2. Initializes workspace activity via `useWorkspaceActivity()` hook
3. Renders collaborative interface with presence indicators

**Activity Management**: `hooks/useWorkspaceActivity.ts` consolidates all real-time logic:
- Session management with localStorage
- Presence updates every 30 seconds
- Real-time subscription to workspace changes
- Cleanup handling for page visibility/unload events

**Presence System**: `lib/workspace-activity.ts` handles core business logic:
- UUID-based session tracking
- Debounced presence updates
- Automatic cleanup of stale records
- User name management

### Database Schema

Located in `supabase-setup.sql`, defines two main tables:

**workspace_presence**: Tracks online users per workspace
- `workspace_id` links to URL parameter
- `user_session` for browser-unique identification
- `last_seen` for cleanup of inactive users
- Real-time enabled for instant presence updates

**workspace_items**: Future collaborative data storage
- Scoped by `workspace_id`
- JSONB content for flexible data types
- Position tracking for spatial collaboration

### Environment Configuration

Required environment variables (in `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` - Public API key

### Development Workflow

1. **Database Setup**: Run `supabase-setup.sql` in Supabase dashboard SQL editor
2. **Environment**: Create `.env.local` and add Supabase credentials (no auth-specific vars needed)
3. **Development**: Use `npm run dev` with Turbopack for fast iteration
4. **Testing Multi-user**: Open workspace URLs in multiple browser tabs/windows
5. **Testing Workspace Creation**: Use the navbar "Create New Workspace" button from any page
6. **Deployment**: Ensure `npm run build` and `npm run lint` pass before deployment

### Real-time Subscription Pattern

The codebase uses a centralized subscription pattern in `useWorkspaceActivity`:
```typescript
const subscription = supabase
  .channel(`workspace-${workspaceId}`)
  .on('postgres_changes', { 
    table: 'workspace_presence', 
    filter: `workspace_id=eq.${workspaceId}` 
  }, handleChange)
  .subscribe();
```

### Performance Considerations

- **Debounced Updates**: Presence fetching is debounced to prevent excessive API calls
- **Visibility Optimization**: Pauses presence updates when tab is hidden
- **Cleanup Strategy**: Automatic removal of stale presence records older than 1 hour
- **Local Storage**: Session and user name persistence across page reloads

### UI Component Structure

Uses shadcn/ui components with Tailwind CSS. Key patterns:
- `UserActivityIndicator` - Shows online users with color-coded avatars
- `UserProfileCard` - Editable user name with session info
- Responsive grid layout for workspace content areas
- Loading states during database schema validation

### Error Handling Strategy

- **Schema Validation**: Checks database setup before rendering workspace
- **Connection Testing**: `components/connection-test.tsx` validates Supabase connection
- **Graceful Degradation**: Shows helpful setup instructions when database isn't configured
- **Real-time Fallbacks**: Continues working if real-time subscription fails

### Important Architecture Changes

**Authentication Removal**: The entire authentication system has been removed including:
- All `/app/auth/` routes (login, sign-up, password reset)
- `/app/protected/` directory and protected routes
- Auth-related components (AuthButton, LoginForm, etc.)
- Authentication middleware functionality
- Environment variable checks for auth

**Simplified Navigation**: New unified navbar component provides workspace creation access from any page without authentication barriers.

When working with this codebase, always test multi-user scenarios and ensure real-time features work across multiple browser sessions. The app should work immediately without any signup or login requirements.