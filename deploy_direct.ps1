$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"

Write-Host "--- DIRECT DEPLOYMENT STARTED ---" -ForegroundColor Cyan

# 1. Build Local (Ensure we have the latest version)
Write-Host "1. Building Project Locally..."
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

# 2. Compress dist folder
Write-Host "2. Compressing 'dist' folder..."
if (Test-Path "site.tar.gz") { Remove-Item "site.tar.gz" }
tar -czf site.tar.gz dist

# 3. Upload to Server
Write-Host "3. Uploading to Server (This might take a moment)..."
# Using scp to copy the file
scp -i $KeyPath -o StrictHostKeyChecking=no site.tar.gz "$User@$ServerIP`:~/"

# 4. Restart Server with New Files
Write-Host "4. Restarting Server..."
$RemoteScript = @'
echo "--> Unpacking Site..."
rm -rf ~/dist
tar -xzf site.tar.gz

echo "--> Cleaning Old Containers..."
docker stop acoria-container 2>/dev/null || true
docker rm acoria-container 2>/dev/null || true

# Kill any other process on port 80
sudo fuser -k 80/tcp || true

echo "--> Starting Nginx..."
# Run Nginx, mapping the uploaded 'dist' folder to the html directory
docker run -d --name acoria-container -p 80:80 -v /home/ubuntu/dist:/usr/share/nginx/html nginx:alpine

echo "--> SUCCESS!"
'@

$RemoteScript = $RemoteScript -replace "`r", ""
$RemoteScript | ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "bash -s"

Write-Host "--- DONE! Check http://$ServerIP ---" -ForegroundColor Green
Read-Host -Prompt "Press Enter to exit"
