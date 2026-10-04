// Native Node.js fetch is available in Node 18+

const API_BASE = 'http://localhost:5000/api';

async function testOtpSystem() {
  console.log('--- STARTING COMPREHENSIVE EMAIL OTP VERIFICATION SYSTEM TEST ---');

  const testEmail = 'kulkarnisourabh807@gmail.com';

  // 1. Test Chatbot Explanation of OTP Process
  console.log('\n[1] Testing AI Chatbot Explanation of OTP verification...');
  try {
    const chatRes = await fetch(`${API_BASE}/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How does the email OTP verification work?' })
    });
    const chatData = await chatRes.json();
    console.log('Chatbot Category:', chatData.category);
    console.log('Chatbot Answer:\n', chatData.answer);
    if (chatData.category === 'VERIFICATION' && chatData.answer.includes('6-digit')) {
      console.log('✅ Chatbot explanation test PASSED.');
    } else {
      console.error('❌ Chatbot explanation did not match expected structure.');
    }
  } catch (err) {
    console.error('❌ Chatbot test failed:', err.message);
  }

  // 2. Test send-otp endpoint
  console.log('\n[2] Testing POST /api/auth/send-otp...');
  let sendData = null;
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    sendData = await res.json();
    console.log('Send OTP Response:', sendData);

    if (sendData.code || sendData.otp) {
      console.error('❌ SECURITY FAILURE: Plain-text OTP was returned in API response!');
    } else {
      console.log('✅ SECURITY PASS: No plain-text OTP exposed in API response.');
    }

    if (sendData.success) {
      console.log('✅ OTP generation & email dispatch succeeded.');
    }
  } catch (err) {
    console.error('❌ send-otp failed:', err.message);
  }

  // 3. Test Resend Rate Limiting (Cooldown 60s)
  console.log('\n[3] Testing Resend Rate Limiting (Immediate second request)...');
  try {
    const rateRes = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const rateData = await rateRes.json();
    console.log(`Status: ${rateRes.status}, Response:`, rateData);
    if (rateRes.status === 429) {
      console.log('✅ Rate limiting PASS: Immediate resend blocked with HTTP 429.');
    } else {
      console.warn('⚠️ Rate limit did not trigger 429.');
    }
  } catch (err) {
    console.error('Rate limit test error:', err.message);
  }

  // 4. Test Verification with Incorrect OTP & Guess Rate Limiting
  console.log('\n[4] Testing Guess Rate Limiting on /api/auth/verify-otp...');
  for (let i = 1; i <= 5; i++) {
    const fakeCode = `99999${i}`;
    const vRes = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: fakeCode })
    });
    const vData = await vRes.json();
    console.log(`Attempt ${i} (Code: ${fakeCode}) -> Status ${vRes.status}: ${vData.message}`);
    
    if (i === 5) {
      if (vRes.status === 429 && vData.message.includes('invalidated')) {
        console.log('✅ Guess Rate Limiting PASS: OTP invalidated after 5 failed attempts.');
      } else {
        console.warn('⚠️ 5th attempt status:', vRes.status);
      }
    }
  }

  console.log('\n--- ALL OTP SECURITY AND FUNCTIONALITY TESTS COMPLETED ---');
}

testOtpSystem();
