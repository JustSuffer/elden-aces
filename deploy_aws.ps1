$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"

# Using Single Quote (@') prevents PowerShell from replacing variables like $HOME
# This ensures the code runs ONLY on the Linux server
$LinuxScript = @'
echo "--- CONNECTED TO REMOTE SERVER ---"
echo "User: $(whoami)"
echo "Home: $HOME"

# Define possible paths
PATHS=(
    "$HOME/elden-aces"
    "$HOME/acoria/elden-aces"
    "/var/www/elden-aces"
)

PROJECT_DIR=""

# Search for the directory
for path in "${PATHS[@]}"; do
    if [ -d "$path" ]; then
        PROJECT_DIR="$path"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo "Could not find project in standard locations. Searching..."
    # Safe search in home dir
    PROJECT_DIR=$(find $HOME -maxdepth 3 -type d -name "elden-aces" | head -n 1)
fi

if [ -z "$PROJECT_DIR" ]; then
    echo "ERROR: Could not find 'elden-aces' folder!"
    echo "Listing $HOME contents:"
    ls -F "$HOME"
    exit 1
fi

echo "FOUND PROJECT AT: $PROJECT_DIR"
cd "$PROJECT_DIR" || exit 1

echo "1. Pulling latest code..."
git reset --hard
git pull

echo "2. Rebuilding Application..."
if [ -f docker-compose.yml ]; then
    echo "Using Docker Compose..."
    docker-compose down
    docker-compose up -d --build
else
    echo "Using Standard Docker..."
    docker build -t acoria-app .
    docker stop acoria-container || true
    docker rm acoria-container || true
    docker run -d -p 80:80 --name acoria-container acoria-app
fi

echo "--- DEPLOYMENT SUCCESSFUL ---"
'@

# Remove Carriage Returns just in case
$LinuxScript = $LinuxScript -replace "`r", ""

Write-Host "Connecting to $User@$ServerIP..." -ForegroundColor Cyan

# Execute
$LinuxScript | ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "bash -s"

Read-Host -Prompt "Press Enter to exit"
