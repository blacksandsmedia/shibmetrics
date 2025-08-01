// Daily Validation and Lock-in System
// Validates last 24 hours of data and locks historical data permanently

import fs from 'fs';
import { 
  BurnTransaction, 
  HistoricalDataset, 
  loadHistoricalDataset, 
  saveHistoricalDataset,
  validateDatasetIntegrity,
  calculateDataIntegrityHash 
} from './historical-collector';

interface ValidationLog {
  timestamp: number;
  date: string;
  validationResults: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    stats: Record<string, unknown>;
  };
  lockedTransactions: number;
  newTransactions: number;
  totalTransactions: number;
  dataIntegrityHash: string;
}

const VALIDATION_LOG_FILE = '/tmp/shibmetrics-validation-log.json';
const DAILY_BACKUP_DIR = '/tmp/shibmetrics-daily-backups';

/**
 * Load validation history
 */
function loadValidationLog(): ValidationLog[] {
  try {
    if (!fs.existsSync(VALIDATION_LOG_FILE)) {
      return [];
    }
    
    const data = JSON.parse(fs.readFileSync(VALIDATION_LOG_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.error('❌ Failed to load validation log:', error);
    return [];
  }
}

/**
 * Save validation log entry
 */
function saveValidationLog(logs: ValidationLog[]): void {
  try {
    // Keep only last 365 days of logs
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const filteredLogs = logs.filter(log => log.timestamp > oneYearAgo);
    
    fs.writeFileSync(VALIDATION_LOG_FILE, JSON.stringify(filteredLogs, null, 2));
    console.log(`📝 Saved validation log: ${filteredLogs.length} entries`);
    
  } catch (error) {
    console.error('❌ Failed to save validation log:', error);
    throw error;
  }
}

/**
 * Create daily backup of dataset
 */
function createDailyBackup(dataset: HistoricalDataset, date: string): void {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(DAILY_BACKUP_DIR)) {
      fs.mkdirSync(DAILY_BACKUP_DIR, { recursive: true });
    }
    
    const backupFile = `${DAILY_BACKUP_DIR}/shibmetrics-backup-${date}.json`;
    
    // Convert Map to Array for serialization
    const backupData = {
      transactions: Array.from(dataset.transactions.entries()),
      metadata: dataset.metadata,
      addressStats: dataset.addressStats,
      backupDate: date,
      backupTimestamp: Date.now()
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`💾 Created daily backup: ${backupFile}`);
    
    // Clean up old backups (keep 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const files = fs.readdirSync(DAILY_BACKUP_DIR);
    for (const file of files) {
      if (file.startsWith('shibmetrics-backup-') && file.endsWith('.json')) {
        const dateStr = file.replace('shibmetrics-backup-', '').replace('.json', '');
        const fileDate = new Date(dateStr);
        
        if (fileDate < thirtyDaysAgo) {
          fs.unlinkSync(`${DAILY_BACKUP_DIR}/${file}`);
          console.log(`🗑️ Removed old backup: ${file}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to create daily backup:', error);
    throw error;
  }
}

/**
 * Validate and lock transactions older than 24 hours
 */
export async function validateAndLockDailyData(): Promise<{
  success: boolean;
  validationResults: Record<string, unknown>;
  lockedCount: number;
  newCount: number;
  errors: string[];
}> {
  console.log('🔒 Starting daily validation and lock process...');
  
  try {
    // Load current dataset
    const dataset = loadHistoricalDataset();
    if (!dataset) {
      throw new Error('No historical dataset found');
    }
    
    console.log(`📚 Loaded dataset: ${dataset.transactions.size} transactions`);
    
    // Calculate 24 hours ago timestamp
    const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Separate transactions into locked (>24h old) and recent (<24h)
    let lockedCount = 0;
    let newCount = 0;
    
    for (const [, tx] of dataset.transactions) {
      const txTimestamp = parseInt(tx.timeStamp);
      
      if (txTimestamp < twentyFourHoursAgo) {
        if (!tx.locked) {
          // Lock transactions older than 24 hours
          tx.locked = true;
          tx.validated = true;
          lockedCount++;
        }
      } else {
        newCount++;
      }
    }
    
    console.log(`🔒 Locked ${lockedCount} transactions (older than 24h), ${newCount} remain unlocked (recent)`);
    
    // Validate complete dataset integrity
    const validationResults = validateDatasetIntegrity(dataset);
    
    console.log(`✅ Validation complete: ${validationResults.isValid ? 'PASSED' : 'FAILED'}`);
    if (validationResults.errors.length > 0) {
      console.log('❌ Validation errors:');
      validationResults.errors.forEach(error => console.log(`   - ${error}`));
    }
    if (validationResults.warnings.length > 0) {
      console.log('⚠️ Validation warnings:');
      validationResults.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    // Update metadata
    dataset.metadata.lastValidation = Date.now();
    dataset.metadata.dataIntegrityHash = calculateDataIntegrityHash(dataset.transactions);
    
    // Save updated dataset
    saveHistoricalDataset(dataset);
    
    // Create daily backup
    createDailyBackup(dataset, today);
    
    // Log validation results
    const validationLog: ValidationLog = {
      timestamp: Date.now(),
      date: today,
      validationResults,
      lockedTransactions: lockedCount,
      newTransactions: newCount,
      totalTransactions: dataset.transactions.size,
      dataIntegrityHash: dataset.metadata.dataIntegrityHash
    };
    
    const logs = loadValidationLog();
    logs.push(validationLog);
    saveValidationLog(logs);
    
    console.log('✅ Daily validation and lock process completed successfully');
    
    return {
      success: true,
      validationResults,
      lockedCount,
      newCount,
      errors: []
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Daily validation failed:', errorMessage);
    
    return {
      success: false,
      validationResults: {},
      lockedCount: 0,
      newCount: 0,
      errors: [errorMessage]
    };
  }
}

/**
 * Cross-validate recent data against Etherscan for accuracy
 */
export async function crossValidateRecentData(apiKey: string): Promise<{
  success: boolean;
  validatedCount: number;
  discrepancies: Record<string, unknown>[];
  errors: string[];
}> {
  console.log('🔍 Starting cross-validation of recent data...');
  
  try {
    const dataset = loadHistoricalDataset();
    if (!dataset) {
      throw new Error('No historical dataset found');
    }
    
    // Get transactions from last 48 hours for validation
    const fortyEightHoursAgo = Math.floor(Date.now() / 1000) - (48 * 60 * 60);
    const recentTransactions = Array.from(dataset.transactions.values())
      .filter(tx => parseInt(tx.timeStamp) > fortyEightHoursAgo && !tx.locked)
      .slice(0, 50); // Limit to 50 most recent for API efficiency
    
    console.log(`🔍 Cross-validating ${recentTransactions.length} recent transactions...`);
    
    const discrepancies: Record<string, unknown>[] = [];
    let validatedCount = 0;
    
    // Sample validation - check a few transactions directly with Etherscan
    for (const tx of recentTransactions.slice(0, 10)) { // Validate top 10 for efficiency
      try {
        const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx.hash}&apikey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.result) {
          // Basic validation - transaction exists and block number matches
          const etherscanBlockNumber = parseInt(data.result.blockNumber, 16).toString();
          
          if (etherscanBlockNumber !== tx.blockNumber) {
            discrepancies.push({
              hash: tx.hash,
              issue: 'Block number mismatch',
              cached: tx.blockNumber,
              etherscan: etherscanBlockNumber
            });
          } else {
            validatedCount++;
          }
        } else {
          discrepancies.push({
            hash: tx.hash,
            issue: 'Transaction not found on Etherscan',
            cached: tx.blockNumber,
            etherscan: null
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`⚠️ Failed to validate transaction ${tx.hash}:`, error);
      }
    }
    
    console.log(`✅ Cross-validation complete: ${validatedCount} validated, ${discrepancies.length} discrepancies`);
    
    return {
      success: true,
      validatedCount,
      discrepancies,
      errors: []
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Cross-validation failed:', errorMessage);
    
    return {
      success: false,
      validatedCount: 0,
      discrepancies: [],
      errors: [errorMessage]
    };
  }
}

/**
 * Get validation history and statistics
 */
export function getValidationHistory(): {
  recentValidations: ValidationLog[];
  totalDays: number;
  successRate: number;
  totalTransactionsLocked: number;
} {
  const logs = loadValidationLog();
  
  const recentValidations = logs.slice(-30); // Last 30 days
  const successfulValidations = logs.filter(log => log.validationResults.isValid).length;
  const successRate = logs.length > 0 ? (successfulValidations / logs.length) * 100 : 0;
  const totalTransactionsLocked = logs.reduce((sum, log) => sum + log.lockedTransactions, 0);
  
  return {
    recentValidations,
    totalDays: logs.length,
    successRate,
    totalTransactionsLocked
  };
}

/**
 * Emergency data recovery from backups
 */
export function recoverFromBackup(backupDate: string): boolean {
  try {
    const backupFile = `${DAILY_BACKUP_DIR}/shibmetrics-backup-${backupDate}.json`;
    
    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      return false;
    }
    
    console.log(`🔄 Recovering data from backup: ${backupDate}`);
    
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    // Reconstruct dataset
    const transactions = new Map<string, BurnTransaction>();
    for (const [hash, tx] of backupData.transactions) {
      transactions.set(hash, tx);
    }
    
    const dataset: HistoricalDataset = {
      transactions,
      metadata: backupData.metadata,
      addressStats: backupData.addressStats
    };
    
    // Save recovered dataset
    saveHistoricalDataset(dataset);
    
    console.log(`✅ Data recovered successfully: ${transactions.size} transactions`);
    return true;
    
  } catch (error) {
    console.error('❌ Data recovery failed:', error);
    return false;
  }
}