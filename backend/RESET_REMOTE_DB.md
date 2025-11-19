# Resetting Remote Supabase Database

⚠️ **WARNING**: Resetting the remote database will **DELETE ALL DATA** and recreate it from your local migrations.

## Prerequisites

1. **Link your project** (if not already linked):
   ```bash
   cd backend
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   To find your project ref:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Check the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
   - Or go to Settings → General → Reference ID

2. **Verify you're linked**:
   ```bash
   supabase status
   ```
   Should show your linked project info.

## Reset Remote Database

```bash
cd backend
supabase db reset --linked
```

This will:
1. ⚠️ **Delete all data** in your remote database
2. Drop all tables, functions, triggers, etc.
3. Run all migrations from `supabase/migrations/` in order
4. **NOT** run seed files (seeds are local-only)

## What Happens

- ✅ All migrations in `supabase/migrations/` will be applied
- ❌ All existing data will be deleted
- ❌ Seed files will NOT run (they're local-only)

## After Reset

If you want seed data on remote, you have options:

### Option 1: Run seed manually
```bash
supabase db push --include-seed
```

### Option 2: Create a migration for seed data
Create a migration file that includes your seed data, then it will run automatically.

## Alternative: Push Migrations Without Reset

If you just want to apply new migrations without deleting data:

```bash
supabase db push
```

This applies only new migrations that haven't been run yet.

## Safety Tips

1. **Backup first** (if you have important data):
   - Export data via Supabase dashboard
   - Or use `pg_dump` if you have database access

2. **Test locally first**:
   ```bash
   supabase db reset --local
   ```
   This resets your local database to test migrations.

3. **Verify migrations are correct** before resetting remote.

