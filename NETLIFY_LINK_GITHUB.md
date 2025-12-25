# Step-by-Step: Link GitHub Repository to Netlify

## Step 2: Link GitHub Repository to Netlify

### Detailed Instructions:

1. **Go to Netlify Dashboard**
   - Open your browser
   - Go to: https://app.netlify.com
   - Sign in to your Netlify account
   - Find your site: **papaya-peony-40bf64**
   - Click on it to open the site dashboard

2. **Navigate to Build & Deploy Settings**
   - In the top menu, click: **"Site settings"** (gear icon or text link)
   - In the left sidebar, look for: **"Build & deploy"**
   - Click on: **"Build & deploy"**

3. **Link Your Repository**
   - Scroll down to the section called: **"Continuous Deployment"**
   - You'll see a section that says: **"Builds"** or **"Connected repository"**
   - If you see **"Link repository"** button, click it
   - If you see **"Change repository"** or **"Edit settings"**, click that instead

4. **Connect to GitHub**
   - A popup/modal will appear
   - Click: **"GitHub"** (you might see other options like GitLab, Bitbucket)
   - You'll be asked to authorize Netlify to access your GitHub account
   - Click: **"Authorize Netlify"** or **"Authorize"**
   - You might need to enter your GitHub password or confirm with 2FA

5. **Select Your Repository**
   - After authorization, you'll see a list of your GitHub repositories
   - Look for: **"sajidvfx80/job-list-manager"**
   - Click on it to select it

6. **Configure Build Settings**
   - After selecting the repository, you'll see build settings:
   - **Branch to deploy**: Should be `main` (or `master`)
   - **Build command**: Type or verify it says: `npm run build`
   - **Publish directory**: Type or verify it says: `dist`
   - **Base directory**: Leave this empty (unless you have a subdirectory)

7. **Save Settings**
   - Click the **"Save"** or **"Deploy site"** button
   - Netlify will automatically start a deployment

## Visual Guide:

```
Netlify Dashboard
├── Site: papaya-peony-40bf64
│   ├── [Click] Site settings (gear icon)
│   │   ├── [Click] Build & deploy (left sidebar)
│   │   │   ├── Continuous Deployment section
│   │   │   │   ├── [Click] Link repository
│   │   │   │   │   ├── [Click] GitHub
│   │   │   │   │   │   ├── [Authorize] Netlify
│   │   │   │   │   │   │   ├── [Select] sajidvfx80/job-list-manager
│   │   │   │   │   │   │   │   ├── Build command: npm run build
│   │   │   │   │   │   │   │   ├── Publish directory: dist
│   │   │   │   │   │   │   │   └── [Click] Save
```

## Alternative: If "Link repository" is not visible

If you don't see "Link repository" button:

1. Go to: **Site settings** → **Build & deploy**
2. Look for: **"Build settings"** section
3. Click: **"Edit settings"** or **"Change repository"**
4. Follow steps 4-7 above

## What Happens Next:

After linking:
- ✅ Netlify will automatically detect your GitHub repository
- ✅ It will start building your site
- ✅ You'll see a deployment in progress in the "Deploys" tab
- ✅ The build will take 2-3 minutes

## Troubleshooting:

**Can't find "Link repository"?**
- Make sure you're in **Site settings** → **Build & deploy**
- Look for **"Continuous Deployment"** section
- If it says "No repository connected", there should be a button to connect

**GitHub authorization fails?**
- Make sure you're logged into GitHub
- Try authorizing again
- Check if you have 2FA enabled (might need a Personal Access Token)

**Repository not showing in list?**
- Make sure the repository exists: https://github.com/sajidvfx80/job-list-manager
- Make sure you authorized Netlify to access your GitHub account
- Try refreshing the page

## Quick Checklist:

- [ ] Opened Netlify dashboard
- [ ] Clicked on site: papaya-peony-40bf64
- [ ] Went to: Site settings → Build & deploy
- [ ] Clicked: Link repository (or Edit settings)
- [ ] Selected: GitHub
- [ ] Authorized Netlify
- [ ] Selected repository: sajidvfx80/job-list-manager
- [ ] Set build command: npm run build
- [ ] Set publish directory: dist
- [ ] Clicked: Save
- [ ] Deployment started automatically

