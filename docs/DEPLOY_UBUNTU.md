# Ubuntu Deployment Guide

This guide covers production deployment for **Ubuntu 22.04 LTS** and **Ubuntu 24.04 LTS** using:

- Node.js 22 LTS
- `npm`
- `systemd`
- `nginx`
- `certbot`
- Supabase for database, auth, realtime, and storage

## 1. Recommended production architecture

- Ubuntu server runs the Next.js app with `next start`
- `nginx` terminates HTTPS and reverse proxies to the app
- `systemd` keeps the Node.js process alive across reboots
- Supabase hosts Postgres, Auth, Realtime, and Storage
- Optional Upstash Redis handles distributed rate limiting

## 2. Server requirements

- Ubuntu 22.04 or 24.04
- 2 vCPU
- 2 GB RAM minimum
- 20 GB disk
- Domain name pointed to the server
- A non-root sudo user

For small events and internal use this is enough. If you expect a large audience, start with 4 GB RAM and monitor memory during livestreams.

## 3. Prepare the server

Update packages:

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

Install Node.js 22 from NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

The project should be deployed with Node.js 20+.
Node.js 22 LTS is the recommended choice for Ubuntu 22.04 and 24.04.

## 5. Create application directory

```bash
sudo mkdir -p /var/www/mini-game-crossword
sudo chown -R $USER:$USER /var/www/mini-game-crossword
cd /var/www/mini-game-crossword
```

Clone the repository:

```bash
git clone https://github.com/anhtruc1803/mini-game-crossword.git .
git checkout main
```

## 6. Configure environment variables

Create the production environment file:

```bash
cp .env.example .env.production
nano .env.production
```

Use this template:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional but recommended for multi-instance or production rate limiting
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required
- `SUPABASE_SERVICE_ROLE_KEY` is required if you use secure image uploads to Supabase Storage
- If Redis variables are missing, rate limiting falls back to in-memory storage and will reset on restart

## 7. Prepare Supabase

Before the first production run, apply the SQL migrations in order:

- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00002_security_hardening.sql`

You can run them from the Supabase SQL Editor or your normal migration workflow.

After running migrations, insert at least one admin account into `admin_users`.
Use the real Supabase Auth user ID of the account that should access `/admin`.

Example:

```sql
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-000000000000');
```

If you want asset uploads from the admin UI:

- Create the storage buckets required by your theme/assets flow
- Keep the buckets private
- Serve files through signed URLs only

## 8. Install dependencies and build

```bash
cd /var/www/mini-game-crossword
npm ci
npm run lint
npm test
npm run build
```

If `npm test` is optional for your deployment pipeline you can skip it, but `npm run build` should always pass before restart.

## 9. Create the systemd service

Create the unit file:

```bash
sudo nano /etc/systemd/system/mini-game-crossword.service
```

Use this configuration:

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

Grant ownership to the runtime user:

```bash
sudo chown -R www-data:www-data /var/www/mini-game-crossword
```

Enable and start the service:

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

## 10. Configure nginx

Create an nginx site:

```bash
sudo nano /etc/nginx/sites-available/mini-game-crossword
```

Use this config and replace `example.com`:

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

Enable the site and test nginx:

```bash
sudo ln -s /etc/nginx/sites-available/mini-game-crossword /etc/nginx/sites-enabled/mini-game-crossword
sudo nginx -t
sudo systemctl reload nginx
```

If the default site is still enabled, remove it:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 11. Enable HTTPS with Let's Encrypt

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Request the certificate:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

## 12. Verify the deployment

Check these endpoints after the service is up:

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

If `/api/health` returns `degraded`, verify:

- `.env.production` values are correct
- Supabase is reachable from the server
- migrations have been applied
- the `programs` table exists

## 13. Deployment update procedure

Use this flow for future releases:

```bash
cd /var/www/mini-game-crossword
git pull origin main
npm ci
npm run build
sudo systemctl restart mini-game-crossword
sudo systemctl status mini-game-crossword
```

If a release includes schema changes:

- run the new Supabase migration first
- then deploy the application

This avoids runtime mismatches between code and database schema.

## 14. Operational recommendations

- Keep `SUPABASE_SERVICE_ROLE_KEY` only on the server
- Do not commit `.env.production`
- Use Redis in production if you may run more than one app instance
- Monitor `journalctl` logs during livestream events
- Restart only after `npm run build` succeeds
- Back up your Supabase project and export schema regularly

## 15. Optional hardening

- Put the server behind Cloudflare if you expect burst traffic
- Restrict SSH to key-based login only
- Disable password login in `sshd_config`
- Use `fail2ban` for SSH protection
- Add a deployment user separate from your personal account
- Send app logs to a centralized log service if uptime matters

## 16. Troubleshooting

### App fails to start

Check:

- `journalctl -u mini-game-crossword -n 200`
- `cat /var/www/mini-game-crossword/.env.production`
- `node -v`

Common causes:

- missing Supabase environment variables
- `SUPABASE_SERVICE_ROLE_KEY` missing while upload flow is enabled
- build was not run after updating dependencies

### Nginx returns 502 Bad Gateway

Check:

- the Node.js service is running
- the app is listening on port `3000`
- nginx `proxy_pass` points to `127.0.0.1:3000`

Useful commands:

```bash
sudo systemctl status mini-game-crossword
sudo systemctl status nginx
sudo nginx -t
```

### Admin cannot log in

Check:

- the user exists in Supabase Auth
- the user ID exists in `public.admin_users`
- `/admin` is not blocked by stale cookies

### Rate limit behaves inconsistently across restarts

That is expected if Redis is not configured.
Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for stable production rate limiting.
