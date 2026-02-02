$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"
$RemotePath = "~/elden-aces"

# Script to run on server
$ScriptBlock = @"
echo "--- STARTING DEPLOYMENT ---"
echo "Target: $RemotePath"

# 1. Klasöre git
if [ -d "$RemotePath" ]; then
    cd "$RemotePath"
elif [ -d "~/acoria/elden-aces" ]; then
    cd ~/acoria/elden-aces
else
    echo "ERROR: Could not find project directory!"
    exit 1
fi

echo "Current Directory: $(pwd)"

# 2. Son kodları çek
echo "Pulling latest code..."
git reset --hard
git pull

# 3. Docker build ve restart
if [ -f docker-compose.yml ]; then
    echo "Found docker-compose.yml, rebuilding..."
    docker-compose down
    docker-compose up -d --build
else
    echo "No docker-compose.yml found, using standard build..."
    docker build -t acoria-app .
    docker stop acoria-container || true
    docker rm acoria-container || true
    docker run -d -p 80:80 --name acoria-container acoria-app
fi

echo "--- DEPLOYMENT COMPLETE ---"
"@

# Fix line endings
$LinuxScript = $ScriptBlock -replace "`r", ""

Write-Host "Connecting to $User@$ServerIP..." -ForegroundColor Cyan

# Pipe the script directly to bash on the remote server
# This avoids all quoting issues
$LinuxScript | ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "bash -s"

Read-Host -Prompt "Press Enter to exit"
