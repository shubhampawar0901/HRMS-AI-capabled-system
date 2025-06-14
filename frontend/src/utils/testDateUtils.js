// Test file to verify date utility functions work correctly
import { formatTimeFromBackend, calculateWorkDuration, isLateCheckIn, isEarlyCheckOut } from './dateUtils';

// Test data similar to what backend returns
const testData = {
  checkInTime: "12:54:10",
  checkOutTime: "12:54:31",
  date: "2025-06-13T18:30:00.000Z"
};

console.log('=== DATE UTILS TEST ===');
console.log('Input data:', testData);
console.log('');

console.log('formatTimeFromBackend(checkInTime):', formatTimeFromBackend(testData.checkInTime));
console.log('formatTimeFromBackend(checkOutTime):', formatTimeFromBackend(testData.checkOutTime));
console.log('');

console.log('calculateWorkDuration:', calculateWorkDuration(testData.checkInTime, testData.checkOutTime));
console.log('');

console.log('isLateCheckIn:', isLateCheckIn(testData.checkInTime));
console.log('isEarlyCheckOut:', isEarlyCheckOut(testData.checkOutTime));
console.log('');

// Test edge cases
console.log('=== EDGE CASES ===');
console.log('formatTimeFromBackend(null):', formatTimeFromBackend(null));
console.log('formatTimeFromBackend(""):', formatTimeFromBackend(''));
console.log('calculateWorkDuration(null, null):', calculateWorkDuration(null, null));
console.log('calculateWorkDuration("09:00:00", null):', calculateWorkDuration("09:00:00", null));
