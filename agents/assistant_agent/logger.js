const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logFile = options.logFile || path.join(__dirname, 'assistant_agent.log');
    this.logLevels = ['debug', 'info', 'warn', 'error'];
  }

  log(level, message, data = {}) {
    if (this.logLevels.indexOf(level) < this.logLevels.indexOf(this.logLevel)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    
    console.log(logMessage.trim());
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error('Error writing to log file:', error.message);
    }
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }
}

module.exports = new Logger();