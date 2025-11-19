# Local Supabase Development

When you run `supabase start`, Supabase runs locally using Docker. Here's what you need to know about the output:

## What Stays the Same

✅ **URLs and Ports** (consistent):
- API URL: `http://localhost:54323/project/default`
- Database URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio URL: `http://127.0.0.1:54323`
- These ports are configured in `supabase/config.toml` and stay consistent

✅ **Database Credentials** (consistent):
- Username: `postgres`
- Password: `postgres`
- These are set in the config and don't change

## What Changes

⚠️ **API Keys** (regenerated on reset):
- `sb_publishable_*` (anon/public key)
- `sb_secret_*` (service role key)
- S3 Access/Secret keys

These keys are **regenerated** when you:
- Run `supabase stop` and `supabase start` again
- Run `supabase db reset`
- Delete and recreate the local instance

## Solution: Save Keys to .env

For local development, you should save the keys to your `.env` file so your app can connect:

### 1. Create/Update `.env` in `webapp/`:

```env
# Local Supabase (from supabase start output)
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 2. Update When Keys Change

If you reset Supabase (`supabase db reset` or restart), you'll need to:
1. Copy the new `sb_publishable_*` key from the output
2. Update your `.env` file
3. Restart your Expo app

## Better Approach: Use `supabase status`

Instead of manually copying keys, you can get them programmatically:

```bash
# Get the anon key
supabase status | grep "anon key" | awk '{print $3}'

# Or use the API to get keys
supabase status --output json
```

## Persisting Keys (Optional)

If you want keys to persist across restarts, you can:

1. **Set keys in `config.toml`** (but this is not recommended for security)
2. **Use a script** to automatically update `.env`:

```bash
#!/bin/bash
# scripts/update-local-env.sh

ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
API_URL="http://127.0.0.1:54321"

cat > ../webapp/.env.local << EOF
EXPO_PUBLIC_SUPABASE_URL=$API_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF

echo "Updated .env.local with local Supabase credentials"
```

## Recommended Workflow

1. **Start Supabase**:
   ```bash
   cd backend
   supabase start
   ```

2. **Copy the anon key** to `webapp/.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<paste from output>
   ```

3. **Run migrations**:
   ```bash
   supabase db reset  # This runs all migrations
   # OR
   supabase db execute --file supabase-migration.sql
   ```

4. **Insert test data**:
   ```bash
   supabase db execute --file insert-test-market.sql
   ```

5. **Start your app**:
   ```bash
   cd ../webapp
   pnpm start
   ```

## When Keys Change

If you see connection errors after restarting Supabase:
1. Run `supabase status` to see current keys
2. Update `webapp/.env` with the new anon key
3. Restart your Expo app

## Accessing Local Supabase Studio

Open http://127.0.0.1:54323 in your browser to:
- View tables
- Run SQL queries
- Manage data
- View API docs

This is like the Supabase dashboard, but for your local instance.

