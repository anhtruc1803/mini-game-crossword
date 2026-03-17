# Ubuntu Deployment Guide

This guide covers production deployment for Ubuntu 22.04 LTS and Ubuntu 24.04 LTS using the current codebase:

- Next.js app
- Prisma
- SQLite
- signed cookie admin auth
- local filesystem asset storage
- optional Upstash Redis rate limiting

## 1. Recommended deployment model

This project is currently best suited to a single-server deployment.

- `nginx` reverse proxy
- `systemd` process manager
- Node.js 22 LTS
- SQLite file on local disk
- optional Upstash Redis for rate limiting

If you need multiple app instances or shared storage, plan a later migration to PostgreSQL and external object storage.

## 2. Server requirements

- Ubuntu 22.04 or 24.04
- 2 vCPU minimum
- 2 GB RAM minimum
- 20 GB disk
- non-root sudo user
- domain pointed to the server

## 3. Install system packages

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git ufw nginx
```

Enable the firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 4. Install Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 5. Clone the project

```bash
sudo mkdir -p /var/www/mini-game-crossword
sudo chown -R $USER:$USER /var/www/mini-game-crossword
cd /var/www/mini-game-crossword
git clone https://github.com/anhtruc1803/mini-game-crossword.git .
git checkout main
```

## 6. Create runtime directories

The app expects a writable SQLite location and a writable upload directory.

```bash
mkdir -p data
mkdir -p public/uploads
```

## 7. Configure environment variables

Create the production env file:

```bash
cp .env.example .env.production
nano .env.production
```

Recommended production template:

```dotenv
DATABASE_URL="file:../data/app.db"
SESSION_SECRET="replace-with-a-long-random-secret"

# Optional: rate limit storage
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Optional: only needed if you want prisma db seed to create an admin user
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-me-before-seeding
```

Required variables:

- `DATABASE_URL`
- `SESSION_SECRET`

Optional variables:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Important notes:

- `SESSION_SECRET` must be a strong random string in production
- do not commit `.env.production`
- if Redis env vars are missing, rate limiting falls back to in-memory counters

## 8. Install dependencies and prepare Prisma

```bash
cd /var/www/mini-game-crossword
npm ci
npm exec prisma generate
npm exec prisma migrate deploy
```

Optional seed step:

```bash
npm exec prisma db seed
```

If you run `db seed` without `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, the script will skip admin creation and only prepare demo data.

## 9. Build and verify before starting

```bash
npm run lint
npm test
npm run build
```

## 10. Set file permissions

The service user must be able to write:

- `data/`
- `public/uploads/`

Example:

```bash
sudo chown -R www-data:www-data /var/www/mini-game-crossword
```

## 11. Create systemd service

Create the unit file:

```bash
sudo nano /etc/systemd/system/mini-game-crossword.service
```

Use this config:

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

Enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mini-game-crossword
sudo systemctl start mini-game-crossword
sudo systemctl status mini-game-crossword
```

View logs:

```bash
journalctl -u mini-game-crossword -f
```

## 12. Configure nginx

Create the site file:

```bash
sudo nano /etc/nginx/sites-available/mini-game-crossword
```

Example config:

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
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/mini-game-crossword /etc/nginx/sites-enabled/mini-game-crossword
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 13. Enable HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run
```

## 14. Verify deployment

Check:

- `https://example.com/`
- `https://example.com/admin/login`
- `https://example.com/api/health`

Expected health response:

```json
{
  "status": "ok",
  "checks": {
    "env": true,
    "database": true
  }
}
```

If health is degraded:

- confirm `DATABASE_URL` is correct
- confirm the SQLite file path is writable
- confirm Prisma migrations were applied
- confirm `prisma.program.count()` can run

## 15. Update procedure

For later deployments:

```bash
cd /var/www/mini-game-crossword
git pull origin main
npm ci
npm exec prisma generate
npm exec prisma migrate deploy
npm run build
sudo systemctl restart mini-game-crossword
sudo systemctl status mini-game-crossword
```

## 16. Backup recommendations

At minimum back up:

- `data/app.db`
- `.env.production`
- `public/uploads/`

SQLite backups are simple, but they matter because the database is local to the app server.

## 17. Troubleshooting

### App fails to start

Check:

```bash
journalctl -u mini-game-crossword -n 200
cat /var/www/mini-game-crossword/.env.production
```

Common causes:

- missing `DATABASE_URL`
- missing `SESSION_SECRET`
- SQLite file path not writable
- Prisma migrations not deployed

### Admin login works and then immediately redirects back to login

Check:

- `SESSION_SECRET` is present and stable
- system time is correct
- cookies are not being stripped by the reverse proxy

### Uploads fail

Check:

- `public/uploads/` exists
- service user can write into `public/uploads/`
- file type and size match the upload validation rules

### Viewer updates feel slow

Current architecture uses polling, not realtime subscriptions.
That is expected.
If you need lower-latency updates, the architecture will need a websocket or SSE layer instead of simply lowering the polling interval aggressively.
