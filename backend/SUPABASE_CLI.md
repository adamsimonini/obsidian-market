# Using Supabase CLI

The Supabase CLI allows you to manage your database from the terminal instead of the web UI.

## Installation

### macOS (Homebrew)
```bash
brew install supabase/tap/supabase
```

### npm (Cross-platform)
```bash
npm install -g supabase
```

supabase db reset

### Verify Installation
```bash
supabase --version
```

## Setup

### 1. Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate.

### 2. Link Your Project
```bash
cd webapp
supabase link --project-ref your-project-ref
```

To find your project ref:
- Go to your Supabase project settings
- Look for "Reference ID" or check the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

Alternatively, you can link by project ID:
```bash
supabase link --project-id your-project-id
```

### 3. Verify Connection
```bash
supabase status
```

## Running SQL Scripts

### Run Migration
```bash
supabase db push
```
This will run all migrations in the `supabase/migrations` directory.

### Run SQL File Directly
```bash
# Run a specific SQL file
supabase db execute --file supabase-migration.sql

# Or pipe SQL directly
cat supabase-migration.sql | supabase db execute
```

### Run SQL from Terminal
```bash
supabase db execute --sql "SELECT * FROM markets;"
```

## Recommended Workflow

### Option 1: Use Migrations Directory (Recommended)

1. Create migrations directory:
```bash
mkdir -p supabase/migrations
```

2. Copy your migration:
```bash
cp supabase-migration.sql supabase/migrations/20240101000000_initial_schema.sql
```

3. Run migrations:
```bash
supabase db push
```

### Option 2: Direct SQL Execution

Run SQL files directly:
```bash
# Run migration
supabase db execute --file supabase-migration.sql

# Insert test market
supabase db execute --file insert-test-market.sql
```

## Useful Commands

```bash
# Check database status
supabase status

# View database logs
supabase db logs

# Reset database (⚠️ destructive)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --linked > types/supabase-generated.ts

# Start local Supabase (for local development)
supabase start
```

## Quick Setup Script

You can create a setup script to automate the initial setup:

```bash
#!/bin/bash
# setup-supabase.sh

echo "Running Supabase migration..."
supabase db execute --file supabase-migration.sql

echo "Inserting test market..."
supabase db execute --file insert-test-market.sql

echo "Done! Check your app now."
```

Make it executable:
```bash
chmod +x setup-supabase.sh
./setup-supabase.sh
```

