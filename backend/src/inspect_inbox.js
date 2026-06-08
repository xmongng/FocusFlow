require('dotenv').config();
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

async function checkInbox() {
  try {
    const config = {
      imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST || 'imap.gmail.com',
        port: parseInt(process.env.IMAP_PORT || '993'),
        tls: process.env.IMAP_TLS !== 'false',
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000
      }
    };
    console.log('[Test] Connecting to IMAP...');
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const status = connection.imap._box;
    const totalMessages = status.messages.total;
    console.log(`[Test] Total messages in INBOX: ${totalMessages}`);

    if (totalMessages === 0) {
      connection.end();
      return;
    }

    const startSeq = Math.max(1, totalMessages - 9);
    const endSeq = totalMessages;
    const searchCriteria = [`${startSeq}:${endSeq}`];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false
    };

    console.log(`[Test] Fetching range ${startSeq}:${endSeq}...`);
    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`[Test] Fetched ${messages.length} messages.`);

    messages.reverse();

    for (const item of messages) {
      const all = item.parts.find(part => part.which === '');
      const parsed = await simpleParser("Imap-Id: " + item.attributes.uid + "\r\n" + all.body);
      const from = parsed.from ? parsed.from.value[0].address : 'Không rõ';
      const subject = parsed.subject || 'Không có tiêu đề';
      const text = parsed.text ? parsed.text.trim() : '';

      console.log(`\n----------------------------`);
      console.log(`UID: ${item.attributes.uid}`);
      console.log(`From: ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Snippet: ${text.substring(0, 150).replace(/\n/g, ' ')}`);
    }

    connection.end();
    console.log('\n[Test] Connection closed.');
  } catch(e) {
    console.error(e);
  }
}
checkInbox();
