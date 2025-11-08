# Neon Auth Setup Instructions

## Step 1: Enable Neon Auth in Neon Console

1. **Go to your Neon Dashboard**
   - Visit: https://console.neon.tech

2. **Navigate to your project**
   - Select your `aicopywrite` project

3. **Enable Neon Auth**
   - Click on **"Auth"** in the left sidebar
   - Click **"Enable Neon Auth"** button
   - This automatically creates:
     - `neon_auth` schema
     - `neon_auth.users_sync` table

4. **Get Your Neon Auth Keys**
   - Copy the three keys shown:
     - `NEXT_PUBLIC_STACK_PROJECT_ID`
     - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
     - `STACK_SECRET_SERVER_KEY`

5. **Update your `.env` file**
   Replace the existing Stack Auth keys with the Neon Auth keys:

   ```env
   # Neon Auth environment variables (from Neon Console Auth page)
   NEXT_PUBLIC_STACK_PROJECT_ID='your-neon-auth-project-id'
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY='your-neon-auth-publishable-key'
   STACK_SECRET_SERVER_KEY='your-neon-auth-secret-key'

   # Database connection string (keep as-is)
   DATABASE_URL='your-existing-database-url'
   ```

## Step 2: Apply Database Migration

Once Neon Auth is enabled in the console:

```bash
cd frontend
npx drizzle-kit push
```

This will:
- Drop old `users` and `blog_posts` tables
- Create new `blog_posts` table
- Add foreign key to `neon_auth.users_sync`

## Step 3: Restart Your Dev Server

```bash
npm run dev
```

## Step 4: Test

1. Go to http://localhost:3001
2. Click "Get Started" or "Sign In"
3. Create a new account or sign in
4. **Check Neon Console** → Auth page → You should see the user appear automatically!
5. **Check Database** → Run: `SELECT * FROM neon_auth.users_sync;`

## How It Works

- **Automatic Sync**: When users sign up through your app, Neon Auth automatically creates records in `neon_auth.users_sync`
- **No Manual Code**: No need for `/api/sync-user` - Neon handles it
- **Foreign Keys**: Your `blog_posts` table references `neon_auth.users_sync(id)` with cascade delete

## Troubleshooting

If users don't appear:
1. Verify Neon Auth is enabled in console
2. Check that you're using the Neon Auth keys (not separate Stack project)
3. Ensure DATABASE_URL points to the same database where Neon Auth is enabled
4. Check browser console and terminal for errors
