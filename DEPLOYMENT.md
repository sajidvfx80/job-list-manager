# Deployment Guide

This guide will help you deploy the Job List Manager to Netlify with Neon PostgreSQL database.

## Prerequisites

1. A GitHub account
2. A Netlify account (sign up at https://netlify.com)
3. A Neon account (sign up at https://neon.tech)

## Step 1: Set up Neon Database

1. Go to https://console.neon.tech and sign in
2. Create a new project
3. Copy your connection string (it will look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)
4. Keep this connection string safe - you'll need it for Netlify environment variables

## Step 2: Push Code to GitHub

1. Initialize a git repository in your project folder:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub (https://github.com/new)

3. Push your code to GitHub:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

1. Go to https://app.netlify.com and sign in
2. Click "Add new site" → "Import an existing project"
3. Select "GitHub" and authorize Netlify to access your repositories
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Show advanced" and add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon connection string from Step 1
7. Click "Deploy site"

## Step 4: Verify Deployment

1. Wait for the build to complete (usually 1-2 minutes)
2. Your site will be available at a URL like: `https://your-site-name.netlify.app`
3. Test the application:
   - Try adding a new job
   - Try adding a new client
   - Check if data persists after refresh

## Step 5: Set up Custom Domain (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` environment variable is set correctly in Netlify
- Check that your Neon database is active and accessible
- Ensure the connection string includes `?sslmode=require`

### Build Failures

- Check the build logs in Netlify dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version (should be 18+)

### API Errors

- Check Netlify function logs in the dashboard
- Verify the function files are in `netlify/functions/` directory
- Ensure CORS headers are properly set

## Local Development

To test locally with Netlify Functions:

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Create a `.env` file in the root directory:
```
DATABASE_URL=your_neon_connection_string
```

3. Run the development server:
```bash
npm run netlify:dev
```

This will start both the Vite dev server and Netlify Functions locally.

## Environment Variables

Required environment variables:
- `DATABASE_URL`: Neon PostgreSQL connection string

Optional environment variables:
- `VITE_API_URL`: API base URL (defaults to `/api`)

## Database Schema

The application automatically creates the following tables on first run:
- `clients`: Stores client names
- `employees`: Stores employee names
- `jobs`: Stores all job information

Default data (clients and employees) is automatically inserted on initialization.

