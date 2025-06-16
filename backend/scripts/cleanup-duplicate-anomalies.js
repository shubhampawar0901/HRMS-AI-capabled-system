/**
 * Cleanup Script for Duplicate Anomalies
 * 
 * This script removes duplicate anomaly records from the database
 * and keeps only the most recent record for each employee/anomaly type combination.
 * 
 * Usage: node scripts/cleanup-duplicate-anomalies.js
 */

const { executeQuery } = require('../config/database');

class AnomalyCleanupService {
  constructor() {
    this.stats = {
      totalRecords: 0,
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      recordsKept: 0,
      errors: 0
    };
  }

  async run() {
    try {
      console.log('🧹 Starting anomaly duplicate cleanup...');
      
      // Get initial count
      await this.getInitialStats();
      
      // Find and process duplicates
      await this.findAndCleanupDuplicates();
      
      // Get final stats
      await this.getFinalStats();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    }
  }

  async getInitialStats() {
    const result = await executeQuery('SELECT COUNT(*) as count FROM ai_attendance_anomalies');
    this.stats.totalRecords = result[0].count;
    console.log(`📊 Initial total records: ${this.stats.totalRecords}`);
  }

  async findAndCleanupDuplicates() {
    // Find all duplicate groups (same employee + anomaly type + similar date)
    const duplicateGroupsQuery = `
      SELECT 
        employee_id,
        anomaly_type,
        DATE(detected_date) as detection_date,
        COUNT(*) as duplicate_count,
        GROUP_CONCAT(id ORDER BY created_at DESC) as ids
      FROM ai_attendance_anomalies
      WHERE status = 'active'
      GROUP BY employee_id, anomaly_type, DATE(detected_date)
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `;

    const duplicateGroups = await executeQuery(duplicateGroupsQuery);
    console.log(`🔍 Found ${duplicateGroups.length} duplicate groups`);

    for (const group of duplicateGroups) {
      await this.processDuplicateGroup(group);
    }
  }

  async processDuplicateGroup(group) {
    try {
      const { employee_id, anomaly_type, detection_date, duplicate_count, ids } = group;
      const idArray = ids.split(',').map(id => parseInt(id));
      
      console.log(`🔄 Processing ${duplicate_count} duplicates for employee ${employee_id}, type: ${anomaly_type}, date: ${detection_date}`);
      
      // Keep the most recent record (first in the DESC ordered list)
      const keepId = idArray[0];
      const deleteIds = idArray.slice(1);
      
      // Get employee name for logging
      const employeeQuery = `
        SELECT CONCAT(first_name, ' ', last_name) as name 
        FROM employees 
        WHERE id = ?
      `;
      const employeeResult = await executeQuery(employeeQuery, [employee_id]);
      const employeeName = employeeResult[0]?.name || `Employee ${employee_id}`;
      
      // Delete duplicate records
      for (const deleteId of deleteIds) {
        await executeQuery('DELETE FROM ai_attendance_anomalies WHERE id = ?', [deleteId]);
        this.stats.duplicatesRemoved++;
      }
      
      console.log(`✅ Kept record ${keepId}, removed ${deleteIds.length} duplicates for ${employeeName}`);
      this.stats.recordsKept++;
      this.stats.duplicatesFound += duplicate_count;
      
    } catch (error) {
      console.error(`❌ Error processing duplicate group:`, error);
      this.stats.errors++;
    }
  }

  async getFinalStats() {
    const result = await executeQuery('SELECT COUNT(*) as count FROM ai_attendance_anomalies');
    const finalCount = result[0].count;
    console.log(`📊 Final total records: ${finalCount}`);
  }

  displayResults() {
    console.log('\n🎉 Cleanup completed!');
    console.log('=====================================');
    console.log(`📊 Statistics:`);
    console.log(`   • Initial records: ${this.stats.totalRecords}`);
    console.log(`   • Duplicate groups found: ${this.stats.duplicatesFound}`);
    console.log(`   • Records removed: ${this.stats.duplicatesRemoved}`);
    console.log(`   • Records kept: ${this.stats.recordsKept}`);
    console.log(`   • Errors: ${this.stats.errors}`);
    console.log(`   • Space saved: ${this.stats.duplicatesRemoved} records`);
    console.log('=====================================');
    
    if (this.stats.duplicatesRemoved > 0) {
      console.log('✅ Database cleanup successful!');
    } else {
      console.log('ℹ️ No duplicates found to clean up.');
    }
  }

  // Method to preview duplicates without deleting
  async previewDuplicates() {
    console.log('👀 Preview mode - showing duplicates without deleting...');
    
    const duplicateGroupsQuery = `
      SELECT 
        employee_id,
        anomaly_type,
        DATE(detected_date) as detection_date,
        COUNT(*) as duplicate_count,
        GROUP_CONCAT(id ORDER BY created_at DESC) as ids,
        GROUP_CONCAT(CONCAT('ID:', id, ' Created:', created_at) ORDER BY created_at DESC SEPARATOR ' | ') as details
      FROM ai_attendance_anomalies
      WHERE status = 'active'
      GROUP BY employee_id, anomaly_type, DATE(detected_date)
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `;

    const duplicateGroups = await executeQuery(duplicateGroupsQuery);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`\n🔍 Found ${duplicateGroups.length} duplicate groups:\n`);
    
    for (const group of duplicateGroups) {
      // Get employee name
      const employeeQuery = `
        SELECT CONCAT(first_name, ' ', last_name) as name 
        FROM employees 
        WHERE id = ?
      `;
      const employeeResult = await executeQuery(employeeQuery, [group.employee_id]);
      const employeeName = employeeResult[0]?.name || `Employee ${group.employee_id}`;
      
      console.log(`👤 ${employeeName} (ID: ${group.employee_id})`);
      console.log(`   Type: ${group.anomaly_type}`);
      console.log(`   Date: ${group.detection_date}`);
      console.log(`   Duplicates: ${group.duplicate_count}`);
      console.log(`   Details: ${group.details}`);
      console.log('   ---');
    }
    
    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.duplicate_count, 0);
    const totalToRemove = duplicateGroups.reduce((sum, group) => sum + (group.duplicate_count - 1), 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   • Total duplicate records: ${totalDuplicates}`);
    console.log(`   • Records to be removed: ${totalToRemove}`);
    console.log(`   • Records to be kept: ${duplicateGroups.length}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isPreview = args.includes('--preview') || args.includes('-p');
  
  const cleanupService = new AnomalyCleanupService();
  
  if (isPreview) {
    await cleanupService.previewDuplicates();
  } else {
    await cleanupService.run();
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = AnomalyCleanupService;
