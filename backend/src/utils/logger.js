/**
 * CloudDeploy Structured Logger
 * Provides colorized console output and structured JSON logs for observability
 */

const logLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = process.env.LOG_LEVEL || 'INFO';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function formatTimestamp(d = new Date()) {
  return d.toISOString();
}

const logger = {
  info(msg, meta = {}) {
    if (logLevels[currentLevel] <= logLevels.INFO) {
      console.log(`${colors.cyan}[INFO]${colors.reset} [${formatTimestamp()}] ${msg}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  },

  warn(msg, meta = {}) {
    if (logLevels[currentLevel] <= logLevels.WARN) {
      console.warn(`${colors.yellow}[WARN]${colors.reset} [${formatTimestamp()}] ${msg}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  },

  error(msg, error = null) {
    if (logLevels[currentLevel] <= logLevels.ERROR) {
      console.error(`${colors.red}[ERROR]${colors.reset} [${formatTimestamp()}] ${msg}`, error ? (error.stack || error) : '');
    }
  },

  debug(msg, meta = {}) {
    if (logLevels[currentLevel] <= logLevels.DEBUG) {
      console.log(`${colors.gray}[DEBUG]${colors.reset} [${formatTimestamp()}] ${msg}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }
  },

  pipeline(deploymentId, stage, message, level = 'INFO') {
    const timestamp = formatTimestamp();
    const color = level === 'ERROR' ? colors.red : level === 'WARN' ? colors.yellow : colors.green;
    console.log(`${color}[PIPELINE:${stage}]${colors.reset} [${deploymentId.slice(0, 8)}] ${message}`);
    return {
      deploymentId,
      stage,
      level,
      message,
      timestamp: new Date()
    };
  }
};

module.exports = logger;
