$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"
$RemotePath = "~/elden-aces"

# Define the commands to run on the server
$ScriptBlock = @"
echo 'Connected to AWS Server!'

# 1. Klasöre git
if [ -d "$RemotePath" ]; then
    cd "$RemotePath"
elif [ -d "~/acoria/elden-aces" ]; then
    cd ~/acoria/elden-aces
else
    echo 'ERROR: Could not find project directory!'
    exit 1
fi

# 2. Son kodları çek (Resetleyerek, çakışmayı önler)
echo 'Pulling latest code...'
git reset --hard
git pull

# 3. Docker build ve restart
if [ -f docker-compose.yml ]; then
    echo 'Found docker-compose.yml, rebuilding...'
    docker-compose down
    docker-compose up -d --build
else
    echo 'No docker-compose.yml found, using standard build...'
    docker build -t acoria-app .
    docker stop acoria-container || true
    docker rm acoria-container || true
    docker run -d -p 80:80 --name acoria-container acoria-app
fi

echo 'Deployment Update Complete!'
"@

# CRITICAL: Remove Windows Carriage Returns (\r) which confuse Linux bash
$LinuxScript = $ScriptBlock -replace "`r", ""

Write-Host "Connecting to $User@$ServerIP..." -ForegroundColor Cyan

# Send the sanitized script
ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "bash -c '$LinuxScript'"

Read-Host -Prompt "Press Enter to exit"
