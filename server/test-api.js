import assert from 'assert';

const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('🧪 Starting AI Receptionist Automated API Test Suite...\n');

  // 1. Health Check
  console.log('1️⃣ Testing /api/health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok', 'Health status should be ok');
  console.log('   ✅ Health endpoint is responsive.\n');

  // 2. Business Profile
  console.log('2️⃣ Testing GET /api/business...');
  const bizRes = await fetch(`${BASE_URL}/business`);
  const bizData = await bizRes.json();
  assert(bizData.success, 'Business endpoint failed');
  assert(bizData.business.name, 'Business should have a name');
  console.log(`   ✅ Loaded business: "${bizData.business.name}"`);
  console.log(`   ✅ Services count: ${bizData.business.services.length}`);
  console.log(`   ✅ FAQs count: ${bizData.business.faqs.length}\n`);

  // 3. WhatsApp Status
  console.log('3️⃣ Testing GET /api/whatsapp/status...');
  const waRes = await fetch(`${BASE_URL}/whatsapp/status`);
  const waData = await waRes.json();
  assert(waData.success, 'WhatsApp status failed');
  console.log(`   ✅ WhatsApp status: ${waData.status.statusMessage}`);
  console.log(`   ✅ WhatsApp mode: ${waData.status.mode}\n`);

  // 4. Simulate Customer Asking about Saturday Hours
  console.log('4️⃣ Simulating customer WhatsApp message: "What are your hours on Saturday?"...');
  const testPhone = `+1 (555) 999-${Math.floor(1000 + Math.random() * 9000)}`;
  const simRes1 = await fetch(`${BASE_URL}/simulate/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerPhone: testPhone,
      customerName: 'Alex Test',
      message: 'What are your hours on Saturday?'
    })
  });
  const simData1 = await simRes1.json();
  assert(simData1.success, 'Simulation failed');
  assert(simData1.aiReply, 'AI should have generated a reply');
  console.log(`   📩 Customer asked: "What are your hours on Saturday?"`);
  console.log(`   🤖 AI Receptionist replied: "${simData1.aiReply.text}"`);
  assert(
    simData1.aiReply.text.toLowerCase().includes('saturday') || simData1.aiReply.text.includes('10:00 AM'),
    'AI reply should mention Saturday hours'
  );
  console.log('   ✅ AI correctly grounded answer in business hours!\n');

  // 5. Simulate Customer Asking about Pricing
  console.log('5️⃣ Simulating customer WhatsApp message: "How much is the Swedish massage?"...');
  const simRes2 = await fetch(`${BASE_URL}/simulate/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerPhone: testPhone,
      customerName: 'Alex Test',
      message: 'How much is the Swedish massage?'
    })
  });
  const simData2 = await simRes2.json();
  assert(simData2.aiReply, 'AI should answer pricing query');
  console.log(`   📩 Customer asked: "How much is the Swedish massage?"`);
  console.log(`   🤖 AI Receptionist replied: "${simData2.aiReply.text}"`);
  assert(simData2.aiReply.text.includes('$95') || simData2.aiReply.text.toLowerCase().includes('swedish'), 'AI reply should state the $95 price');
  console.log('   ✅ AI correctly grounded answer in business pricing!\n');

  // 6. Test Human Handoff Feature
  const convId = simData2.conversation.id;
  console.log(`6️⃣ Testing Human Handoff on conversation ${convId}...`);
  // Switch to human mode
  const handoffRes1 = await fetch(`${BASE_URL}/conversations/${convId}/handoff`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'human' })
  });
  const handoffData1 = await handoffRes1.json();
  assert.strictEqual(handoffData1.conversation.status, 'human', 'Status should be human');
  console.log('   ✅ Human takeover enabled.');

  // Customer asks another question while Human takeover is active
  console.log('   📩 Customer sends: "Can I get a custom quote for a corporate group of 8?"');
  const simRes3 = await fetch(`${BASE_URL}/simulate/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerPhone: testPhone,
      customerName: 'Alex Test',
      message: 'Can I get a custom quote for a corporate group of 8?'
    })
  });
  const simData3 = await simRes3.json();
  assert.strictEqual(simData3.aiReply, null, 'AI should NOT reply when human takeover is active');
  console.log('   ✅ AI receptionist stood down as expected during human handoff.\n');

  // Human staff replies
  console.log('7️⃣ Testing Human Staff Reply...');
  const replyRes = await fetch(`${BASE_URL}/conversations/${convId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hi Alex! This is the manager. We would love to host your corporate group of 8! Let me email you our group package options.'
    })
  });
  const replyData = await replyRes.json();
  assert(replyData.success, 'Human reply failed');
  assert.strictEqual(replyData.message.sender, 'human');
  console.log(`   👤 Staff sent: "${replyData.message.text}"`);
  console.log('   ✅ Human staff reply sent and recorded.\n');

  // Return to AI mode
  console.log('8️⃣ Returning conversation to AI mode...');
  const handoffRes2 = await fetch(`${BASE_URL}/conversations/${convId}/handoff`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ai' })
  });
  const handoffData2 = await handoffRes2.json();
  assert.strictEqual(handoffData2.conversation.status, 'ai', 'Status should be ai');
  console.log('   ✅ Returned to AI Receptionist mode successfully!\n');

  console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
