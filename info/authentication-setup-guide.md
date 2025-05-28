# ExamCraft Authentication Setup Guide

## Issues Fixed

✅ **SignOut Redirect**: Now properly redirects to homepage after signout  
✅ **Metadata Viewport Warnings**: Fixed Next.js 15 viewport configuration  
✅ **Database Schema**: Corrected Supabase Auth integration  
✅ **Error Handling**: Improved error logging and user feedback  
✅ **Form Validation**: Enhanced form validation and user experience

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To get these values:**

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. Copy the service_role key (keep this secret!)

### 2. Database Setup

Run the corrected database schema in your Supabase SQL editor:

```sql
-- Use the corrected-database-schema.sql file
-- This creates the users table with proper Supabase Auth integration
```

**Key changes from original schema:**

- Removed `password_hash` field (Supabase handles this)
- Added `supabase_auth_id` field linking to `auth.users`
- Updated triggers to work without password_hash
- Proper RLS policies for security

### 3. Supabase Auth Configuration

In your Supabase dashboard:

1. **Authentication > Settings**:

   - Enable email confirmations (recommended)
   - Set up email templates
   - Configure redirect URLs

2. **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/auth/signin`

### 4. Testing the Authentication Flow

#### Sign Up Process:

1. User fills registration form
2. Supabase creates auth user with metadata
3. Database trigger creates user profile automatically
4. Email verification sent (if enabled)
5. User can sign in after verification

#### Sign In Process:

1. User enters credentials
2. Supabase validates authentication
3. User profile fetched from database
4. Redirected to dashboard

#### Sign Out Process:

1. User clicks sign out
2. Supabase session cleared
3. User redirected to homepage ✅

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:

   - Check your environment variables
   - Ensure `.env.local` is in project root
   - Restart development server after adding env vars

2. **"User not found" after signup**:

   - Check if database triggers are created
   - Verify RLS policies are enabled
   - Check Supabase logs for trigger errors

3. **Email not sending**:

   - Configure SMTP in Supabase Auth settings
   - Check spam folder
   - Verify email templates are set up

4. **Redirect issues**:
   - Check URL configuration in Supabase
   - Verify redirect URLs match your domain

### Debug Mode:

The authentication hook now includes console logging for debugging:

- Check browser console for detailed error messages
- Monitor Supabase dashboard logs
- Use Supabase Auth debug mode in development

## Security Notes

- Never commit `.env.local` to version control
- Use environment-specific URLs for production
- Enable RLS policies on all user-related tables
- Regularly rotate API keys
- Use service role key only for server-side operations

## Next Steps

With authentication working properly, you can now:

1. Build quiz generation features
2. Implement exam functionality
3. Add flashcard system
4. Create analytics dashboard
5. Add file upload capabilities

The authentication system is now robust and ready for production use!
