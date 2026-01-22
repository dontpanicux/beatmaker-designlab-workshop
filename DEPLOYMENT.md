# 🚀 Deployment Guide

This guide will help you deploy the Beatmaker app to Netlify.

## Prerequisites

- ✅ Code pushed to GitHub
- ✅ Supabase project created and configured
- ✅ Database migrations run (see `supabase/migrations/`)
- ✅ Environment variables ready (from your local `.env` file)

## Step-by-Step Deployment

### 1. Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in (you can use GitHub to sign in)

### 2. Connect GitHub Repository

1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Choose **"GitHub"** and authorize Netlify to access your repositories
3. Select your repository: `beatmaker-designlab-workshop`
4. Netlify will automatically detect the build settings from `netlify.toml`

### 3. Configure Build Settings

The `netlify.toml` file should auto-configure these, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `20` (or latest LTS)

### 4. Set Environment Variables

**Critical Step**: You must add your Supabase credentials as environment variables.

1. In Netlify, go to **Site settings** → **Environment variables**
2. Click **"Add variable"** and add:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL | From Supabase dashboard → Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase dashboard → Settings → API |

   **Example**:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Click **"Save"**

**Important**: 
- These are the same values from your local `.env` file
- The anon key is safe to use in frontend code (protected by RLS)
- Never use the service role key here

### 5. Deploy

1. Click **"Deploy site"** (or it may auto-deploy)
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, your site will be live at: `https://your-site-name.netlify.app`

### 6. Verify Deployment

1. Visit your deployed site URL
2. Test authentication (sign up/login)
3. Test beat creation and saving
4. Check browser console for any errors

### 7. Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's instructions to configure DNS

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Ensure Node version is set to 20 or latest LTS
- Verify all dependencies are in `package.json`

### Environment Variables Not Working

- Make sure variable names start with `VITE_` (required for Vite)
- Redeploy after adding environment variables
- Check that values match your local `.env` file

### Authentication Not Working

- Verify Supabase environment variables are set correctly
- Check that RLS policies are enabled in Supabase
- Ensure database migrations have been run
- Check browser console for errors

### 404 Errors on Page Refresh

- The `netlify.toml` includes redirect rules for SPA routing
- If you add client-side routing later, the redirects should handle it

## Continuous Deployment

Once connected, Netlify will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Run build on every commit
- ✅ Show build status in GitHub PRs (if configured)

## Updating Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Edit or add variables
3. Click **"Save"**
4. Trigger a new deploy (or push a commit)

## Rollback

If something goes wrong:
1. Go to **Deploys** tab
2. Find a previous successful deploy
3. Click **"..."** → **"Publish deploy"**

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
