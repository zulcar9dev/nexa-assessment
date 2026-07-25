#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Nexa Assessment orchestration..."

# Ensure storage subdirectories exist
mkdir -p /app/storage/uploads/documents
mkdir -p /app/storage/templates
mkdir -p /app/storage/data

# Copy default templates if they don't exist in persistent storage
if [ -d "/app/templates.bak" ]; then
  echo "📂 Checking default templates..."
  cp -rn /app/templates.bak/* /app/storage/templates/ 2>/dev/null || true
fi

# Copy default data if it doesn't exist in persistent storage
if [ -d "/app/data.bak" ]; then
  echo "📂 Checking default settings data..."
  cp -rn /app/data.bak/* /app/storage/data/ 2>/dev/null || true
fi

# Create symlinks from the app directories to the persistent storage directories
echo "🔗 Creating symlinks to persistent storage..."
rm -rf /app/uploads
rm -rf /app/templates
rm -rf /app/data

ln -sf /app/storage/uploads /app/uploads
ln -sf /app/storage/templates /app/templates
ln -sf /app/storage/data /app/data

# Run migrations
if [ -f "/app/migrate.js" ]; then
  echo "⚙️ Running database migrations..."
  node /app/migrate.js
else
  echo "⚠️ migrate.js not found, skipping migrations."
fi

# Start the application
echo "🌐 Starting Next.js standalone server..."
exec node server.js
