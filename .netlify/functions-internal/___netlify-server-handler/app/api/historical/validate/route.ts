// API endpoint to trigger daily validation and lock process

import { NextResponse } from 'next/server';
import { validateAndLockDailyData, crossValidateRecentData, getValidationHistory } from '../../../../lib/daily-validation';

export async function POST() {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!apiKey || apiKey === 'YourEtherscanApiKeyHere') {
    return NextResponse.json({
      success: false,
      error: 'No valid Etherscan API key configured'
    }, { status: 500 });
  }

  try {
    console.log('🔒 Starting daily validation and lock process...');
    
    // Run daily validation and lock
    const validationResult = await validateAndLockDailyData();
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Daily validation failed',
        details: validationResult.errors,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Run cross-validation for extra safety
    const crossValidationResult = await crossValidateRecentData(apiKey);
    
    return NextResponse.json({
      success: true,
      message: 'Daily validation and lock process completed',
      validation: {
        isValid: validationResult.validationResults.isValid,
        lockedTransactions: validationResult.lockedCount,
        newTransactions: validationResult.newCount,
        errors: validationResult.validationResults.errors,
        warnings: validationResult.validationResults.warnings,
        stats: validationResult.validationResults.stats
      },
      crossValidation: {
        success: crossValidationResult.success,
        validatedCount: crossValidationResult.validatedCount,
        discrepancies: crossValidationResult.discrepancies,
        errors: crossValidationResult.errors
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Daily validation failed:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return validation history and statistics
    const history = getValidationHistory();
    
    return NextResponse.json({
      endpoint: 'Daily Validation Status',
      description: 'Get validation history and trigger daily validation with POST',
      usage: {
        'GET': 'Get validation history and statistics',
        'POST': 'Trigger daily validation and lock process'
      },
      history: {
        totalDays: history.totalDays,
        successRate: `${history.successRate.toFixed(1)}%`,
        totalTransactionsLocked: history.totalTransactionsLocked,
        recentValidations: history.recentValidations.slice(-7).map(log => ({
          date: log.date,
          isValid: log.validationResults.isValid,
          lockedTransactions: log.lockedTransactions,
          newTransactions: log.newTransactions,
          totalTransactions: log.totalTransactions,
          errors: log.validationResults.errors.length,
          warnings: log.validationResults.warnings.length
        }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to get validation history:', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}