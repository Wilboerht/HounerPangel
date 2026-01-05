# GitHub OAuth Setup Guide

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Sysbase Blog` (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. You'll see your **Client ID** - copy it
6. Click **"Generate a new client secret"** and copy the secret

## Step 2: Update Environment Variables

Open `.env` file and update:

```env
GITHUB_ID="paste-your-client-id-here"
GITHUB_SECRET="paste-your-client-secret-here"
```

## Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Update `.env`:

```env
NEXTAUTH_SECRET="paste-generated-secret-here"
```

## Step 4: Restart Dev Server

Stop the current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

## Step 5: Test

1. Visit http://localhost:3000/blog/welcome
2. Scroll to comments section
3. Click "Sign in with GitHub"
4. Authorize the app
5. Try posting a comment!

## For Production

When deploying to production (e.g., Vercel):

1. Create another OAuth App with production URLs
2. Set environment variables in your hosting platform
3. Update `NEXTAUTH_URL` to your production domain
