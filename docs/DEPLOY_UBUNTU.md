# Ubuntu Deployment Guide

This guide is for Ubuntu 22.04 and 24.04.

Current deployment target:

- one Ubuntu server
- Node.js 22
- nginx
- systemd
- Prisma + SQLite
- local media storage

## 1. Install packages

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git ufw nginx
```

Open firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Install Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 3. Clone the repo

```bash
sudo mkdir -p /var/www/mini-game-crossword
sudo chown -R $USER:$USER /var/www/mini-game-crossword
cd /var/www/mini-game-crossword
git clone https://github.com/anhtruc1803/mini-game-crossword.git .
git checkout main
```

## 4. Prepare writable directories

```bash
mkdir -p data
mkdir -p public/uploads
mkdir -p data/uploads
```

## 5. Create `.env.production`

```bash
cp .env.example .env.production
nano .env.production
```

Recommended template:

```dotenv
DATABASE_URL="file:../data/app.db"
SESSION_SECRET="replace-with-a-long-random-secret"

SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="change-me-before-seeding"

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Required:

- `DATABASE_URL`
- `SESSION_SECRET`

Optional:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 6. Install and prepare database

```bash
npm ci
npm exec prisma generate
npm exec prisma migrate deploy
```

Optional seed:

```bash
npm exec prisma db seed
```

## 7. Verify locally on server

```bash
npm run lint
npm test
npm run build
```

## 8. Set file permissions

The app user must be able to write to:

- `data/`
- `public/uploads/`
- `data/uploads/`

Example:

```bash
sudo chown -R www-data:www-data /var/www/mini-game-crossword
```

## 9. Create systemd service

Create:

```bash
sudo nano /etc/systemd/system/mini-game-crossword.service
```

Use:

```ini
[Unit]
Description=Mini Game Crossword
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mini-game-crossword
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/var/www/mini-game-crossword/.env.production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mini-game-crossword
sudo systemctl start mini-game-crossword
sudo systemctl status mini-game-crossword
```

Logs:

```bash
journalctl -u mini-game-crossword -f
```

## 10. Configure nginx

Create:

```bash
sudo nano /etc/nginx/sites-available/mini-game-crossword
```

Example:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/mini-game-crossword /etc/nginx/sites-enabled/mini-game-crossword
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 11. Enable HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run
```

## 12. Post-deploy checks

Verify:

- `/`
- `/admin/login`
- `/api/health`
- one program viewer page
- one program image upload

Health response should show:

```json
{
  "status": "ok",
  "checks": {
    "env": true,
    "database": true
  }
}
```

## 13. Update procedure

```bash
cd /var/www/mini-game-crossword
git pull origin main
npm ci
npm exec prisma generate
npm exec prisma migrate deploy
npm run build
sudo systemctl restart mini-game-crossword
```

## 14. Backup

Back up at least:

- `data/app.db`
- `public/uploads/`
- `data/uploads/`
- `.env.production`

## 15. Common issues

### SQLite readonly

Fix ownership on app folder, DB file, and upload directories.

### Admin login loops

Check:

- `SESSION_SECRET`
- reverse proxy headers
- server time

### Uploads fail

Check:

- writable upload directories
- 5 MB limit
- PNG/JPEG/WebP only

### Viewer not updating

Check:

- `/api/viewer-snapshot`
- browser network requests
- program slug correctness
- whether the current viewer page is polling every 10 seconds
