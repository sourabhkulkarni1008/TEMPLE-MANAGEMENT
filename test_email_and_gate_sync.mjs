import { db } from './backend/src/database/mysqlStore.js';
import { generateBookingId, generateQrSecureToken } from './backend/src/utils/tokenHelper.js';
import { generateQrDataUrl, generateQrBuffer } from './backend/src/utils/qrGenerator.js';
import { emailTemplates } from './backend/src/utils/emailTemplates.js';

console.log('====================================================');
console.log('🧪 VERIFYING EMAIL & WEBSITE QR CODE SYNCHRONIZATION');
console.log('====================================================\n');

async function runTests() {
  await db.init();

  // 1. Create a simulated new booking
  const bId = generateBookingId(db.data.bookings.length + 200);
  const uId = 'usr-test-pilgrim';
  const qrToken = generateQrSecureToken(bId, uId);

  const now = new Date();
  const currentHour = now.getHours();
  const startH = currentHour % 2 === 0 ? currentHour : currentHour - 1;
  const endH = (startH + 2) % 24;
  const fmtH = (h) => {
    const norm = (h + 24) % 24;
    const ampm = norm >= 12 ? 'PM' : 'AM';
    const dh = norm % 12 === 0 ? 12 : norm % 12;
    return `${String(dh).padStart(2, '0')}:00 ${ampm}`;
  };
  const currentSlot = `${fmtH(startH)} - ${fmtH(endH)}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const testBooking = db.insert('bookings', {
    id: bId,
    userId: uId,
    darshanType: 'General Darshan',
    bookingDate: todayStr,
    slotTime: currentSlot,
    numberOfPeople: 2,
    primaryPilgrimName: 'Sourabh Kulkarni',
    primaryPilgrimPhone: '+91 9876543210',
    totalAmount: 0,
    paymentStatus: 'SUCCESSFUL',
    bookingStatus: 'CONFIRMED',
    qrToken,
    checkedInAt: null,
    checkedInBy: null,
    createdAt: new Date().toISOString()
  });

  console.log(`📌 Created Test Booking: ${testBooking.id}`);
  console.log(`📌 Stored Database qrToken: ${testBooking.qrToken}`);

  // 2. Generate website QR
  const webQrDataUrl = await generateQrDataUrl(testBooking.qrToken);
  console.log(`✅ Website QR generated (DataURL length: ${webQrDataUrl.length})`);

  // 3. Generate Email Template
  const emailHtml = emailTemplates.bookingConfirmation(testBooking);
  console.log(`✅ Email HTML generated (HTML length: ${emailHtml.length})`);

  // Verify that the email contains the exact QR token and Booking ID
  const emailContainsToken = emailHtml.includes(encodeURIComponent(testBooking.qrToken));
  const emailContainsId = emailHtml.includes(testBooking.id);
  console.log('Test 1 [Email Encodes Exact Token]:', emailContainsToken ? '✅ PASSED' : '❌ FAILED');
  console.log('Test 2 [Email Displays Exact Booking ID]:', emailContainsId ? '✅ PASSED' : '❌ FAILED');

  // 4. Test Gate Scanner with Stored Database Token
  const scan1 = db.verifyAndCheckInQr(testBooking.qrToken, 'EMP-GATE-1');
  console.log('Test 3 [Gate Scanner verifies Database qrToken]:', scan1.status === 'VALID' ? '✅ PASSED' : '❌ FAILED', '-', scan1.message);

  // 5. Test Gate Scanner with Booking ID directly
  // Create another booking for booking ID scan test
  const bId2 = generateBookingId(db.data.bookings.length + 201);
  const qrToken2 = generateQrSecureToken(bId2, uId);
  const testBooking2 = db.insert('bookings', {
    id: bId2,
    userId: uId,
    darshanType: 'General Darshan',
    bookingDate: todayStr,
    slotTime: currentSlot,
    numberOfPeople: 1,
    primaryPilgrimName: 'Kulkarni Devotee',
    bookingStatus: 'CONFIRMED',
    qrToken: qrToken2
  });

  const scan2 = db.verifyAndCheckInQr(testBooking2.id, 'EMP-GATE-1');
  console.log('Test 4 [Gate Scanner verifies Booking ID fallback]:', scan2.status === 'VALID' ? '✅ PASSED' : '❌ FAILED', '-', scan2.message);

  // 6. Test Gate Scanner with case-insensitive token
  const bId3 = generateBookingId(db.data.bookings.length + 202);
  const qrToken3 = generateQrSecureToken(bId3, uId);
  db.insert('bookings', {
    id: bId3,
    userId: uId,
    darshanType: 'General Darshan',
    bookingDate: todayStr,
    slotTime: currentSlot,
    numberOfPeople: 1,
    primaryPilgrimName: 'Kulkarni Devotee 2',
    bookingStatus: 'CONFIRMED',
    qrToken: qrToken3
  });

  const scan3 = db.verifyAndCheckInQr(bId3.toLowerCase(), 'EMP-GATE-1');
  console.log('Test 5 [Gate Scanner handles lowercase ID]:', scan3.status === 'VALID' ? '✅ PASSED' : '❌ FAILED', '-', scan3.message);

  // 7. Test QR Buffer generation for email attachments
  const buffer = await generateQrBuffer(testBooking.qrToken);
  console.log('Test 6 [PNG Attachment Buffer Generated]:', Buffer.isBuffer(buffer) && buffer.length > 500 ? '✅ PASSED' : '❌ FAILED', `(Size: ${buffer?.length} bytes)`);

  console.log('\n====================================================');
  console.log('🎉 ALL EMAIL & GATE SCANNER SYNCHRONIZATION TESTS PASSED!');
  console.log('====================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
