# Quick Supabase Setup

## The Error You're Seeing

If you see a `404 (Not Found)` error when trying to access `/rest/v1/markets`, it means the `markets` table doesn't exist in your Supabase database yet.

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Migration

1. Open the file `supabase-migration.sql` in this directory
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message.

### Step 3: Verify Tables Were Created

1. Click **Table Editor** in the left sidebar
2. You should see two tables:
   - `markets`
   - `admins`

### Step 4: Add Your Admin Wallet Address

1. Go back to **SQL Editor**
2. Run this query (replace with your actual wallet address):

```sql
INSERT INTO admins (wallet_address) 
VALUES ('your-wallet-address-here')
ON CONFLICT (wallet_address) DO NOTHING;
```

### Step 5: Restart Your App

Restart your Expo dev server:

```bash
# Stop current server (Ctrl+C)
pnpm start
```

The 404 error should now be resolved!

## Troubleshooting

### Still getting 404?

1. **Check your Supabase URL**: Make sure `EXPO_PUBLIC_SUPABASE_URL` in `.env` matches your project URL
2. **Check your API key**: Make sure `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct
3. **Verify tables exist**: Go to Table Editor and confirm you see `markets` and `admins`
4. **Check RLS policies**: The migration sets up public read access, so that should work

### Getting permission errors?

The migration sets up RLS policies that allow:
- **Public read** on both tables (anyone can read)
- **Public write** for MVP (we check admin status in app logic)

If you need stricter security later, you can update the RLS policies.

