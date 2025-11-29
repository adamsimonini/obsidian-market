# Supabase Setup Guide

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Basic knowledge of SQL and database concepts

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `obsidian-market` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest region
   - **Pricing Plan**: Free tier is sufficient for MVP
4. Click "Create new project"
5. Wait 2-3 minutes for project to initialize

## Step 2: Get Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values (you'll need these for environment variables):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (keep this secret! Only for server-side use)

## Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the SQL migration script from `docs/supabase-schema.md`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify tables were created:
   - Go to **Table Editor**
   - You should see `markets` and `admins` tables

## Step 4: Add Initial Admin

1. Go to **SQL Editor** → **New query**
2. Run this SQL (replace with your admin wallet address):

```sql
INSERT INTO admins (wallet_address) 
VALUES ('aleo1qg23nrrrlf6h7fqq7amk9wqzs06sluh7tm5y6lgg9svpqpck0qqqv9h0sw');
```

3. Verify admin was added:
   - Go to **Table Editor** → `admins` table
   - You should see your wallet address

## Step 5: Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:**
- Use `VITE_` prefix for Vite to expose these to the frontend
- Never commit `.env` file to git (should be in `.gitignore`)
- The `anon` key is safe to expose in frontend code

## Step 6: Test Connection

1. Install Supabase client in frontend:
   ```bash
   cd frontend
   pnpm add @supabase/supabase-js
   ```

2. Test connection (you'll do this in code, but verify credentials work)

## Step 7: Configure Row Level Security (RLS)

For MVP, we'll use a simplified RLS approach:

1. **For markets table:**
   - Public read: Already configured
   - Admin write: Will be handled in application logic (check admin status before allowing writes)

2. **For admins table:**
   - Public read: Already configured
   - Admin write: Will be handled in application logic

**Note:** For production, you may want to implement proper JWT-based authentication with Supabase Auth, but for MVP, we'll handle admin checks in the frontend.

## Troubleshooting

### Migration fails
- Check that UUID extension is enabled
- Verify you have proper permissions
- Check SQL syntax errors in the error message

### Can't see tables
- Refresh the Table Editor
- Check that migration ran successfully (look for success message)

### RLS blocking queries
- For MVP, you can temporarily disable RLS for testing:
  ```sql
  ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
  ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
  ```
- Re-enable when ready:
  ```sql
  ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
  ```

## Next Steps

After setup is complete:
1. Add Supabase client to frontend (Phase 3)
2. Test creating a market via Supabase
3. Integrate with Aleo smart contracts

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

