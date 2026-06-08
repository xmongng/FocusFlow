require('dotenv').config();
const automationService = require('./services/automationService');

async function test() {
  console.log('Testing Email Sync...');
  await automationService.syncEmails();
  console.log('Test completed.');
  process.exit(0);
}

test();
