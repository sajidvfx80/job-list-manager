# Netlify Environment Variable Setup

## Your Neon Database Connection String

```
postgresql://neondb_owner:npg_s9o4kCYxJUHK@ep-broad-darkness-aeonh7dg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Steps to Add to Netlify

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/sites/papaya-peony-40bf64
   - Or: https://app.netlify.com

2. **Navigate to Environment Variables**
   - Click on your site: **papaya-peony-40bf64**
   - Go to: **Site settings** (in the top menu)
   - Click: **Environment variables** (in the left sidebar)

3. **Add the Variable**
   - Click: **Add variable** button
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the entire connection string above
   - Click: **Save**

4. **Verify**
   - You should see `DATABASE_URL` in the list
   - Make sure it's set for **All scopes** (or at least **Production**)

5. **Trigger Redeploy**
   - Go to: **Deploys** tab
   - Click: **Trigger deploy** → **Deploy site**
   - Wait for build to complete

## Important Notes

- ⚠️ **Never commit this connection string to git** - it contains your database password
- ✅ The connection string is stored securely in Netlify's environment variables
- ✅ It will be available to all Netlify Functions automatically
- ✅ The database tables will be created automatically on first API call

## Testing the Connection

After deployment, test by:
1. Visiting: https://papaya-peony-40bf64.netlify.app
2. Clicking "Add New Job"
3. Filling out the form and saving
4. If it saves successfully, the database connection is working!

