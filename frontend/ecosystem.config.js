/**
 * PM2 Ecosystem Configuration
 * BNI Kredit Konsumer Application
 *
 * Usage:
 *   Start:   pm2 start ecosystem.config.js --env production
 *   Reload:  pm2 reload ecosystem.config.js --env production
 *   Stop:    pm2 stop bni-kredit-konsumer
 *   Logs:    pm2 logs bni-kredit-konsumer
 *   Monitor: pm2 monit
 */

module.exports = {
  apps: [
    {
      name: "bni-kredit-konsumer",
      script: "npm",
      args: "start",
      cwd: "./",

      // Cluster mode for load balancing
      instances: "max", // or specific number like 2
      exec_mode: "cluster",

      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Environment variables
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: "deploy",
      host: ["your-server.bni.co.id"],
      ref: "origin/main",
      repo: "git@github.com:your-org/app_kredit_konsumer_bni.git",
      path: "/var/www/bni-kredit-konsumer",
      "pre-deploy-local": "",
      "post-deploy":
        "cd frontend && npm ci --production && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
