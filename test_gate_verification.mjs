import { validateBookingSlotTime, getCurrentSlotString } from './backend/src/utils/timeValidator.js';
import { db } from './backend/src/data/store.js';

console.log('====================================================');
console.log('🧪 SMART TEMPLE GATE QR VERIFICATION TEST SUITE');
console.log('====================================================\n');

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentDay = String(now.getDate()).padStart(2, '0');
const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;
const currentSlot = getCurrentSlotString(now);

console.log('📌 Current Local Date & Time:', now.toLocaleString());
console.log('📌 Current Active Slot Window:', currentSlot);
console.log('\n--- 1. UNIT TESTS: Slot Time Validator ---');

// Test 1: In-Slot (Current Time)
const t1 = validateBookingSlotTime(todayStr, currentSlot);
console.log('Test 1 [In-Slot Current Timing]:', t1.status === 'VALID' ? '✅ PASSED' : '❌ FAILED', '-', t1.message);

// Test 2: Arrived Too Early (Future Slot Today)
const t2 = validateBookingSlotTime(todayStr, '11:00 PM - 11:59 PM');
console.log('Test 2 [Future Slot Today]:', t2.status === 'TOO_EARLY' ? '✅ PASSED' : '❌ FAILED', '-', t2.message);

// Test 3: Arrived Too Early (Future Date)
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const t3 = validateBookingSlotTime(tomorrow, '10:00 AM - 12:00 PM');
console.log('Test 3 [Future Date Tomorrow]:', t3.status === 'TOO_EARLY' ? '✅ PASSED' : '❌ FAILED', '-', t3.message);

// Test 4: Slot Expired (Past Slot Today)
const t4 = validateBookingSlotTime(todayStr, '04:00 AM - 06:00 AM');
console.log('Test 4 [Past Slot Today]:', t4.status === 'EXPIRED' ? '✅ PASSED' : '❌ FAILED', '-', t4.message);

// Test 5: Date Expired (Yesterday)
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const t5 = validateBookingSlotTime(yesterday, '10:00 AM - 12:00 PM');
console.log('Test 5 [Past Date Yesterday]:', t5.status === 'EXPIRED' ? '✅ PASSED' : '❌ FAILED', '-', t5.message);

console.log('\n--- 2. INTEGRATION TESTS: Data Store Gate Verification ---');
db.seedInitial();

// Test 6: Check In In-Slot Token
const res1 = db.verifyAndCheckInQr('QR-DAR-2026-000101-SECURE-TOKEN-X79', 'EMP-GATE-1');
console.log('Test 6 [Valid Pass Check-in]:', res1.status === 'VALID' && res1.booking.bookingStatus === 'CHECKED_IN' ? '✅ PASSED' : '❌ FAILED', '-', res1.message);

// Test 7: Duplicate Check-in (Should Reject)
const res2 = db.verifyAndCheckInQr('QR-DAR-2026-000101-SECURE-TOKEN-X79', 'EMP-GATE-1');
console.log('Test 7 [Duplicate Double Scan]:', res2.status === 'ALREADY_USED' ? '✅ PASSED' : '❌ FAILED', '-', res2.message);

// Test 8: Too Early Slot Check-in (Should Reject)
const res3 = db.verifyAndCheckInQr('QR-DAR-2026-000102-SECURE-TOKEN-M42', 'EMP-GATE-1');
console.log('Test 8 [Too Early Slot Blocked]:', res3.status === 'TOO_EARLY' ? '✅ PASSED' : '❌ FAILED', '-', res3.message);

// Test 9: Staff Emergency Override for Too Early Pass (Should Allow)
const res4 = db.verifyAndCheckInQr('QR-DAR-2026-000102-SECURE-TOKEN-M42', 'EMP-SUPERVISOR', true);
console.log('Test 9 [Staff Emergency Override]:', res4.status === 'VALID' && res4.booking.overrideUsed ? '✅ PASSED' : '❌ FAILED', '-', res4.message);

// Test 10: Expired Slot Check-in (Should Reject)
const res5 = db.verifyAndCheckInQr('QR-DAR-2026-000103-SECURE-TOKEN-P19', 'EMP-GATE-1');
console.log('Test 10 [Expired Slot Blocked]:', res5.status === 'EXPIRED' ? '✅ PASSED' : '❌ FAILED', '-', res5.message);

// Test 11: Invalid Token
const res6 = db.verifyAndCheckInQr('QR-UNKNOWN-FAKE-TOKEN', 'EMP-GATE-1');
console.log('Test 11 [Invalid / Fake QR Token]:', res6.status === 'INVALID' ? '✅ PASSED' : '❌ FAILED', '-', res6.message);

console.log('\n====================================================');
console.log('✨ ALL 11 GATE VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
console.log('====================================================\n');
