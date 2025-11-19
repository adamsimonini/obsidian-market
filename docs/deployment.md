# Deployment Guide

## Overview

This guide covers deploying Obsidian Market to production, including:
- Supabase production setup
- Aleo testnet deployment
- Frontend deployment
- Environment configuration

## Prerequisites

- Supabase project (production)
- Aleo testnet account with credits
- Deployment platform (Vercel, Netlify, etc.)

## Phase 1: Supabase Production Setup

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project (or use existing)
3. Note down:
   - Project URL
   - Anon key
   - Service role key (keep secret!)

### 2. Run Migration Scripts

1. Go to SQL Editor in Supabase dashboard
2. Run migration from `docs/supabase-schema.md`
3. Verify tables created:
   - `markets`
   - `admins`

### 3. Configure Row Level Security

1. Review RLS policies in migration script
2. Adjust policies for production needs
3. Test with anon key

### 4. Add Admin Addresses

```sql
INSERT INTO admins (wallet_address) 
VALUES ('aleo1...'); -- Your admin address
```

## Phase 2: Aleo Testnet Deployment

### 1. Prepare Leo Program

```bash
cd leo
leo build
```

This creates `build/main.aleo` ready for deployment.

### 2. Deploy to Testnet

```bash
# Deploy using Leo CLI (when available)
leo deploy --network testnet

# Or use Aleo SDK/CLI tools
# Follow Aleo deployment documentation
```

### 3. Note Contract Address

After deployment, save:
- Contract address
- Program ID
- Deployment transaction hash

### 4. Update Frontend

Update contract address in frontend code (create config file):

```typescript
// webapp/src/config/aleo.ts
export const ALEO_CONTRACT_ADDRESS = 'aleo1...'
export const ALEO_NETWORK = 'testnet'
```

## Phase 3: Frontend Deployment

### Option A: Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd webapp
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALEO_CONTRACT_ADDRESS` (if using)

### Option B: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd webapp
   netlify deploy --prod
   ```

3. Set environment variables in Netlify dashboard

### Option C: Static Hosting

1. Build for production:
   ```bash
   cd webapp
   pnpm run build
   ```

2. Deploy `dist/` folder to:
   - GitHub Pages
   - AWS S3 + CloudFront
   - Any static hosting service

### Environment Variables

Set these in your deployment platform:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ALEO_CONTRACT_ADDRESS=aleo1...
VITE_ALEO_NETWORK=testnet
```

## Phase 4: Post-Deployment

### 1. Verify Deployment

- [ ] Supabase tables accessible
- [ ] Frontend loads correctly
- [ ] Wallet connection works
- [ ] Market creation works (admin)
- [ ] Bet placement works

### 2. Monitor

- Supabase dashboard: Check database usage
- Aleo explorer: Monitor contract transactions
- Frontend: Check error logs

### 3. Security Checklist

- [ ] RLS policies configured
- [ ] Admin addresses verified
- [ ] Environment variables secured
- [ ] No secrets in client code
- [ ] HTTPS enabled

## Testing Production

### 1. Test Market Creation

1. Connect admin wallet
2. Create test market
3. Verify in Supabase
4. Verify on-chain

### 2. Test Betting

1. Connect user wallet
2. Place test bet
3. Verify transaction on Aleo
4. Check Supabase updates

### 3. Test Resolution

1. As admin, resolve market
2. Verify payouts distributed
3. Check market status updated

## Troubleshooting

### Supabase Issues

- Check RLS policies
- Verify API keys
- Check database connection limits

### Aleo Issues

- Verify network (testnet/mainnet)
- Check contract address
- Verify transaction fees

### Frontend Issues

- Check environment variables
- Verify build output
- Check browser console for errors

## Rollback Plan

If issues occur:

1. **Supabase**: Restore from backup (if configured)
2. **Aleo**: Contract is immutable, but can deploy new version
3. **Frontend**: Revert to previous deployment

## Future: Mainnet Deployment

When ready for mainnet:

1. **Security Audit**: Get smart contracts audited
2. **Test Thoroughly**: Extensive testing on testnet
3. **Deploy Contract**: Deploy to Aleo mainnet
4. **Update Frontend**: Point to mainnet contract
5. **Monitor Closely**: Watch for issues

## Resources

- [Supabase Deployment](https://supabase.com/docs/guides/hosting)
- [Aleo Deployment](https://developer.aleo.org/testnet/getting_started/)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

