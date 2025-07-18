# Octra Web Wallet

This is UnOfficial Octra Web Wallet.
Octra Web Wallet is an open-source web interface that allows users to easily and securely interact with the **Octra blockchain** directly from their browser.

---

## 🚀 Key Features

- 🔐 Import wallet using **Private Key** or **Mnemonic Phrase**
- 💰 View real-time balance from any Octra address
- 📤 Send native Octra coin transactions
- 📄 Transaction history display
- ⚙️ Direct connection to Octra RPC (`https://octra.network`)
- 🖥️ Fully client-side — no backend required

---

## 🛠️ Tech Stack

- ⚡ [Vite](https://vitejs.dev/) for blazing-fast bundling
- 💻 Frontend: [React.js](https://reactjs.org/)
- 🔗 Blockchain interaction via JSON-RPC & `fetch`
- 🔒 Secure client-side key management — no keys are stored or transmitted

---

## 🧪 Installation & Running Locally

```bash
# Clone the repository
git clone https://github.com/m-tq/Octra-Web-Wallet.git
cd octra-web-wallet

# Install dependencies
npm install

# Start development server
npm run dev

```

## 🚀 Production Deployment (VPS)

### Prerequisites
- Ubuntu/Debian VPS with root access
- Nginx installed
- Node.js 18+ and npm installed
- Domain name pointed to your VPS
- SSL certificate (Let's Encrypt recommended)

### Deployment Steps

1. **Clone and build the application:**
```bash
git clone https://github.com/m-tq/Octra-Web-Wallet.git
cd octra-web-wallet
npm install
npm run build
```

2. **Run the deployment script:**
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

3. **Configure your domain in nginx:**
```bash
sudo nano /etc/nginx/sites-available/octra-wallet
# Edit server_name to your domain
# Configure SSL certificate paths
```

4. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/octra-wallet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate Setup (Let's Encrypt)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (optional)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Dynamic RPC Configuration

The application automatically handles RPC provider switching:
- **Development**: Uses Vite proxy for CORS handling
- **Production**: Makes direct requests to RPC providers (CORS must be enabled on RPC server)

Users can change RPC providers through the UI, and the application will automatically use the selected provider without requiring nginx reconfiguration.

### Troubleshooting

**CORS Issues in Production:**
If you encounter CORS issues with certain RPC providers, you can add a simple proxy endpoint:

```nginx
# Add this to your nginx config if needed
location /rpc-proxy/ {
    # Remove /rpc-proxy prefix and proxy to any RPC
    rewrite ^/rpc-proxy/(.*)$ /$1 break;
    
    # This would require additional logic to handle dynamic targets
    # For now, direct requests work better for flexibility
    proxy_pass $arg_target;
    proxy_set_header Host $proxy_host;
    proxy_ssl_server_name on;
    
    # CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}