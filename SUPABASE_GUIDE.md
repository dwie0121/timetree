# Connecting SyncTree to Supabase

This guide outlines the steps required to transition SyncTree from local simulation (BroadcastChannel) to a real-time production database using **Supabase**.

## 1. Prerequisites
- A [Supabase account](https://supabase.com/)
- A new Supabase Project

## 2. Database Schema

Execute the following SQL in your Supabase SQL Editor to create the `events` table:

```sql
-- Create the events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  category TEXT NOT NULL,
  created_by TEXT NOT NULL,
  attendees TEXT[] DEFAULT '{}',
  amount DECIMAL(12, 2),
  transaction_type TEXT CHECK (transaction_type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone with the workspace_id to read/write 
-- (Note: For production, implement proper Auth)
CREATE POLICY "Allow workspace access" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 3. Configuration

Add the following environment variables to your project:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Implementation Steps

### Install Supabase Client
Update your `package.json` and run install:
`npm install @supabase/supabase-js`

### Initialize Client
Create a new file `services/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Update App.tsx logic
Replace the `useEffect` and `handleSaveEvent` logic in `App.tsx`:

1. **Fetching Events**:
```typescript
const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('workspace_id', getWorkspaceId());
  
  if (data) setEvents(data);
};
```

2. **Real-time Subscription**:
Replace `BroadcastChannel` with Supabase Realtime:
```typescript
const subscription = supabase
  .channel('public:events')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
    fetchEvents(); // Refresh data on any change
  })
  .subscribe();
```

3. **Saving Events**:
```typescript
const handleSaveEvent = async (eventData) => {
  const { error } = await supabase
    .from('events')
    .upsert({
      ...eventData,
      workspace_id: getWorkspaceId(),
      id: editingEvent?.id || undefined // Supabase generates UUID if undefined
    });
};
```

## 5. Security Note
This setup uses a simple `workspace_id` filter. For a production app, use **Supabase Auth** and link the `created_by` field to the `auth.users.id` to ensure users can only see their authorized workspaces.