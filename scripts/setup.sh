#!/bin/bash
# CMS Template Setup Script
# Generates unique secrets and prepares the environment

set -e

echo "🚀 CMS Template Setup"
echo "====================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js >= 20 is required. Current: $(node -v 2>/dev/null || echo 'not found')"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Generate random secrets
generate_secret() {
    openssl rand -base64 32 | tr -d '/+=' | head -c 32
}

# Create .env from template
if [ -f .env ] && [ "$1" != "--force" ]; then
    echo "⚠️  .env already exists. Use --force to overwrite."
else
    echo ""
    echo "Generating secrets..."
    
    cat > .env << EOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=$(generate_secret),$(generate_secret)
API_TOKEN_SALT=$(generate_secret)
ADMIN_JWT_SECRET=$(generate_secret)
TRANSFER_TOKEN_SALT=$(generate_secret)
JWT_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_secret)

# Database (SQLite by default, set these for PostgreSQL)
# DATABASE_CLIENT=postgres
# DATABASE_HOST=127.0.0.1
# DATABASE_PORT=5432
# DATABASE_NAME=cms
# DATABASE_USERNAME=
# DATABASE_PASSWORD=
EOF
    
    echo "✅ .env created with unique secrets"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "============================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. npm run develop"
echo "  2. Open http://localhost:1337/admin"
echo "  3. Create your admin account"
echo "  4. Start managing content!"
echo ""
echo "To add example content types:"
echo "  cp -r src/api/_examples/paper src/api/"
echo "  cp -r src/api/_examples/testimonial src/api/"
echo "  Then restart Strapi."
echo "============================================"
