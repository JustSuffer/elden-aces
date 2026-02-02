$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"

$LinuxScript = @'
echo "--- DEPLOYMENT DIAGNOSTICS ---"
PROJECT_DIR="/home/ubuntu/elden-aces"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "ERROR: Project directory not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

echo "1. Attempting to pull latest code..."
# Try git pull, if it fails, warn the user about credentials
if ! git pull; then
    echo "WARNING: git pull failed. This usually means the server needs GitHub credentials or an SSH key."
    echo "Current remote: $(git remote -v)"
fi

echo "2. Cleaning up port 80..."
# Find what is using port 80 and stop it
# Check for docker containers first
EXISTING_CONTAINER=$(docker ps -q --filter "publish=80")
if [ ! -z "$EXISTING_CONTAINER" ]; then
    echo "Stopping container(s) using port 80: $EXISTING_CONTAINER"
    docker stop $EXISTING_CONTAINER
    docker rm $EXISTING_CONTAINER
fi

# Check for native Nginx or other processes on port 80
if sudo lsof -i :80 > /dev/null; then
    echo "Port 80 is still busy. Attempting to stop native services..."
    sudo systemctl stop nginx || true
    sudo fuser -k 80/tcp || true
fi

echo "3. Rebuilding and Starting Container..."
docker build -t acoria-app .
# Final cleanup of any container with the same name before start
docker stop acoria-container 2>/dev/null || true
docker rm acoria-container 2>/dev/null || true

if docker run -d -p 80:80 --name acoria-container acoria-app; then
    echo "--- DEPLOYMENT SUCCESSFUL ---"
    echo "Site should be live at http://18.193.138.66"
else
    echo "ERROR: Failed to start the container."
fi
'@

$LinuxScript = $LinuxScript -replace "`r", ""

Write-Host "Connecting to $User@$ServerIP..." -ForegroundColor Cyan
$LinuxScript | ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "bash -s"

Read-Host -Prompt "Press Enter to exit"
