module.exports = {
  apps: [
    {
      name: "july-backend",
      script: "./backend/server.js",
      cwd: "./backend",
      instances: "max", // Usar todas as CPUs disponíveis
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      // Logs
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Restart policy
      max_memory_restart: "1G",
      min_uptime: "10s",
      max_restarts: 10,

      // Watch mode (desenvolvimento)
      watch: false,
      ignore_watch: ["node_modules", "logs"],

      // Health check
      health_check_grace_period: 3000,

      // Kill timeout
      kill_timeout: 5000,

      // Listen timeout
      listen_timeout: 8000,

      // PM2 specific
      pmx: true,
      source_map_support: true,

      // Environment variables
      env_file: ".env",
    },
  ],

  deploy: {
    production: {
      user: "ubuntu",
      host: "your-server.com",
      ref: "origin/main",
      repo: "git@github.com:your-username/july-finance.git",
      path: "/var/www/july-finance",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
