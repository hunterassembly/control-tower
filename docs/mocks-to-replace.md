# Mocks and Temporary Implementations

This file tracks all mock implementations, placeholder data, and temporary workarounds that need to be replaced with real functionality before production.

## Authentication & Invite System

### 1. Mock Invite Token Redemption Function
**Location**: `src/components/login-form.tsx` (lines ~37-90)
**Mock**: `consumeInviteToken()` function with hardcoded `test-invite-123` token handling
**What it does**: 
- Simulates API delay with `setTimeout`
- Creates mock project membership for user ID with project ID `49b31685-877b-4d32-9b03-c0796876e33d`
- Returns mock success response with project name "Outpost" and role "designer"

**To Replace With**: 
- Real Supabase Edge Function deployment of `supabase/functions/consume-invite-token/index.ts`
- Remove the `if (token === 'test-invite-123')` mock block
- Use actual Edge Function URL: `${supabaseUrl}/functions/v1/consume-invite-token`

### 2. Hardcoded Test Project Data
**Location**: Mock function in `src/components/login-form.tsx`
**Mock Values**:
- Project ID: `49b31685-877b-4d32-9b03-c0796876e33d`
- Project Name: `Outpost`
- Default Role: `designer`

**To Replace With**: 
- Dynamic project data from actual invite tokens in database
- Real project names and roles from `invite_token` table

### 3. Test Invite Token in Database
**Location**: Database table `invite_token`
**Mock Record**: Token `test-invite-123` manually inserted for testing
**To Replace With**: 
- Admin-generated invite tokens through proper UI
- Remove test token from production database

## Edge Functions

### 1. Consume Invite Token Function (Created but Not Deployed)
**Location**: `supabase/functions/consume-invite-token/index.ts`
**Status**: Function file exists but not deployed due to Supabase CLI limitations
**To Deploy**: 
- Use proper Supabase CLI once available
- Or deploy via Supabase Dashboard manually
- Test with real tokens instead of mock

### 2. Generate Invite Token Function (Not Created Yet)
**Status**: Planned for Task 8 - Admin invite token generation
**To Create**: Real Edge Function for admins to generate invite tokens

## Placeholder Pages & Routes

### 1. Projects Page
**Location**: `src/app/projects/page.tsx`
**Status**: Basic placeholder page
**To Replace With**: Real projects dashboard with user's project memberships

### 2. Individual Project Pages
**Location**: `src/app/projects/[id]/page.tsx`
**Status**: Not created yet (returns 404)
**To Create**: Individual project pages that users get redirected to after joining

## Configuration & Environment

### 1. Hardcoded Supabase URLs
**Location**: `src/components/login-form.tsx` (lines ~95-96)
**Mock**: 
```typescript
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```
**To Replace With**: Environment variables for production URLs

## Next Steps Priority

1. **HIGH**: Deploy `consume-invite-token` Edge Function to production
2. **HIGH**: Create admin UI for generating invite tokens (Task 8)
3. **MEDIUM**: Replace hardcoded project data with dynamic values
4. **MEDIUM**: Create real projects dashboard and individual project pages
5. **LOW**: Clean up test data from database
6. **LOW**: Replace hardcoded URLs with environment variables

## Notes

- All mock implementations include detailed comments for easy identification
- Mock data is consistent and uses real UUIDs for testing
- Error handling is production-ready even in mock implementations
- Debug logging should be reduced/removed for production

---
**Last Updated**: 2025-05-23
**Status**: 7 of 12 tasks complete in login-and-invite-flow slice 