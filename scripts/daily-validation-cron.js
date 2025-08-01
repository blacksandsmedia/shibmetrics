#!/usr/bin/env node

// Daily Validation Cron Job
// Run this script daily at midnight to validate and lock historical data
// 
// To set up cron job:
// 1. Make script executable: chmod +x scripts/daily-validation-cron.js
// 2. Add to crontab: 0 0 * * * /path/to/your/project/scripts/daily-validation-cron.js
// 
// Or run manually: node scripts/daily-validation-cron.js

const https = require('https');
const http = require('http');

// Configuration
const SHIBMETRICS_URL = process.env.SHIBMETRICS_URL || 'https://shibmetrics.com';
const LOG_FILE = '/tmp/shibmetrics-cron.log';

/**
 * Log message with timestamp
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  // Also log to file
  require('fs').appendFileSync(LOG_FILE, logEntry, { flag: 'a' });
}

/**
 * Make HTTP request
 */
function makeRequest(url, method = 'POST') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SHIBMETRICS-CronJob/1.0'
      },
      timeout: 300000 // 5 minute timeout
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: result
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Failed to parse JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Run daily validation
 */
async function runDailyValidation() {
  log('🚀 Starting daily validation cron job...');
  
  try {
    // Trigger daily validation and lock
    const validationUrl = `${SHIBMETRICS_URL}/api/historical/validate`;
    log(`📡 Calling validation endpoint: ${validationUrl}`);
    
    const response = await makeRequest(validationUrl, 'POST');
    
    if (response.status === 200 && response.data.success) {
      log('✅ Daily validation completed successfully');
      log(`📊 Results: ${response.data.validation.lockedTransactions} locked, ${response.data.validation.newTransactions} new`);
      
      if (response.data.validation.errors?.length > 0) {
        log(`⚠️ Validation errors: ${response.data.validation.errors.join(', ')}`);
      }
      
      if (response.data.validation.warnings?.length > 0) {
        log(`⚠️ Validation warnings: ${response.data.validation.warnings.join(', ')}`);
      }
      
      // Log cross-validation results
      if (response.data.crossValidation?.success) {
        log(`🔍 Cross-validation: ${response.data.crossValidation.validatedCount} validated, ${response.data.crossValidation.discrepancies?.length || 0} discrepancies`);
      }
      
      return true;
      
    } else {
      log(`❌ Daily validation failed: ${response.data.error || 'Unknown error'}`);
      log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
    
  } catch (error) {
    log(`❌ Daily validation cron job failed: ${error.message}`);
    log(`🔍 Stack trace: ${error.stack}`);
    return false;
  }
}

/**
 * Send status notification (optional - implement webhook/email as needed)
 */
async function sendStatusNotification(success, details) {
  // This is where you could implement:
  // - Slack webhook notification
  // - Email notification
  // - Discord webhook
  // - etc.
  
  const status = success ? '✅ SUCCESS' : '❌ FAILED';
  const message = `SHIBMETRICS Daily Validation: ${status}\n\nDetails: ${details}`;
  
  log(`📬 Status notification: ${message}`);
  
  // TODO: Implement actual notification system
  // For now, just log it
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  log('🎯 SHIBMETRICS Daily Validation Cron Job Started');
  
  try {
    const success = await runDailyValidation();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    const details = `Duration: ${duration}s`;
    
    if (success) {
      log(`✅ Daily validation cron job completed successfully in ${duration}s`);
      await sendStatusNotification(true, details);
      process.exit(0);
    } else {
      log(`❌ Daily validation cron job failed after ${duration}s`);
      await sendStatusNotification(false, details);
      process.exit(1);
    }
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`💥 Daily validation cron job crashed after ${duration}s: ${error.message}`);
    await sendStatusNotification(false, `CRASHED: ${error.message}`);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('🛑 Daily validation cron job interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('🛑 Daily validation cron job terminated');
  process.exit(1);
});

// Run the job
main();