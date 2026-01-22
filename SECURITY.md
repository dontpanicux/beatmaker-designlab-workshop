# Security Guide

This document explains the security measures implemented in the Beatmaker application and best practices for keeping your data safe.

## 🔐 Supabase Security Model

### Understanding Supabase Keys

Supabase provides two types of API keys:

#### 1. **Anon Key (Public Key)** ✅ Safe to Expose
- **What it is**: The `VITE_SUPABASE_ANON_KEY` in your `.env` file
- **Purpose**: Used by client-side applications (React, Vue, etc.)
- **Security**: This key is **designed to be public** and exposed in your frontend code
- **Protection**: Row Level Security (RLS) policies protect your data, not the key itself
- **Where it goes**: In your `.env` file, bundled with your frontend code

#### 2. **Service Role Key (Secret Key)** ⚠️ NEVER Expose
- **What it is**: A powerful key that bypasses all RLS policies
- **Purpose**: Only for server-side operations, admin tasks, or backend services
- **Security**: This key has **full database access** and bypasses all security
- **Where it goes**: **ONLY** in server-side code, environment variables on your server, or secret management systems
- **NEVER**: Put this in `.env` files that are bundled with frontend code, commit it to git, or expose it in client-side code

### Why the Anon Key is Safe

The anon key is safe because:
1. **Row Level Security (RLS)**: Database policies restrict what users can access
2. **Authentication Required**: Most operations require a valid user session
3. **Limited Permissions**: The anon key can only do what your RLS policies allow

Think of it like a hotel key card:
- The anon key is like a guest key card - it only opens your own room (your data)
- The service role key is like a master key - it opens everything (admin only)

## 🛡️ Row Level Security (RLS)

Row Level Security is the primary security mechanism that protects your data. It ensures users can only access their own data.

### How RLS Works

1. **User Authentication**: When a user logs in, Supabase creates a session
2. **Policy Evaluation**: Every database query checks RLS policies
3. **Data Filtering**: Users only see/modify rows where policies allow access
4. **Automatic Enforcement**: RLS works at the database level - it's impossible to bypass from the client

### Our RLS Policies

The `beats` table has the following policies:

```sql
-- Users can only SELECT (read) their own beats
CREATE POLICY "Users can view own beats" 
  ON beats FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only INSERT (create) beats with their own user_id
CREATE POLICY "Users can insert own beats" 
  ON beats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE (modify) their own beats
CREATE POLICY "Users can update own beats" 
  ON beats FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only DELETE (remove) their own beats
CREATE POLICY "Users can delete own beats" 
  ON beats FOR DELETE 
  USING (auth.uid() = user_id);
```

**What this means**: 
- User A cannot see, modify, or delete User B's beats
- Each user can only access beats where `user_id` matches their authenticated user ID
- Even if someone intercepts the anon key, they can't access other users' data

## 🔒 Security Best Practices

### ✅ DO:

1. **Use Environment Variables**
   - Store keys in `.env` files (never commit them)
   - Use `.env.example` as a template (without real values)
   - Add `.env` to `.gitignore` (already done)

2. **Enable RLS on All Tables**
   - Every table that stores user data should have RLS enabled
   - Create policies for SELECT, INSERT, UPDATE, DELETE operations
   - Test policies to ensure they work correctly

3. **Use the Anon Key in Frontend**
   - It's safe and designed for this purpose
   - RLS policies provide the security layer

4. **Keep Service Role Key Secret**
   - Only use in server-side code
   - Store in secure secret management systems
   - Never expose in client-side code

5. **Regular Security Audits**
   - Review RLS policies periodically
   - Test that users can't access other users' data
   - Keep Supabase client library updated

### ❌ DON'T:

1. **Never Commit Secrets**
   - Don't commit `.env` files
   - Don't commit service role keys
   - Don't hardcode keys in source code

2. **Never Use Service Role Key in Frontend**
   - This bypasses all security
   - Anyone can extract it from your bundled code
   - It gives full database access

3. **Never Disable RLS**
   - Even for "admin" tables
   - Always use policies to control access
   - If you need admin access, use the service role key server-side

4. **Never Trust Client-Side Validation Alone**
   - Always validate on the server/database
   - RLS policies are the source of truth
   - Client-side checks are for UX only

## 🧪 Testing Security

### Test RLS Policies

1. **Create two test accounts** (User A and User B)
2. **User A creates a beat** and saves it
3. **User B logs in** and tries to:
   - List all beats (should only see their own)
   - Access User A's beat by ID (should fail)
   - Update User A's beat (should fail)
   - Delete User A's beat (should fail)

### Verify Environment Variables

```bash
# Check that .env is in .gitignore
cat .gitignore | grep .env

# Verify .env is not tracked by git
git ls-files | grep .env
# Should return nothing

# Check that .env.example doesn't contain real keys
cat .env.example
# Should show placeholder values only
```

## 📋 Security Checklist

Before deploying to production:

- [ ] RLS is enabled on all user data tables
- [ ] RLS policies are tested and working
- [ ] `.env` file is in `.gitignore`
- [ ] `.env` file is not committed to git
- [ ] Service role key is never used in frontend code
- [ ] Anon key is used for client-side operations
- [ ] All database operations go through RLS policies
- [ ] User authentication is required for data access
- [ ] Error messages don't leak sensitive information
- [ ] Supabase client library is up to date

## 🚨 If You Accidentally Expose a Key

### If Anon Key is Exposed:
- **Action**: Rotate the key in Supabase dashboard
- **Impact**: Low - RLS still protects your data
- **Steps**: 
  1. Go to Supabase Dashboard → Settings → API
  2. Click "Reset" next to anon key
  3. Update your `.env` file with new key
  4. Redeploy your application

### If Service Role Key is Exposed:
- **Action**: **IMMEDIATELY** rotate the key
- **Impact**: **HIGH** - This key bypasses all security
- **Steps**:
  1. Go to Supabase Dashboard → Settings → API
  2. Click "Reset" next to service role key
  3. Update all server-side code with new key
  4. Review access logs for unauthorized access
  5. Consider rotating database passwords if suspicious activity detected

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Policy Examples](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Security Model](https://supabase.com/docs/guides/platform/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - General web security best practices

## 💡 Key Takeaways

1. **Anon Key = Public**: Safe to use in frontend, protected by RLS
2. **Service Role Key = Secret**: Never expose, server-side only
3. **RLS = Security**: Your data is protected by database policies, not key secrecy
4. **Environment Variables**: Use them, don't commit them
5. **Test Your Policies**: Verify users can't access each other's data
