$ServerIP = "18.193.138.66"
$User = "ubuntu"
$KeyPath = "acoria-key.pem"
$RemotePath = "~/elden-aces" # Varsayılan olarak tahmin edilen yol

# SSH komutu ile sunucuya bağlanıp güncelleme işlemlerini yapıyoruz
Write-Host "Connecting to $User@$ServerIP..." -ForegroundColor Cyan

ssh -i $KeyPath -o StrictHostKeyChecking=no $User@$ServerIP "
    echo 'Connected to AWS Server!'
    
    # 1. Klasöre git (Eğer klasör adı farklıysa burayı düzeltmek gerekebilir)
    cd $RemotePath || { echo 'Directory not found! trying ~/acoria/elden-aces'; cd ~/acoria/elden-aces; } || { echo 'Could not find project directory!'; exit 1; }
    
    # 2. Son kodları çek
    echo 'Pulling latest code...'
    git pull
    
    # 3. Docker build ve restart
    # Docker Compose varsa onu kullan, yoksa düz docker komutları
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
"

Read-Host -Prompt "Press Enter to exit"
