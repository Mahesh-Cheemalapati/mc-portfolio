# Nginx Proxy Manager Setup

When your Pi is running with NPM installed, create a proxy host with these settings:

## Proxy Host Configuration

**Domain Names:** yourdomain.com www.yourdomain.com
**Scheme:** http
**Forward Hostname/IP:** web (Docker container name)
**Forward Port:** 3000
**Cache Assets:** Yes
**Block Common Exploits:** Yes
**Websockets Support:** No

## Custom Nginx Config (Advanced tab)

Paste this in the Advanced tab to route /api/ to the FastAPI container:

```
location /api/ {
    proxy_pass http://api:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## SSL

Enable Force SSL and use Let's Encrypt in the SSL tab.
NPM handles cert renewal automatically.

## After Setup

Update `.env` on the Pi:

```
DOMAIN=yourdomain.com
ENVIRONMENT=production
REDIS_URL=redis://redis:6379
```

Run: `make up`
