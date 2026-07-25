/**
 * PM2 Ecosystem Configuration
 * Nexa Assessment Application
 *
 * Usage:
 *   Start:   pm2 start ecosystem.config.js --env production
 *   Reload:  pm2 reload ecosystem.config.js --env production
 *   Stop:    pm2 stop nexa-assessment
 *   Logs:    pm2 logs nexa-assessment
 *   Monitor: pm2 monit
 */

module.exports = {
  apps: [
    {
      name: "nexa-assessment",
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
      host: ["nexaassessment.my.id"],
      ref: "origin/main",
      repo: "git@github.com:your-org/app_nexa_assessment.git",
      path: "/var/www/nexa-assessment",
      "pre-deploy-local": "",
      "post-deploy":
        "cd frontend && npm ci && npx drizzle-kit migrate && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
