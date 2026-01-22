# Supabase Setup Guide

This directory contains database migrations and setup instructions for the Beatmaker application.

## Quick Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to finish provisioning (takes a few minutes)

2. **Run the Migration**
   - Open your Supabase project dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `migrations/001_create_beats_table.sql`
   - Click "Run" to execute the migration

3. **Verify RLS is Enabled**
   - Go to Table Editor → `beats` table
   - Check that "Enable RLS" is toggled ON
   - You should see 4 policies listed:
     - Users can view own beats
     - Users can insert own beats
     - Users can update own beats
     - Users can delete own beats

4. **Get Your API Keys**
   - Go to Settings → API
   - Copy your Project URL → use as `VITE_SUPABASE_URL`
   - Copy your `anon` `public` key → use as `VITE_SUPABASE_ANON_KEY`
   - ⚠️ **DO NOT** copy the `service_role` key - it's for server-side use only!

5. **Configure Your App**
   - Copy `.env.example` to `.env` in the project root
   - Add your Supabase URL and anon key
   - Restart your development server

## Testing Security

After setup, test that Row Level Security is working:

1. **Create two test accounts** (User A and User B)
2. **User A**: Log in and create a beat, save it
3. **User B**: Log in and try to:
   - List all beats (should only see User B's beats, not User A's)
   - Access User A's beat by ID (should fail with permission error)
   - Update User A's beat (should fail)
   - Delete User A's beat (should fail)

If User B can access User A's data, RLS is not working correctly. Check:
- RLS is enabled on the `beats` table
- Policies are correctly created
- User authentication is working

## Migration Files

- `001_create_beats_table.sql` - Creates the beats table with RLS policies

## Using Supabase CLI (Optional)

If you prefer using the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Troubleshooting

### "Row Level Security" error when querying
- **Cause**: RLS is enabled but no policies exist, or policies are incorrect
- **Fix**: Run the migration SQL again, ensure all policies are created

### "permission denied for table beats"
- **Cause**: User is not authenticated, or RLS policies are blocking access
- **Fix**: Ensure user is logged in, and policies check `auth.uid() = user_id`

### Can't see any beats after creating them
- **Cause**: RLS policy might be too restrictive, or user_id is not set correctly
- **Fix**: Check that `user_id` matches `auth.uid()` when inserting beats

## Security Reminders

- ✅ Anon key is safe to use in frontend code
- ✅ RLS policies protect your data
- ❌ Never use service role key in frontend
- ❌ Never commit `.env` files to git
- ❌ Never disable RLS on user data tables

See [`../SECURITY.md`](../SECURITY.md) for comprehensive security documentation.
