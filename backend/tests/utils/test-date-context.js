// Test Date Context Generation
function generateDateContext() {
  const now = new Date();
  console.log('Raw Date Object:', now);
  console.log('Current Date String:', now.toString());
  console.log('ISO String:', now.toISOString());
  
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  console.log('Current Month:', currentMonth);
  console.log('Current Year:', currentYear);
  
  // Calculate last month
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  console.log('Last Month:', lastMonth);
  console.log('Last Month Year:', lastMonthYear);
  
  // Calculate week ranges
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(startOfWeek.getDate() - 7);
  const lastWeekEnd = new Date(endOfWeek);
  lastWeekEnd.setDate(endOfWeek.getDate() - 7);

  const dateContext = `- Today: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Month: ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${currentYear}-${currentMonth.toString().padStart(2, '0')}-01 to ${currentYear}-${currentMonth.toString().padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()})
- Last Month: ${new Date(lastMonthYear, lastMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01 to ${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-${new Date(lastMonthYear, lastMonth, 0).getDate()})
- Current Year: ${currentYear}
- This Week: ${startOfWeek.toLocaleDateString()} to ${endOfWeek.toLocaleDateString()}
- Last Week: ${lastWeekStart.toLocaleDateString()} to ${lastWeekEnd.toLocaleDateString()}`;

  console.log('\n=== GENERATED DATE CONTEXT ===');
  console.log(dateContext);
  
  return dateContext;
}

console.log('🗓️ Testing Date Context Generation...\n');
generateDateContext();
