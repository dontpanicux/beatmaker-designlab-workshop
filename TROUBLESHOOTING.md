# Troubleshooting Guide

## Login Issues

### "Invalid email or password" Error

If you're getting this error but you're sure your credentials are correct:

1. **Check Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Users
   - Verify your account exists and check its status

2. **Email Confirmation**
   - Supabase may require email confirmation by default
   - Check your email inbox (and spam folder) for a confirmation email
   - Click the confirmation link if you haven't already
   - If you can't find the email, you can resend it from the Supabase dashboard

3. **Disable Email Confirmation (Development Only)**
   - Go to Authentication → Settings in Supabase dashboard
   - Under "Email Auth", you can disable "Enable email confirmations" for development
   - ⚠️ **Warning**: Only disable this for development/testing, not production

4. **Reset Password**
   - If you've forgotten your password, use the password reset feature
   - Go to Authentication → Users in Supabase dashboard
   - Find your user and click "Send password reset email"

5. **Check Environment Variables**
   - Verify your `.env` file has the correct Supabase URL and anon key
   - Make sure you're using the same Supabase project you created the account in
   - Restart your development server after changing `.env` files

### "User not authenticated" Error

This usually means:
- Your session expired
- You need to log in again
- There's an issue with the Supabase client configuration

**Solution**: Try logging out and logging back in.

### Account Not Found

If your account seems to have disappeared:

1. **Check the Correct Supabase Project**
   - Make sure you're using the same Supabase project
   - Verify your `.env` file points to the correct project URL

2. **Check Supabase Dashboard**
   - Go to Authentication → Users
   - See if your account is listed there
   - Check if it was deleted or disabled

3. **Database Migration Issues**
   - Running database migrations should NOT affect user accounts
   - The `auth.users` table is managed by Supabase and separate from your custom tables
   - If you accidentally deleted the `auth.users` table, you'll need to recreate your account

## Common Issues

### "Supabase not configured" Warning

- Create a `.env` file in the project root
- Copy values from `.env.example`
- Add your Supabase URL and anon key
- Restart your development server

### Can't Save Beats

1. **Check Authentication**
   - Make sure you're logged in
   - Check browser console for errors

2. **Check Database Migration**
   - Verify you've run the migration SQL in `supabase/migrations/001_create_beats_table.sql`
   - Check that the `beats` table exists in your Supabase dashboard

3. **Check RLS Policies**
   - Go to Table Editor → `beats` table
   - Verify "Enable RLS" is toggled ON
   - Check that policies are created

4. **Check Browser Console**
   - Open browser developer tools (F12)
   - Look for error messages in the Console tab
   - Check the Network tab for failed API requests

### Environment Variables Not Working

1. **Vite Requirements**
   - Environment variables must start with `VITE_` to be accessible in frontend code
   - Restart the dev server after changing `.env` files
   - Variables are only available at build time, not runtime

2. **Check File Location**
   - `.env` file must be in the project root (same level as `package.json`)
   - Not in `src/` or any subdirectory

## Getting Help

If you're still having issues:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages
   - Take a screenshot of any errors

2. **Check Supabase Logs**
   - Go to your Supabase dashboard
   - Check Logs → API Logs for errors
   - Check Logs → Postgres Logs for database errors

3. **Verify Setup**
   - Confirm you've completed all setup steps in `supabase/README.md`
   - Verify your database migration ran successfully
   - Check that RLS policies are enabled

## Debugging Tips

### Enable Console Logging

The app logs authentication errors to the browser console. Open Developer Tools (F12) and check the Console tab for detailed error messages.

### Test Supabase Connection

You can test your Supabase connection by checking the browser's Network tab:
1. Open Developer Tools → Network tab
2. Try to log in
3. Look for requests to `supabase.co`
4. Check if they're successful (200 status) or failing (4xx/5xx)

### Verify User Account

In Supabase Dashboard:
1. Go to Authentication → Users
2. Find your user account
3. Check:
   - Email is confirmed (green checkmark)
   - Account is not disabled
   - Created date matches when you signed up
