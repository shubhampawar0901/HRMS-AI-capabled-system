// Debug script to check frontend authentication state
// Run this in browser console

console.log('🔍 FRONTEND AUTH DEBUG');
console.log('=====================');

// Check localStorage
console.log('\n📦 LocalStorage Data:');
console.log('Token:', localStorage.getItem('token')?.substring(0, 50) + '...');
console.log('RefreshToken:', localStorage.getItem('refreshToken')?.substring(0, 50) + '...');

const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('User Object:', user);
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
    console.log('Employee ID:', user.employeeId);
    console.log('Employee Object:', user.employee);
  } catch (e) {
    console.error('Failed to parse user data:', e);
  }
} else {
  console.log('No user data in localStorage');
}

// Check if JWT token contains employeeId
const token = localStorage.getItem('token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('\n🔑 JWT Token Payload:');
    console.log('User ID:', payload.userId);
    console.log('Email:', payload.email);
    console.log('Role:', payload.role);
    console.log('Employee ID:', payload.employeeId);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
  }
}

// Check React context (if available)
if (window.React) {
  console.log('\n⚛️ React Context Available');
} else {
  console.log('\n⚛️ React Context Not Available');
}

console.log('\n🔧 RECOMMENDED ACTIONS:');
console.log('1. Clear localStorage and login again');
console.log('2. Check if AuthContext is properly storing employeeId');
console.log('3. Verify usePayroll hook is reading user.employeeId correctly');
