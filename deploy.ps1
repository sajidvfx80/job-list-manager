# Deployment Script for Job List Manager
# This script helps you deploy to Netlify

Write-Host "=== Job List Manager - Deployment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
    Write-Host "Git repository initialized!" -ForegroundColor Green
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Get your Neon Database Connection String:" -ForegroundColor Yellow
Write-Host "   - Go to: https://console.neon.tech/app/projects/fancy-water-66746602" -ForegroundColor White
Write-Host "   - Click on 'Connection Details' or 'Connection String'" -ForegroundColor White
Write-Host "   - Copy the connection string" -ForegroundColor White
Write-Host ""
Write-Host "2. Create GitHub Repository:" -ForegroundColor Yellow
Write-Host "   - Go to: https://github.com/new" -ForegroundColor White
Write-Host "   - Repository name: job-list-manager (or any name you prefer)" -ForegroundColor White
Write-Host "   - Make it private or public (your choice)" -ForegroundColor White
Write-Host "   - Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "3. Push code to GitHub:" -ForegroundColor Yellow
Write-Host "   Run these commands:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Initial commit - Job List Manager'" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/sajidvfx80/job-list-manager.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host "   (You'll be prompted for your GitHub password)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure Netlify:" -ForegroundColor Yellow
Write-Host "   - Go to: https://app.netlify.com/sites/papaya-peony-40bf64" -ForegroundColor White
Write-Host "   - Go to: Site settings → Environment variables" -ForegroundColor White
Write-Host "   - Click 'Add variable'" -ForegroundColor White
Write-Host "   - Key: DATABASE_URL" -ForegroundColor White
Write-Host "   - Value: (paste your Neon connection string)" -ForegroundColor White
Write-Host "   - Click 'Save'" -ForegroundColor White
Write-Host ""
Write-Host "5. Connect GitHub to Netlify:" -ForegroundColor Yellow
Write-Host "   - In Netlify, go to: Site settings → Build & deploy" -ForegroundColor White
Write-Host "   - Under 'Continuous Deployment', click 'Link repository'" -ForegroundColor White
Write-Host "   - Select GitHub and authorize" -ForegroundColor White
Write-Host "   - Select your repository: sajidvfx80/job-list-manager" -ForegroundColor White
Write-Host "   - Build command: npm run build" -ForegroundColor White
Write-Host "   - Publish directory: dist" -ForegroundColor White
Write-Host "   - Click 'Deploy site'" -ForegroundColor White
Write-Host ""
Write-Host "6. Trigger Deploy:" -ForegroundColor Yellow
Write-Host "   - After connecting, Netlify will auto-deploy" -ForegroundColor White
Write-Host "   - Or go to Deploys → Trigger deploy → Deploy site" -ForegroundColor White
Write-Host ""
Write-Host "Your site will be live at: https://papaya-peony-40bf64.netlify.app" -ForegroundColor Green
Write-Host ""

