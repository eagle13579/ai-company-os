const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.options = {
      level: options.level || 'info',
      logFile: options.logFile || null,
      ...options
    };
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }
  
  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.options.level];
  }
  
  _formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (meta && Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  }
  
  _log(level, message, meta) {
    if (!this._shouldLog(level)) {
      return;
    }
    
    const logMessage = this._formatMessage(level, message, meta);
    
    // 输出到控制台
    if (level === 'error') {
      console.error(logMessage);
    } else if (level === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
    
    // 输出到文件
    if (this.options.logFile) {
      try {
        fs.appendFileSync(this.options.logFile, logMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }
  
  error(message, meta) {
    this._log('error', message, meta);
  }
  
  warn(message, meta) {
    this._log('warn', message, meta);
  }
  
  info(message, meta) {
    this._log('info', message, meta);
  }
  
  debug(message, meta) {
    this._log('debug', message, meta);
  }
}

// 导出单例
module.exports = new Logger();