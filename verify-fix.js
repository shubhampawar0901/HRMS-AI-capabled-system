// Simple verification of the fix logic
console.log('🧪 Testing Anomaly Data Fix Logic...\n');

// Simulate the problematic data that was causing the error
const problematicData = {
  stdDev: "2.5",  // String value (as it might come from database)
  avgHours: "8.2",
  variance: "6.25"
};

console.log('📊 Test data:', problematicData);
console.log('📊 stdDev type:', typeof problematicData.stdDev);

// Test the old problematic code
try {
  const oldResult = (problematicData.stdDev || 0).toFixed(1);
  console.log('❌ Old code should fail but worked:', oldResult);
} catch (error) {
  console.log('✅ Old code fails as expected:', error.message);
}

// Test the new safe code
const safeToFixed = (value, decimals = 1) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(decimals);
};

try {
  const newResult = safeToFixed(problematicData.stdDev);
  console.log('✅ New safe code works:', newResult);
} catch (error) {
  console.log('❌ New code failed:', error.message);
}

// Test with various data types
const testCases = [
  { value: "2.5", expected: "2.5" },
  { value: 2.5, expected: "2.5" },
  { value: null, expected: "0.0" },
  { value: undefined, expected: "0.0" },
  { value: "", expected: "0.0" },
  { value: "invalid", expected: "0.0" }
];

console.log('\n📊 Testing various data types:');
testCases.forEach(testCase => {
  const result = safeToFixed(testCase.value);
  const passed = result === testCase.expected;
  console.log(`${passed ? '✅' : '❌'} Input: ${JSON.stringify(testCase.value)} → Output: ${result} (Expected: ${testCase.expected})`);
});

console.log('\n🎉 Fix verification complete!');
