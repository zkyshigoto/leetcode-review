# Deploy to Debian 12 VPS Guide

Follow these steps to deploy your LeetCode Review AI.

## 1. Prepare Environment on VPS
SSH into your Debian server and install dependencies:
```bash
sudo apt update
sudo apt install -y python3-pip python3-venv nodejs npm nginx git
```
*(Note: If nodejs is too old, consider using nvm or nodesource, but standard repo is often fine for build)*

## 2. Copy Project Files
Clone your repo or copy the files to `/opt/leetcode-review`.
```bash
# Example if using git
cd /opt
git clone <your-repo-url> leetcode-review

# OR manually upload files via SCP/SFTP to /opt/leetcode-review
```

## 3. Setup Backend
```bash
cd /opt/leetcode-review/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4. Setup Frontend
```bash
cd /opt/leetcode-review/frontend
npm install
npm run build
```
This will create a `dist` folder with the static site.

## 5. Configure Systemd (Backend Service)
Copy the service file:
```bash
cp /opt/leetcode-review/deploy/backend.service /etc/systemd/system/leetcode-backend.service
sudo systemctl daemon-reload
sudo systemctl enable leetcode-backend
sudo systemctl start leetcode-backend
```
Check status: `sudo systemctl status leetcode-backend`

## 6. Configure Nginx
Copy the nginx config:
```bash
cp /opt/leetcode-review/deploy/leetcode-review.nginx /etc/nginx/sites-available/leetcode-review
```

Update the `server_name` in `/etc/nginx/sites-available/leetcode-review` to your IP or Domain.

Link and restart nginx:
```bash
sudo ln -s /etc/nginx/sites-available/leetcode-review /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Optional: Disable default welcome page
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Done!
Visit `http://<your-vps-ip>` in your browser.
