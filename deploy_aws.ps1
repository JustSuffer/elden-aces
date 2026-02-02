$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"
$RemotePath = "~/elden-aces"

# Script to run on server
$ScriptBlock = @"
echo "--- DEBUGGING MODE ---"
echo "User: $(whoami)"
echo "Home: $HOME"
echo "Listing directories in Home:"
ls -F $HOME

if [ -d "$HOME/acoria" ]; then
    echo "Listing directories in acoria/:"
    ls -F $HOME/acoria
fi

echo "--- ATTEMPTING DEPLOYMENT ---"

# Try to find the folder dynamically
if [ -d "$HOME/elden-aces" ]; then
    PROJECT_DIR="$HOME/elden-aces"
elif [ -d "$HOME/acoria/elden-aces" ]; then
    PROJECT_DIR="$HOME/acoria/elden-aces"
elif [ -d "/var/www/elden-aces" ]; then
    PROJECT_DIR="/var/www/elden-aces"
else
    # Try one deeper search
    PROJECT_DIR=$(find $HOME -maxdepth 2 -type d -name "elden-aces" | head -n 1)
fi

if [ -z "$PROJECT_DIR" ]; then
    echo "ERROR: Could not find 'elden-aces' folder!"
    echo "Please tell the developer what folders you see in the list above."
    exit 1
fi

echo "Found Project at: $PROJECT_DIR"
cd "$PROJECT_DIR"

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
$LinuxScript | ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "bash -s"

Read-Host -Prompt "Press Enter to exit"
