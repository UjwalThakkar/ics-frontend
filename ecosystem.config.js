module.exports = {
  apps: [
    {
      name: 'indian-consular-services',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/indian-consular-services',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Restart policy
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',

      // Memory management
      max_memory_restart: '500M',

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_http_url: 'http://localhost:3000/api/health',

      // Auto restart on file changes (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'backups'],

      // Advanced options
      kill_timeout: 1600,
      listen_timeout: 3000,

      // Source map support
      source_map_support: true,

      // Merge logs
      merge_logs: true,

      // Time zone
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/indian-consular-services.git',
      path: '/var/www/indian-consular-services',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    },

    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-repo/indian-consular-services.git',
      path: '/var/www/indian-consular-services-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001
      }
    }
  }
}
