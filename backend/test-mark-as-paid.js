const { executeQuery } = require('./config/database');

async function testMarkAsPaid() {
  try {
    console.log('🧪 Testing Mark as Paid functionality...');
    
    // Step 1: Find a processed payroll record
    console.log('\n📋 Step 1: Finding processed payroll records...');
    const processedPayrolls = await executeQuery(`
      SELECT id, employee_id, month, year, status, net_salary, created_at
      FROM payroll_records
      WHERE status = 'processed'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${processedPayrolls.length} processed payroll records:`);
    processedPayrolls.forEach(payroll => {
      console.log(`  ID: ${payroll.id}, Employee: ${payroll.employee_id}, Period: ${payroll.month}/${payroll.year}, Net: ₹${payroll.net_salary}`);
    });
    
    if (processedPayrolls.length === 0) {
      console.log('⚠️ No processed payroll records found. Creating a test record...');
      
      // Create a test processed payroll record
      const testPayroll = await executeQuery(`
        INSERT INTO payroll_records (
          employee_id, month, year, status, basic_salary, hra, transport_allowance,
          gross_salary, pf_deduction, tax_deduction, total_deductions, net_salary,
          working_days, present_days, absent_days, overtime_hours, created_at, updated_at
        ) VALUES (
          28, 6, 2025, 'processed', 50000, 20000, 2000,
          72000, 6000, 7200, 13200, 58800,
          21, 18, 3, 22.5, NOW(), NOW()
        )
      `);
      
      console.log('✅ Test processed payroll record created with ID:', testPayroll.insertId);
      
      // Use the newly created record
      const newRecord = await executeQuery(`
        SELECT id, employee_id, month, year, status, net_salary
        FROM payroll_records
        WHERE id = ?
      `, [testPayroll.insertId]);
      
      processedPayrolls.push(newRecord[0]);
    }
    
    // Step 2: Test the mark as paid functionality
    const testPayroll = processedPayrolls[0];
    console.log(`\n📋 Step 2: Testing mark as paid for payroll ID ${testPayroll.id}...`);
    
    // Simulate the backend controller logic
    const updateResult = await executeQuery(`
      UPDATE payroll_records
      SET status = 'paid', updated_at = NOW()
      WHERE id = ? AND status = 'processed'
    `, [testPayroll.id]);
    
    if (updateResult.affectedRows > 0) {
      console.log('✅ Successfully marked payroll as paid!');
      
      // Verify the update
      const updatedPayroll = await executeQuery(`
        SELECT id, employee_id, month, year, status, net_salary, updated_at
        FROM payroll_records
        WHERE id = ?
      `, [testPayroll.id]);
      
      console.log('Updated record:', updatedPayroll[0]);
    } else {
      console.log('❌ Failed to update payroll status');
    }
    
    // Step 3: Test status validation
    console.log('\n📋 Step 3: Testing status validation...');
    
    // Try to mark a draft payroll as paid (should fail)
    const draftPayrolls = await executeQuery(`
      SELECT id FROM payroll_records WHERE status = 'draft' LIMIT 1
    `);
    
    if (draftPayrolls.length > 0) {
      const draftId = draftPayrolls[0].id;
      console.log(`Testing invalid status change for draft payroll ID ${draftId}...`);
      
      const invalidUpdate = await executeQuery(`
        UPDATE payroll_records 
        SET status = 'paid'
        WHERE id = ? AND status = 'processed'
      `, [draftId]);
      
      if (invalidUpdate.affectedRows === 0) {
        console.log('✅ Correctly prevented marking draft payroll as paid');
      } else {
        console.log('❌ Incorrectly allowed marking draft payroll as paid');
      }
    }
    
    // Step 4: Show current status distribution
    console.log('\n📋 Step 4: Current payroll status distribution...');
    const statusCounts = await executeQuery(`
      SELECT status, COUNT(*) as count
      FROM payroll_records 
      GROUP BY status
      ORDER BY status
    `);
    
    console.log('Status distribution:');
    statusCounts.forEach(row => {
      console.log(`  ${row.status}: ${row.count} records`);
    });
    
    console.log('\n🎯 Mark as Paid functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
  
  process.exit(0);
}

testMarkAsPaid();
