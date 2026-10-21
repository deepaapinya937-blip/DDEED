// =========================================================
// DEKTHEP STORE - Master Application Controller
// =========================================================

let currentUser = null;
let oauthConfig = {
  discord: { configured: false },
  google: { configured: false }
};

// Selected card amount tier
let selectedTierAmount = 50;

// Pending buy item
let currentPendingProduct = null;

// DOM References - Auth & Navigation
const authModalOverlay = document.getElementById('authModalOverlay');
const authCard = document.getElementById('authCard');
const profileCard = document.getElementById('profileCard');

const guestNavBtns = document.getElementById('guestNavBtns');
const userNavProfile = document.getElementById('userNavProfile');
const navUserAvatar = document.getElementById('navUserAvatar');
const navUserName = document.getElementById('navUserName');
const userBalanceText = document.getElementById('userBalanceText');

const userDropdownTrigger = document.getElementById('userDropdownTrigger');
const userDropdownMenu = document.getElementById('userDropdownMenu');

const navLoginBtn = document.getElementById('navLoginBtn');
const navRegisterBtn = document.getElementById('navRegisterBtn');
const heroStartBtn = document.getElementById('heroStartBtn');
const navLogoutBtn = document.getElementById('navLogoutBtn');
const modalLogoutBtn = document.getElementById('modalLogoutBtn');

const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');

// Modals
const topupModalOverlay = document.getElementById('topupModalOverlay');
const closeTopupModalBtn = document.getElementById('closeTopupModalBtn');
const topupCurrentBalance = document.getElementById('topupCurrentBalance');

const buyModalOverlay = document.getElementById('buyModalOverlay');
const closeBuyModalBtn = document.getElementById('closeBuyModalBtn');
const btnCancelBuy = document.getElementById('btnCancelBuy');
const btnConfirmBuy = document.getElementById('btnConfirmBuy');
const btnGoToTopup = document.getElementById('btnGoToTopup');
const buyProductTitle = document.getElementById('buyProductTitle');
const buyPriceDisplay = document.getElementById('buyPriceDisplay');
const buyUserBalDisplay = document.getElementById('buyUserBalDisplay');
const buyRemainDisplay = document.getElementById('buyRemainDisplay');
const buyErrorWarning = document.getElementById('buyErrorWarning');
const buySuccessSection = document.getElementById('buySuccessSection');
const buyResultKey = document.getElementById('buyResultKey');
const btnCopyKey = document.getElementById('btnCopyKey');

const historyModalOverlay = document.getElementById('historyModalOverlay');
const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
const histOrdersList = document.getElementById('histOrdersList');
const histTxList = document.getElementById('histTxList');

// Auth Form Elements
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const tabIndicator = document.getElementById('tabIndicator');

const subBadge = document.getElementById('subBadge');
const mainTitle = document.getElementById('mainTitle');
const subTitle = document.getElementById('subTitle');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const discordLoginBtn = document.getElementById('discordLoginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const discordBtnText = document.getElementById('discordBtnText');
const googleBtnText = document.getElementById('googleBtnText');

const helpGuideBtn = document.getElementById('helpGuideBtn');
const guideModal = document.getElementById('guideModal');
const closeGuideBtn = document.getElementById('closeGuideBtn');
const guideOkBtn = document.getElementById('guideOkBtn');

// Toast Notification
function showToast(message, type = 'info', actionBtn = null) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (actionBtn) {
    const btn = document.createElement('button');
    btn.className = 'toast-btn';
    btn.textContent = actionBtn.text;
    btn.onclick = () => {
      actionBtn.onClick();
      toast.remove();
    };
    toast.appendChild(btn);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Format Currency
function formatBaht(amount) {
  const num = Number(amount) || 0;
  return '฿' + num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Modal open/close functions
function openAuthModal(mode = 'login') {
  authModalOverlay.style.display = 'flex';
  authCard.style.display = 'block';
  profileCard.style.display = 'none';
  const wrapper = authModalOverlay.querySelector('.modal-wrapper');
  if (wrapper) wrapper.classList.remove('profile-mode-wrapper');
  switchTab(mode);
}

function closeAuthModal() {
  authModalOverlay.style.display = 'none';
  const wrapper = authModalOverlay.querySelector('.modal-wrapper');
  if (wrapper) wrapper.classList.remove('profile-mode-wrapper');
}

function openProfileModal() {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }
  authModalOverlay.style.display = 'flex';
  authCard.style.display = 'none';
  profileCard.style.display = 'block';
  const wrapper = authModalOverlay.querySelector('.modal-wrapper');
  if (wrapper) wrapper.classList.add('profile-mode-wrapper');
  renderProfileDetails(currentUser);
  if (userDropdownMenu) userDropdownMenu.classList.remove('show');
}

closeAuthModalBtn.addEventListener('click', closeAuthModal);
closeProfileModalBtn.addEventListener('click', closeAuthModal);
authModalOverlay.addEventListener('click', (e) => {
  if (e.target === authModalOverlay) closeAuthModal();
});

// Top-up Modal Handlers
function openTopupModal() {
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน', 'info');
    openAuthModal('login');
    return;
  }
  topupCurrentBalance.textContent = formatBaht(currentUser.balance);
  topupModalOverlay.style.display = 'flex';
  if (userDropdownMenu) userDropdownMenu.classList.remove('show');
}

function closeTopupModal() {
  topupModalOverlay.style.display = 'none';
}

closeTopupModalBtn.addEventListener('click', closeTopupModal);
topupModalOverlay.addEventListener('click', (e) => {
  if (e.target === topupModalOverlay) closeTopupModal();
});

// Top-up Tabs Switching
document.querySelectorAll('.topup-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.topup-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.topup-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(`panel-${tabId}`).classList.add('active');
  });
});

// Amount Tier Selection
document.querySelectorAll('.tier-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTierAmount = Number(btn.getAttribute('data-amount')) || 50;
  });
});

// Form: TrueMoney Card (เช็คบัตรจริง)
const formTrueCard = document.getElementById('formTrueCard');
const trueCardPinInput = document.getElementById('trueCardPin');
const btnSubmitCard = document.getElementById('btnSubmitCard');

if (formTrueCard && trueCardPinInput && btnSubmitCard) {
  trueCardPinInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 14) val = val.slice(0, 14);
    e.target.value = val;
  });

  formTrueCard.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = trueCardPinInput.value.trim();
    if (pin.length !== 14) {
      showToast('รหัสบัตรเงินสดทรูมันนี่ต้องเป็นตัวเลข 14 หลักพอดี', 'error');
      return;
    }
    btnSubmitCard.disabled = true;
    btnSubmitCard.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบรหัสบัตรทรูมันนี่...</span>`;
    try {
      const res = await fetch('/api/topup/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardPin: pin, amount: selectedTierAmount })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        updateUserState(data.user);
        topupCurrentBalance.textContent = formatBaht(data.user.balance);
        trueCardPinInput.value = '';
        setTimeout(() => closeTopupModal(), 1200);
      } else {
        showToast(data.error || 'การตรวจสอบบัตรไม่สำเร็จ', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อระบบเติมเงิน', 'error');
    } finally {
      btnSubmitCard.disabled = false;
      btnSubmitCard.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>ตรวจสอบและเติมเงินทันที</span>`;
    }
  });
}

// Form: TrueMoney Voucher (ซองของขวัญ)
const formVoucher = document.getElementById('formVoucher');
const voucherUrlInput = document.getElementById('voucherUrl');
const btnSubmitVoucher = document.getElementById('btnSubmitVoucher');

formVoucher.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = voucherUrlInput.value.trim();

  btnSubmitVoucher.disabled = true;
  btnSubmitVoucher.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบซองของขวัญ...</span>`;

  try {
    const res = await fetch('/api/topup/voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucherUrl: url })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      updateUserState(data.user);
      topupCurrentBalance.textContent = formatBaht(data.user.balance);
      voucherUrlInput.value = '';
      setTimeout(() => closeTopupModal(), 1200);
    } else {
      showToast(data.error || 'ไม่สามารถรับเงินจากซองได้', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการรับซองของขวัญ', 'error');
  } finally {
    btnSubmitVoucher.disabled = false;
    btnSubmitVoucher.innerHTML = `<i class="fa-solid fa-gift"></i> <span>รับเงินจากซองของขวัญทันที</span>`;
  }
});

// Slip state for modal
let modalSelectedSlipBase64 = null;

function handleModalSlipSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('ขนาดไฟล์สลิปใหญ่เกิน 10MB กรุณาเลือกไฟล์ใหม่', 'error');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    modalSelectedSlipBase64 = e.target.result;
    const box = document.getElementById('modalSlipPreviewBox');
    const img = document.getElementById('modalSlipPreviewImg');
    const nameEl = document.getElementById('modalSlipFileName');
    const labelText = document.getElementById('modalSlipLabelText');

    if (box) box.style.display = 'flex';
    if (img) img.src = modalSelectedSlipBase64;
    if (nameEl) nameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (labelText) labelText.textContent = 'เปลี่ยนรูปสลิป';
    showToast('แนบรูปภาพสลิปเรียบร้อยแล้ว', 'success');
  };
  reader.readAsDataURL(file);
}
window.handleModalSlipSelected = handleModalSlipSelected;

function removeModalSelectedSlip(e) {
  if (e) e.stopPropagation();
  modalSelectedSlipBase64 = null;
  const input = document.getElementById('modalBankSlipFile');
  if (input) input.value = '';
  const box = document.getElementById('modalSlipPreviewBox');
  const img = document.getElementById('modalSlipPreviewImg');
  const labelText = document.getElementById('modalSlipLabelText');

  if (box) box.style.display = 'none';
  if (img) img.src = '';
  if (labelText) labelText.textContent = 'แนบรูปภาพสลิปการโอนเงิน *';
}
window.removeModalSelectedSlip = removeModalSelectedSlip;

// Form: Bank Transfer in Modal
const formBank = document.getElementById('formBank');
const bankAmountInput = document.getElementById('bankAmount');
const bankTimeInput = document.getElementById('bankTime');
const btnSubmitBank = document.getElementById('btnSubmitBank');

formBank?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการแจ้งโอนเงิน', 'info');
    openAuthModal('login');
    return;
  }

  const amount = parseFloat(bankAmountInput.value);
  const time = bankTimeInput.value.trim();

  if (!modalSelectedSlipBase64) {
    showToast('กรุณาแนบรูปภาพสลิปการโอนเงินก่อนกดยืนยัน', 'error');
    return;
  }

  btnSubmitBank.disabled = true;
  btnSubmitBank.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบสลิป...</span>`;

  try {
    const res = await fetch('/api/topup/bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        transferTime: time,
        slipRef: 'GSB_REF_' + Date.now().toString().slice(-6),
        slipImage: modalSelectedSlipBase64
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      updateUserState(data.user);
      topupCurrentBalance.textContent = formatBaht(data.user.balance);
      bankAmountInput.value = '';
      bankTimeInput.value = '';
      removeModalSelectedSlip();
      setTimeout(() => closeTopupModal(), 1200);
    } else {
      showToast(data.error || 'เกิดข้อผิดพลาดในการยืนยันยอดเงิน', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
  } finally {
    btnSubmitBank.disabled = false;
    btnSubmitBank.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>ส่งสลิปยืนยันยอดเงิน</span>`;
  }
});

// ==========================================
// DEDICATED TOP-UP PAGE CONTROLLERS (หน้าเติมเงินตรงตามแบบ 100%)
// ==========================================

function updateTopupPageBalance() {
  const topupBigBalanceText = document.getElementById('topupBigBalanceText');
  if (topupBigBalanceText) {
    topupBigBalanceText.textContent = formatBaht(currentUser ? currentUser.balance : 0);
  }
}

function switchPageView(view) {
  const homeView = document.getElementById('homeView');
  const storeView = document.getElementById('storeView');
  const topupView = document.getElementById('topupView');
  const adminView = document.getElementById('adminView');
  const navHomeLink = document.getElementById('navHomeLink');
  const navStoreLink = document.getElementById('navStoreLink');
  const navTopupLink = document.getElementById('navTopupLink');

  [navHomeLink, navStoreLink, navTopupLink].forEach(link => {
    if (link) link.classList.remove('active');
  });

  if (view === 'admin') {
    window.IS_ADMIN_BYPASS = true;

    if (homeView) homeView.style.display = 'none';
    if (storeView) storeView.style.display = 'none';
    if (topupView) topupView.style.display = 'none';
    if (adminView) adminView.style.display = 'block';

    try {
      initAdminDashboard();
    } catch (err) {
      console.error('Error initializing admin dashboard:', err);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash !== '#admin') {
      history.pushState(null, '', '#admin');
    }
  } else if (view === 'topup') {
    if (homeView) homeView.style.display = 'none';
    if (storeView) storeView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    if (topupView) topupView.style.display = 'block';
    if (navTopupLink) navTopupLink.classList.add('active');
    updateTopupPageBalance();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash !== '#topup') {
      history.pushState(null, '', '#topup');
    }
  } else if (view === 'store') {
    if (homeView) homeView.style.display = 'none';
    if (topupView) topupView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    if (storeView) storeView.style.display = 'block';
    if (navStoreLink) navStoreLink.classList.add('active');
    renderProductsGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash !== '#store') {
      history.pushState(null, '', '#store');
    }
  } else {
    // default: home
    if (storeView) storeView.style.display = 'none';
    if (topupView) topupView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    if (homeView) homeView.style.display = 'block';
    if (navHomeLink) navHomeLink.classList.add('active');
    renderHomeCategoryShowcases();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', '/');
  }

  // Refresh maintenance overlay & admin banner state for non-admin views
  if (view !== 'admin' && typeof applyAnnouncementAndMaintenance === 'function' && window.SITE_SETTINGS) {
    applyAnnouncementAndMaintenance(window.SITE_SETTINGS);
  }
}
window.switchPageView = switchPageView;
window.openTopupPage = () => switchPageView('topup');
window.openAdminPage = () => switchPageView('admin');

// Global current bank account number for quick copying
window.CURRENT_BANK_ACC_NO = '020463192979';

// Copy Bank Account Number Helper
function copyCurrentBankAccNo() {
  const accNo = window.CURRENT_BANK_ACC_NO || '020463192979';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(accNo).then(() => {
      showToast(`คัดลอกเลขบัญชี ${accNo} เรียบร้อยแล้ว`, 'success');
    }).catch(() => {
      prompt('คัดลอกเลขบัญชี:', accNo);
    });
  } else {
    prompt('คัดลอกเลขบัญชี:', accNo);
  }
}
window.copyCurrentBankAccNo = copyCurrentBankAccNo;

// Select Payment Channel on Top-up Page
function selectTopupChannel(channelKey) {
  const card = document.querySelector(`.channel-card[data-channel="${channelKey}"]`);
  if (!card) return;

  if (card.classList.contains('channel-disabled')) {
    showToast('ช่องทางการเติมเงินนี้ปิดปรับปรุงชั่วคราว', 'info');
    return;
  }

  document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.channel-detail-panel').forEach(p => p.style.display = 'none');

  card.classList.add('active');

  const panelMap = {
    truemoney: 'panelDetailTrueMoney',
    bank: 'panelDetailBank',
    coupon: 'panelDetailCoupon'
  };

  const panelId = panelMap[channelKey];
  if (panelId) {
    const panel = document.getElementById(panelId);
    if (panel) panel.style.display = 'block';
  }
}
window.selectTopupChannel = selectTopupChannel;

// Attach click listeners to channel cards
document.querySelectorAll('.channel-card').forEach(card => {
  card.addEventListener('click', () => {
    const channel = card.getAttribute('data-channel');
    selectTopupChannel(channel);
  });
});

// ==============================================================
// 🛍️ RECENT PURCHASES INFINITE MARQUEE LOOP (REAL STORE PRODUCTS)
// ==============================================================
function renderRecentPurchasesTicker() {
  const track = document.getElementById('recentPurchasesMarquee');
  if (!track) return;

  const prods = window.STORE_PRODUCTS || (typeof STORE_PRODUCTS !== 'undefined' ? STORE_PRODUCTS : window.ADMIN_PRODUCTS || []);
  if (!prods || prods.length === 0) return;

  const usernames = ['nin***', 'noo***', 'cha***', 'DEK***', 'K***', 'pro***', 'zen***', 'art***', 'nut***', 'top***', 'bank***', 'max***'];
  const times = ['เมื่อสักครู่', '3 นาทีที่แล้ว', '12 นาทีที่แล้ว', '28 นาทีที่แล้ว', '45 นาทีที่แล้ว', '1 ชม.ที่แล้ว', '2 ชม.ที่แล้ว', '4 ชม.ที่แล้ว', '6 ชม.ที่แล้ว', '9 ชม.ที่แล้ว'];

  let items = [];
  const repeatCount = Math.max(1, Math.ceil(10 / prods.length));
  for (let r = 0; r < repeatCount; r++) {
    for (let i = 0; i < prods.length; i++) {
      const p = prods[i];
      const uIndex = (r * prods.length + i) % usernames.length;
      const tIndex = (r * prods.length + i) % times.length;
      items.push({
        name: p.name,
        image: p.image || p.localImage || 'assets/cat_pc.webp',
        category: p.categoryName || (p.category || 'PC').toUpperCase(),
        user: usernames[uIndex],
        time: times[tIndex],
        id: p.id
      });
    }
  }

  const groupHtml = items.map(item => `
    <div class="recent-item" onclick="handleBuyClick('${item.id || item.name}')" style="cursor: pointer;" title="สั่งซื้อ ${item.name}">
      <img src="${item.image}" alt="${item.name}" class="recent-img" onerror="this.src='assets/logo.jpg'">
      <div class="recent-meta">
        <p class="recent-name">${item.name}</p>
        <p class="recent-buyer"><i class="fa-solid fa-user"></i> ${item.user} · <span>${item.time}</span></p>
      </div>
    </div>
  `).join('');

  track.innerHTML = `
    <div class="marquee-group">${groupHtml}</div>
    <div class="marquee-group" aria-hidden="true">${groupHtml}</div>
  `;
}
window.renderRecentPurchasesTicker = renderRecentPurchasesTicker;

// Apply Payments Configuration across Top-up Page and Modal
function applyPaymentsToDOM(payments) {
  if (!payments) return;

  const bank = payments.bank || {};
  const truemoney = payments.truemoney || {};
  const truecard = payments.truecard || {};
  const coupon = payments.coupon || {};

  const bankAccName = bank.accountName || '';
  const bankName = bank.bankName || 'ธนาคารออมสิน (GSB)';
  const bankAccNumber = bank.accountNo || '020463192979';
  const bankNote = bank.note || 'โอนเงินแล้วกรอกเวลาและเลขอ้างอิงสลิป ระบบตรวจสอบและปรับยอดเงินอัตโนมัติ';

  // Store active bank account number
  window.CURRENT_BANK_ACC_NO = bankAccNumber;

  // 1. Bank on Topup Page
  const bankLogoUrl = bank.bankLogo || (BANK_PRESETS[bank.bankCode]?.logo) || 'assets/banks/gsb.png';
  const bankLogoImg = document.getElementById('bankDisplayLogoImg');
  if (bankLogoImg) bankLogoImg.src = bankLogoUrl;

  const modalBankLogoImg = document.getElementById('modalBankLogoImg');
  if (modalBankLogoImg) modalBankLogoImg.src = bankLogoUrl;

  const bankBadge = document.getElementById('bankDisplayBadgeName');
  if (bankBadge) bankBadge.textContent = bankName;

  const bankTitleHeading = document.getElementById('bankDisplayTitleHeading');
  if (bankTitleHeading) {
    bankTitleHeading.textContent = bankName ? (bankName.startsWith('ธนาคาร') ? bankName : `โอนผ่าน${bankName}`) : 'โอนผ่านธนาคาร';
  }

  const bankAccNo = document.getElementById('bankDisplayAccNo');
  if (bankAccNo) bankAccNo.textContent = bankAccNumber;

  const bankHolder = document.getElementById('bankDisplayHolderName');
  if (bankHolder) bankHolder.textContent = bankAccName;

  // Auto-fill recipient name and today's date in bank transfer form
  const recInput = document.getElementById('pageBankRecipientName');
  if (recInput) {
    recInput.value = bankAccName;
  }
  const dateInput = document.getElementById('pageBankDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  const descEl = document.getElementById('bankDisplayDescText');
  if (descEl) {
    descEl.textContent = bankNote ? `${bankNote}` : `โอนเงินผ่านบัญชี${bankName} ปรับยอดเงินอัตโนมัติ`;
  }

  const promptpayWrapper = document.getElementById('bankDisplayPromptPay');
  const promptpayNoEl = document.getElementById('bankDisplayPromptPayNo');
  if (promptpayWrapper && promptpayNoEl) {
    if (bank.promptpayNo) {
      promptpayNoEl.textContent = bank.promptpayNo;
      promptpayWrapper.style.display = 'block';
    } else {
      promptpayWrapper.style.display = 'none';
    }
  }

  const stepAccText = document.getElementById('bankStepAccText');
  if (stepAccText) {
    stepAccText.innerHTML = `โอนเงินเข้าบัญชี${bankName} เลขที่บัญชี <strong>${bankAccNumber}</strong> (${bankAccName})`;
  }

  // Bank in Modal
  const modalBankBadge = document.getElementById('modalBankBadge');
  if (modalBankBadge) modalBankBadge.textContent = bankName;

  const modalBankAcc = document.getElementById('modalBankAccNo');
  if (modalBankAcc) modalBankAcc.textContent = bankAccNumber;

  const modalBankHolder = document.getElementById('modalBankHolderName');
  if (modalBankHolder) modalBankHolder.textContent = bankAccName;

  // 2. TrueMoney Voucher
  const feeVal = (typeof truemoney.feePercent === 'number') ? truemoney.feePercent : 2.9;
  const tmFeeBadge = document.getElementById('tmFeeBadgeText');
  if (tmFeeBadge) tmFeeBadge.textContent = `ค่าธรรมเนียม ${feeVal}%`;

  const tmStepFee = document.getElementById('tmStepFeeText');
  if (tmStepFee) {
    const net100 = (100 - (100 * feeVal / 100)).toFixed(2);
    tmStepFee.textContent = `มีค่าธรรมเนียม ${feeVal}% หักจากยอดหน้าซองก่อนเครดิตเข้าระบบ (เช่น ซอง 100 บาท เครดิตเข้าระบบ ${net100} บาท)`;
  }

  const modalPhone = document.getElementById('modalTrueMoneyPhone');
  if (modalPhone && truemoney.phone) {
    modalPhone.textContent = truemoney.phone;
  }

  // 3. Channels Enabled/Disabled States
  const channelStates = {
    truemoney: truemoney.enabled !== false,
    bank: bank.enabled !== false,
    coupon: coupon.enabled !== false
  };

  const channelBtnMap = {
    truemoney: { btn: document.getElementById('channelBtnTrueMoney'), status: document.getElementById('channelStatusTrueMoney') },
    bank: { btn: document.getElementById('channelBtnBank'), status: document.getElementById('channelStatusBank') },
    coupon: { btn: document.getElementById('channelBtnCoupon'), status: document.getElementById('channelStatusCoupon') }
  };

  Object.keys(channelStates).forEach(ch => {
    const isEnabled = channelStates[ch];
    const elements = channelBtnMap[ch];
    if (elements && elements.btn) {
      if (!isEnabled) {
        elements.btn.classList.add('channel-disabled');
        if (elements.status) {
          elements.status.textContent = 'ปิดปรับปรุง';
          elements.status.className = 'channel-status-pill pill-closed';
          elements.status.style.display = 'inline-block';
        }
      } else {
        elements.btn.classList.remove('channel-disabled');
        if (elements.status) {
          elements.status.style.display = 'none';
        }
      }
    }
  });

  // Modal Tabs enabled/disabled
  const modalTabMap = {
    truewallet: document.getElementById('modalTabTrueMoney'),
    bank: document.getElementById('modalTabBank')
  };

  if (modalTabMap.truewallet) modalTabMap.truewallet.style.display = channelStates.truemoney ? 'flex' : 'none';
  if (modalTabMap.bank) modalTabMap.bank.style.display = channelStates.bank ? 'flex' : 'none';

  // If current active channel on page is disabled, switch to first active enabled channel
  const activeBtn = document.querySelector('.channel-card.active');
  if (activeBtn && activeBtn.classList.contains('channel-disabled')) {
    const firstEnabled = Object.keys(channelStates).find(ch => channelStates[ch]);
    if (firstEnabled) {
      selectTopupChannel(firstEnabled);
    }
  }
}
window.applyPaymentsToDOM = applyPaymentsToDOM;

// Clipboard Paste Helper for inputs
async function pasteToInput(inputId) {
  try {
    const text = await navigator.clipboard.readText();
    const input = document.getElementById(inputId);
    if (input && text) {
      input.value = text.trim();
      input.dispatchEvent(new Event('input'));
      showToast('วางข้อความจากคลิปบอร์ดแล้ว', 'info');
    }
  } catch (err) {
    showToast('กรุณากดอนุญาตการเข้าถึงคลิปบอร์ด หรือกด Ctrl+V เพื่อวาง', 'info');
  }
}

document.getElementById('btnPasteVoucherInput')?.addEventListener('click', () => pasteToInput('topupVoucherUrlInput'));
document.getElementById('btnPasteCouponInput')?.addEventListener('click', () => pasteToInput('pageCouponCode'));
document.getElementById('btnPasteTrueCardInput')?.addEventListener('click', () => pasteToInput('pageTrueCardPin'));

// 1. Form: TrueMoney Voucher on Page
document.getElementById('topupPageFormVoucher')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน', 'info');
    openAuthModal('login');
    return;
  }

  const input = document.getElementById('topupVoucherUrlInput');
  const url = input.value.trim();
  const btn = document.getElementById('btnPageSubmitVoucher');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบซองของขวัญ...</span>`;

  try {
    const res = await fetch('/api/topup/voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucherUrl: url })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      updateUserState(data.user);
      updateTopupPageBalance();
      input.value = '';
    } else {
      showToast(data.error || 'ไม่สามารถรับเงินจากซองได้', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-square-check"></i> <span>ยืนยันลิงก์อั่งเปา</span>`;
  }
});

// 2. Slip Upload & Drag-and-Drop Handlers for Top-up Page
let currentSelectedSlipBase64 = null;

function handleSlipSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('ขนาดไฟล์สลิปใหญ่เกิน 10MB กรุณาเลือกรูปใหม่', 'error');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    currentSelectedSlipBase64 = e.target.result;

    const emptyState = document.getElementById('slipEmptyState');
    const previewState = document.getElementById('slipPreviewState');
    const previewImg = document.getElementById('slipPreviewImg');
    const fileNameEl = document.getElementById('slipFileName');
    const fileSizeEl = document.getElementById('slipFileSize');

    if (emptyState) emptyState.style.display = 'none';
    if (previewState) previewState.style.display = 'flex';
    if (previewImg) previewImg.src = currentSelectedSlipBase64;
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    showToast('แนบรูปสลิปเรียบร้อยแล้ว', 'success');
  };
  reader.readAsDataURL(file);
}
window.handleSlipSelected = handleSlipSelected;

function removeSelectedSlip(e) {
  if (e) e.stopPropagation();
  currentSelectedSlipBase64 = null;
  const input = document.getElementById('pageBankSlipFile');
  if (input) input.value = '';

  const emptyState = document.getElementById('slipEmptyState');
  const previewState = document.getElementById('slipPreviewState');
  const previewImg = document.getElementById('slipPreviewImg');

  if (emptyState) emptyState.style.display = 'flex';
  if (previewState) previewState.style.display = 'none';
  if (previewImg) previewImg.src = '';
}
window.removeSelectedSlip = removeSelectedSlip;

// Drag and drop for slip dropzone
const pageSlipDropzone = document.getElementById('slipDropzone');
if (pageSlipDropzone) {
  ['dragenter', 'dragover'].forEach(eventName => {
    pageSlipDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      pageSlipDropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    pageSlipDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      pageSlipDropzone.classList.remove('dragover');
    }, false);
  });

  pageSlipDropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt?.files;
    if (files && files.length) {
      const fileInput = document.getElementById('pageBankSlipFile');
      if (fileInput) {
        fileInput.files = files;
        handleSlipSelected(fileInput);
      }
    }
  });
}

// Form: Bank Transfer on Page (Automatic Slip Scan)
document.getElementById('topupPageFormBank')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการแจ้งโอนเงิน', 'info');
    openAuthModal('login');
    return;
  }

  const btn = document.getElementById('btnPageSubmitBank');

  if (!currentSelectedSlipBase64) {
    showToast('กรุณาแนบรูปภาพสลิปการโอนเงินก่อนกดยืนยัน', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังสแกนและตรวจสอบสลิปอัตโนมัติ...</span>`;

  try {
    const res = await fetch('/api/topup/bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slipImage: currentSelectedSlipBase64
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      updateUserState(data.user);
      updateTopupPageBalance();
      removeSelectedSlip();
    } else {
      showToast(data.error || 'เกิดข้อผิดพลาดในการยืนยันยอดเงิน', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>ส่งสลิปยืนยันการโอนเงิน</span>`;
  }
});

// 3. Form: Coupon on Page
document.getElementById('topupPageFormCoupon')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการแลกโค้ดคูปอง', 'info');
    openAuthModal('login');
    return;
  }

  const input = document.getElementById('pageCouponCode');
  const code = input.value.trim();
  const btn = document.getElementById('btnPageSubmitCoupon');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบโค้ดคูปอง...</span>`;

  try {
    const res = await fetch('/api/topup/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      updateUserState(data.user);
      updateTopupPageBalance();
      input.value = '';
    } else {
      showToast(data.error || 'โค้ดคูปองไม่ถูกต้อง', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-square-check"></i> <span>ยืนยันโค้ดคูปอง</span>`;
  }
});

// 4. Form: TrueMoney Card on Page
let pageSelectedTierAmount = 50;
document.querySelectorAll('.page-tier-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page-tier-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    pageSelectedTierAmount = Number(btn.getAttribute('data-amount')) || 50;
  });
});

const pageTrueCardPin = document.getElementById('pageTrueCardPin');
pageTrueCardPin?.addEventListener('input', (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length > 14) val = val.slice(0, 14);
  e.target.value = val;
});

document.getElementById('topupPageFormTrueCard')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน', 'info');
    openAuthModal('login');
    return;
  }

  const pin = pageTrueCardPin.value.trim();
  if (pin.length !== 14) {
    showToast('รหัสบัตรเงินสดทรูมันนี่ต้องเป็นตัวเลข 14 หลักพอดี', 'error');
    return;
  }

  const btn = document.getElementById('btnPageSubmitCard');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบรหัสบัตร...</span>`;

  try {
    const res = await fetch('/api/topup/card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardPin: pin, amount: pageSelectedTierAmount })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      updateUserState(data.user);
      updateTopupPageBalance();
      pageTrueCardPin.value = '';
    } else {
      showToast(data.error || 'การตรวจสอบบัตรไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-square-check"></i> <span>ตรวจสอบและเติมเงินทันที</span>`;
  }
});

// ==============================================================
// Purchase Modal Handlers (ตรงตาม Image 3 & dekthepstore.dekhere.pro)
// ==============================================================
window.currentBuyProduct = null;
window.currentBuyVariant = null;
window.currentBuyQty = 1;
window.currentBuyDiscountPercent = 0;
window.currentBuyDiscountCode = '';

function handleBuyClick(productName, price) {
  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า', 'info');
    openAuthModal('login');
    return;
  }

  // Find full product object from store or admin
  const allProds = window.STORE_PRODUCTS || (typeof STORE_PRODUCTS !== 'undefined' ? STORE_PRODUCTS : window.ADMIN_PRODUCTS || []);
  let prod = allProds.find(p => p.name === productName || String(p.id) === String(productName));

  if (!prod) {
    prod = {
      id: 'prod_' + Date.now(),
      name: productName,
      price: price || 60,
      image: 'assets/cat_pc.webp',
      category: 'pc',
      categoryName: 'PC'
    };
  }

  window.currentBuyProduct = prod;

  // Build variants list
  let variants = [];
  if (Array.isArray(prod.variants) && prod.variants.length > 0) {
    variants = prod.variants;
  } else {
    const baseP = prod.price || 60;
    variants = [
      { name: '1 DAY', price: baseP, subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด' },
      { name: '7 DAY', price: Math.round(baseP * 2.5), subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด' },
      { name: '15 DAY', price: Math.round(baseP * 4.15), subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด' },
      { name: '30 DAY', price: Math.round(baseP * 6.66), subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด' }
    ];
  }

  window.currentBuyProduct.activeVariants = variants;
  window.currentBuyVariant = variants[0];
  window.currentBuyQty = 1;

  // Helper to resolve variant or product reseller price
  function getEffectiveResellerPrice(prodObj, varObj) {
    if (!prodObj) return 0;
    const isReseller = currentUser && (currentUser.isReseller || currentUser.role === 'reseller');
    if (!isReseller) return varObj ? (varObj.price || 0) : (prodObj.price || 0);
    const resellerMap = window.RESELLER_PRICING_MAP || {};
    if (varObj && varObj.name) {
      const varKey = `${prodObj.id}__${varObj.name}`;
      if (resellerMap[varKey] !== undefined) return Number(resellerMap[varKey]);
    }
    if (resellerMap[prodObj.id] !== undefined) return Number(resellerMap[prodObj.id]);
    const disc = currentUser.resellerDiscount || 15;
    const original = varObj ? (varObj.price || 0) : (prodObj.price || 0);
    return Math.max(0, Math.round(original * (1 - (disc / 100))));
  }
  window.getEffectiveResellerPrice = getEffectiveResellerPrice;

  const isResellerUser = currentUser && (currentUser.isReseller || currentUser.role === 'reseller');
  if (isResellerUser) {
    const firstVar = variants[0];
    const effectiveP = getEffectiveResellerPrice(prod, firstVar);
    if (firstVar && firstVar.price > 0) {
      window.currentBuyDiscountPercent = Math.max(0, Math.round(((firstVar.price - effectiveP) / firstVar.price) * 100));
    } else {
      window.currentBuyDiscountPercent = currentUser.resellerDiscount || 15;
    }
    window.currentBuyDiscountCode = 'RESELLER-PRICE';
  } else {
    window.currentBuyDiscountPercent = 0;
    window.currentBuyDiscountCode = '';
  }

  // Setup UI elements
  const imgEl = document.getElementById('pbuyImage');
  const titleEl = document.getElementById('buyProductTitle');
  const catBadgeEl = document.getElementById('pbuyCategoryBadge');
  const countEl = document.getElementById('pbuyVariantsCount');
  const qtyInput = document.getElementById('pbuyQtyInput');
  const couponInput = document.getElementById('pbuyCouponInput');
  const couponNotice = document.getElementById('pbuyCouponNotice');
  const successBox = document.getElementById('buySuccessSection');
  const confirmBtn = document.getElementById('btnConfirmBuy');
  const topupBtn = document.getElementById('btnGoToTopup');
  const cancelBtn = document.getElementById('btnCancelBuy');
  const origPriceEl = document.getElementById('pbuyOrigPriceDisplay');

  if (imgEl) imgEl.src = prod.image || `assets/cat_${prod.category || 'pc'}.webp`;
  if (titleEl) titleEl.textContent = prod.name;
  if (catBadgeEl) catBadgeEl.textContent = prod.categoryName || (prod.category || 'PC').toUpperCase();
  if (countEl) countEl.textContent = variants.length;
  if (qtyInput) qtyInput.value = 1;
  if (couponInput) couponInput.value = isResellerUser ? 'VIP-RESELLER' : '';
  
  if (couponNotice) {
    if (isResellerUser) {
      couponNotice.style.display = 'flex';
      couponNotice.innerHTML = `<i class="fa-solid fa-handshake" style="color: #10b981;"></i> <span>สิทธิ์ตัวแทนจำหน่าย VIP: รับราคาสมาชิกตัวแทนอัตโนมัติ (ลด ${window.currentBuyDiscountPercent}%)</span>`;
    } else {
      couponNotice.style.display = 'none';
    }
  }
  if (successBox) successBox.style.display = 'none';

  if (origPriceEl) {
    if (prod.originalPrice) {
      origPriceEl.style.display = 'block';
      origPriceEl.textContent = `฿${prod.originalPrice}`;
    } else {
      origPriceEl.style.display = 'none';
    }
  }

  if (confirmBtn) {
    confirmBtn.style.display = 'flex';
    confirmBtn.disabled = false;
  }
  if (topupBtn) topupBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.textContent = 'ยกเลิก';

  renderPbuyVariants();
  updatePbuySummary();

  const modal = document.getElementById('buyModalOverlay');
  if (modal) modal.style.display = 'flex';
}
window.handleBuyClick = handleBuyClick;

function renderPbuyVariants() {
  const container = document.getElementById('pbuyVariantsList');
  if (!container || !window.currentBuyProduct) return;
  const variants = window.currentBuyProduct.activeVariants || [];
  const prod = window.currentBuyProduct;
  const isResellerUser = currentUser && (currentUser.isReseller || currentUser.role === 'reseller');

  container.innerHTML = variants.map((v, idx) => {
    const isSelected = window.currentBuyVariant && window.currentBuyVariant.name === v.name;
    let priceDisplay = formatBaht(v.price);

    if (isResellerUser) {
      const resellerP = window.getEffectiveResellerPrice ? window.getEffectiveResellerPrice(prod, v) : v.price;
      priceDisplay = `<span style="color: #10b981; font-weight: 800;">${formatBaht(resellerP)}</span>`;
    }

    return `
      <div class="pbuy-variant-item ${isSelected ? 'active' : ''}" onclick="selectPbuyVariant(${idx})">
        <div class="pbuy-var-info-left">
          <div class="pbuy-var-title-row">
            <span>${v.name}</span>
            ${isSelected ? '<i class="fa-solid fa-circle-check pbuy-var-check-icon"></i>' : ''}
          </div>
          <div class="pbuy-var-subtitle">${v.subtitle || 'สินค้าดิจิทัล · สต็อกไม่จำกัด'}</div>
        </div>
        <div class="pbuy-var-price-tag">${priceDisplay}</div>
      </div>
    `;
  }).join('');
}
window.renderPbuyVariants = renderPbuyVariants;

function selectPbuyVariant(idx) {
  if (!window.currentBuyProduct || !window.currentBuyProduct.activeVariants) return;
  window.currentBuyVariant = window.currentBuyProduct.activeVariants[idx];
  const prod = window.currentBuyProduct;
  const v = window.currentBuyVariant;

  const isResellerUser = currentUser && (currentUser.isReseller || currentUser.role === 'reseller');
  if (isResellerUser) {
    const effectiveP = window.getEffectiveResellerPrice ? window.getEffectiveResellerPrice(prod, v) : (v ? v.price : 0);
    if (v && v.price > 0) {
      window.currentBuyDiscountPercent = Math.max(0, Math.round(((v.price - effectiveP) / v.price) * 100));
    } else {
      window.currentBuyDiscountPercent = currentUser.resellerDiscount || 15;
    }
    window.currentBuyDiscountCode = 'RESELLER-PRICE';
    const couponNotice = document.getElementById('pbuyCouponNotice');
    if (couponNotice) {
      couponNotice.innerHTML = `<i class="fa-solid fa-handshake" style="color: #10b981;"></i> <span>สิทธิ์ตัวแทนจำหน่าย VIP: รับราคาสมาชิกตัวแทน <strong>${formatBaht(effectiveP)}</strong> (ลด ${window.currentBuyDiscountPercent}%)</span>`;
    }
  }

  renderPbuyVariants();
  updatePbuySummary();
}
window.selectPbuyVariant = selectPbuyVariant;

function changePbuyQuantity(delta) {
  let qty = (window.currentBuyQty || 1) + delta;
  if (qty < 1) qty = 1;
  if (qty > 99) qty = 99;
  window.currentBuyQty = qty;
  const input = document.getElementById('pbuyQtyInput');
  if (input) input.value = qty;
  updatePbuySummary();
}
window.changePbuyQuantity = changePbuyQuantity;

function handlePbuyQtyChange(val) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 1) num = 1;
  if (num > 99) num = 99;
  window.currentBuyQty = num;
  updatePbuySummary();
}
window.handlePbuyQtyChange = handlePbuyQtyChange;

function applyPbuyDiscountCode() {
  const code = document.getElementById('pbuyCouponInput')?.value.trim().toUpperCase();
  const notice = document.getElementById('pbuyCouponNotice');
  if (!notice) return;

  if (!code) {
    showToast('กรุณากรอกโค้ดส่วนลด', 'error');
    return;
  }

  const validDiscounts = {
    'DEKTHEP10': 10,
    'DEKTHEP20': 20,
    'DEKTHEP50': 50,
    'VIP30': 30,
    'WELCOME': 15,
    'DISCOUNT10': 10
  };

  if (validDiscounts[code]) {
    window.currentBuyDiscountPercent = validDiscounts[code];
    window.currentBuyDiscountCode = code;
    notice.style.display = 'block';
    notice.style.color = '#34d399';
    notice.innerHTML = `<i class="fa-solid fa-circle-check"></i> ใช้โค้ด "${code}" สำเร็จ! ลดราคา ${validDiscounts[code]}%`;
    showToast(`ใช้โค้ดส่วนลด ${validDiscounts[code]}% สำเร็จ!`, 'success');
  } else {
    window.currentBuyDiscountPercent = 0;
    window.currentBuyDiscountCode = '';
    notice.style.display = 'block';
    notice.style.color = '#f87171';
    notice.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ไม่พบโค้ด "${code}" หรือโค้ดหมดอายุ`;
    showToast('โค้ดส่วนลดไม่ถูกต้อง', 'error');
  }
  updatePbuySummary();
}
window.applyPbuyDiscountCode = applyPbuyDiscountCode;

function updatePbuySummary() {
  if (!window.currentBuyVariant || !window.currentBuyProduct) return;
  const prod = window.currentBuyProduct;
  const v = window.currentBuyVariant;
  const qty = window.currentBuyQty || 1;
  const isResellerUser = currentUser && (currentUser.isReseller || currentUser.role === 'reseller');

  let finalPrice = 0;
  if (isResellerUser) {
    const unitP = window.getEffectiveResellerPrice ? window.getEffectiveResellerPrice(prod, v) : (v ? v.price : 0);
    finalPrice = Math.max(0, unitP * qty);
  } else {
    const basePrice = v.price || 0;
    const subtotal = basePrice * qty;
    const discount = (subtotal * (window.currentBuyDiscountPercent || 0)) / 100;
    finalPrice = Math.max(0, subtotal - discount);
  }

  const priceEl = document.getElementById('buyPriceDisplay');
  const userBalEl = document.getElementById('buyUserBalDisplay');
  const remainEl = document.getElementById('buyRemainDisplay');
  const warningEl = document.getElementById('buyErrorWarning');
  const confirmBtn = document.getElementById('btnConfirmBuy');
  const topupBtn = document.getElementById('btnGoToTopup');

  if (priceEl) priceEl.textContent = formatBaht(finalPrice);
  
  const userBal = currentUser ? (currentUser.balance || 0) : 0;
  if (userBalEl) userBalEl.textContent = formatBaht(userBal);

  const remaining = userBal - finalPrice;
  if (remainEl) remainEl.textContent = formatBaht(Math.max(0, remaining));

  if (remaining < 0) {
    if (warningEl) warningEl.style.display = 'flex';
    if (confirmBtn) confirmBtn.style.display = 'none';
    if (topupBtn) topupBtn.style.display = 'flex';
  } else {
    if (warningEl) warningEl.style.display = 'none';
    if (confirmBtn) confirmBtn.style.display = 'flex';
    if (topupBtn) topupBtn.style.display = 'none';
  }
}
window.updatePbuySummary = updatePbuySummary;

async function executeProductPurchase() {
  if (!window.currentBuyProduct || !window.currentBuyVariant) return;

  const confirmBtn = document.getElementById('btnConfirmBuy');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังประมวลผลคำสั่งซื้อ...</span>`;
  }

  const payload = {
    productId: window.currentBuyProduct.id,
    productName: window.currentBuyProduct.name,
    variantName: window.currentBuyVariant.name,
    price: window.currentBuyVariant.price,
    quantity: window.currentBuyQty || 1,
    discountCode: window.currentBuyDiscountCode || undefined
  };

  try {
    const res = await fetch('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || 'สั่งซื้อสินค้าสำเร็จ!', 'success');
      updateUserState(data.user);

      // Render license keys
      const successBox = document.getElementById('buySuccessSection');
      const keyEl = document.getElementById('buyResultKey');
      const cancelBtn = document.getElementById('btnCancelBuy');

      if (keyEl) keyEl.textContent = data.order.licenseKey;
      if (successBox) successBox.style.display = 'block';
      if (confirmBtn) confirmBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.textContent = 'เสร็จสิ้น';
    } else {
      showToast(data.error || 'การสั่งซื้อไม่สำเร็จ', 'error');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> <span>สั่งซื้อสินค้า</span>`;
      }
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อระบบสั่งซื้อ', 'error');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> <span>สั่งซื้อสินค้า</span>`;
    }
  }
}
window.executeProductPurchase = executeProductPurchase;

function copyPbuyResultKey() {
  const keyEl = document.getElementById('buyResultKey');
  if (!keyEl) return;
  navigator.clipboard.writeText(keyEl.textContent).then(() => {
    showToast('คัดลอก License Key แล้ว!', 'success');
  });
}
window.copyPbuyResultKey = copyPbuyResultKey;

function closeBuyModal() {
  const modal = document.getElementById('buyModalOverlay');
  if (modal) modal.style.display = 'none';
}
window.closeBuyModal = closeBuyModal;

// Overlay click to close buy modal
document.getElementById('buyModalOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'buyModalOverlay') closeBuyModal();
});

// History Modal Handlers (ประวัติรายการ)
async function openHistoryModal() {
  const overlay = document.getElementById('historyModalOverlay');
  if (!overlay) return;

  if (!currentUser) {
    showToast('กรุณาเข้าสู่ระบบก่อนดูประวัติ', 'info');
    openAuthModal('login');
    return;
  }

  overlay.style.display = 'flex';
  if (userDropdownMenu) userDropdownMenu.classList.remove('show');

  const ordersListEl = document.getElementById('histOrdersList');
  const txListEl = document.getElementById('histTxList');
  if (ordersListEl) ordersListEl.innerHTML = `<div class="empty-hist"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดประวัติ...</div>`;
  if (txListEl) txListEl.innerHTML = `<div class="empty-hist"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดประวัติ...</div>`;

  try {
    const res = await fetch('/api/history');
    const data = await res.json();

    if (res.ok && data.success) {
      renderOrdersHistory(data.orders);
      renderTransactionsHistory(data.transactions);
    } else {
      renderOrdersHistory([]);
      renderTransactionsHistory([]);
      if (data && data.error && !data.error.includes('เข้าสู่ระบบ')) {
        showToast(data.error, 'error');
      }
    }
  } catch (err) {
    renderOrdersHistory([]);
    renderTransactionsHistory([]);
    showToast('เกิดข้อผิดพลาดในการโหลดประวัติ', 'error');
  }
}
window.openHistoryModal = openHistoryModal;
window.openHistoryNotice = openHistoryModal;

function closeHistoryModal() {
  const overlay = document.getElementById('historyModalOverlay');
  if (overlay) overlay.style.display = 'none';
}
window.closeHistoryModal = closeHistoryModal;

if (closeHistoryModalBtn) {
  closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
}
if (historyModalOverlay) {
  historyModalOverlay.addEventListener('click', (e) => {
    if (e.target === historyModalOverlay) closeHistoryModal();
  });
}

// History Tabs Switch
document.querySelectorAll('.hist-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.hist-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.hist-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tab = btn.getAttribute('data-tab');
    document.getElementById(`hist-${tab}-panel`).classList.add('active');
  });
});

function renderOrdersHistory(orders) {
  if (!orders || orders.length === 0) {
    histOrdersList.innerHTML = `<div class="empty-hist"><i class="fa-solid fa-box-open" style="font-size:2rem;margin-bottom:8px;opacity:0.3"></i><p>ยังไม่มีประวัติการสั่งซื้อสินค้า</p></div>`;
    return;
  }

  histOrdersList.innerHTML = orders.map(ord => `
    <div class="hist-card-item">
      <div class="hist-card-top">
        <span class="hist-prod-name"><i class="fa-solid fa-bag-shopping text-brand"></i> ${ord.productName}</span>
        <span class="hist-price">${formatBaht(ord.price)}</span>
      </div>
      <div class="hist-date">${new Date(ord.createdAt).toLocaleString('th-TH')} · สำเร็จ</div>
      <div class="code-copy">
        <code>${ord.licenseKey}</code>
        <button type="button" onclick="navigator.clipboard.writeText('${ord.licenseKey}'); showToast('คัดลอก License Key แล้ว', 'success')">คัดลอก Key</button>
      </div>
    </div>
  `).join('');
}

function renderTransactionsHistory(txs) {
  if (!txs || txs.length === 0) {
    histTxList.innerHTML = `<div class="empty-hist"><i class="fa-solid fa-receipt" style="font-size:2rem;margin-bottom:8px;opacity:0.3"></i><p>ยังไม่มีประวัติการเติมเงิน</p></div>`;
    return;
  }

  histTxList.innerHTML = txs.map(tx => `
    <div class="hist-card-item">
      <div class="hist-card-top">
        <span class="hist-prod-name">
          ${tx.type === 'truemoney_card' ? '<i class="fa-solid fa-credit-card text-brand"></i> บัตร TrueMoney' :
            tx.type === 'truemoney_voucher' ? '<i class="fa-solid fa-gift text-brand"></i> ซองของขวัญ' : '<i class="fa-solid fa-building-columns text-brand"></i> โอนธนาคาร'}
        </span>
        <span class="hist-price font-bold" style="color:#10b981;">+${formatBaht(tx.amount)}</span>
      </div>
      <div class="hist-date">${new Date(tx.createdAt).toLocaleString('th-TH')} · <span style="color:#10b981">✓ เติมเงินสำเร็จ</span></div>
      <p style="font-size:0.75rem;color:var(--text-muted);">${tx.details || ''}</p>
        ${tx.slipImage ? `
          <div style="margin-top:6px;">
            <a href="${tx.slipImage}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;font-size:0.78rem;font-weight:600;color:#38bdf8;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);border-radius:6px;padding:3px 10px;text-decoration:none;">
              <i class="fa-solid fa-file-image"></i> <span>ดูสลิปที่แนบ</span>
            </a>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

// Global helper bindings for onclick attributes
window.openTopupNotice = openTopupModal;
window.openHistoryNotice = openHistoryModal;
window.openProfileModal = openProfileModal;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleBuyClick = handleBuyClick;

// Tab Switcher in Login/Register Modal
function switchTab(tab) {
  clearAuthAlert('login');
  clearAuthAlert('reg');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    tabIndicator.style.transform = 'translateX(0%)';

    loginForm.classList.add('active');
    registerForm.classList.remove('active');

    subBadge.textContent = 'เข้าสู่ระบบ';
    mainTitle.textContent = 'ยินดีต้อนรับกลับมา';
    subTitle.textContent = 'ลงชื่อเข้าใช้ DEKTHEP STORE';

    discordBtnText.textContent = 'เข้าสู่ระบบด้วย Discord';
    googleBtnText.textContent = 'เข้าสู่ระบบด้วย Google';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    tabIndicator.style.transform = 'translateX(100%)';

    registerForm.classList.add('active');
    loginForm.classList.remove('active');

    subBadge.textContent = 'สมัครสมาชิก';
    mainTitle.textContent = 'สร้างบัญชีใหม่';
    subTitle.textContent = 'เข้าร่วมกับ DEKTHEP STORE เพื่อรับสิทธิ์พิเศษ';

    discordBtnText.textContent = 'สมัครสมาชิกด้วย Discord';
    googleBtnText.textContent = 'สมัครสมาชิกด้วย Google';
  }
}
window.switchTab = switchTab;

tabLogin.addEventListener('click', () => switchTab('login'));
tabRegister.addEventListener('click', () => switchTab('register'));

// Password visibility toggles
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = `<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
      input.type = 'password';
      btn.innerHTML = `<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
  });
});

// Guide Modal handlers
helpGuideBtn.addEventListener('click', () => { guideModal.style.display = 'flex'; });
closeGuideBtn.addEventListener('click', () => { guideModal.style.display = 'none'; });
guideOkBtn.addEventListener('click', () => { guideModal.style.display = 'none'; });
guideModal.addEventListener('click', (e) => { if (e.target === guideModal) guideModal.style.display = 'none'; });

// Helper to apply avatar frame (Discord Nitro Frames)
if (typeof window.applyAvatarFrame !== 'function') {
  window.applyAvatarFrame = function(element, frame) {
    console.log('applyAvatarFrame fallback:', frame);
  };
}

// Update Navbar and User State
function updateUserState(user) {
  currentUser = user;

  const dropAdminLink = document.getElementById('dropAdminLink');

  if (user) {
    guestNavBtns.style.display = 'none';
    userNavProfile.style.display = 'flex';

    const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || user.id}`;
    navUserAvatar.src = avatarUrl;
    applyAvatarFrame(navUserAvatar, user.frame);
    navUserName.textContent = user.displayName || user.username;
    userBalanceText.textContent = formatBaht(user.balance);

    document.getElementById('dropUserName').textContent = user.displayName || user.username;
    document.getElementById('dropUserEmail').textContent = user.email || 'ไม่ได้ระบุอีเมล';
    document.getElementById('dropProviderBadge').textContent = 
      user.role === 'admin' ? '🛡️ ผู้ดูแลระบบ (Admin)' :
      (user.role === 'reseller' || user.isReseller) ? '🤝 ตัวแทนจำหน่าย (VIP Reseller)' :
      user.provider === 'discord' ? 'Discord Connect' : 
      user.provider === 'google' ? 'Google Connect' : 'สมาชิกทั่วไป';

    const isAdmin = (user.role === 'admin');
    if (dropAdminLink) dropAdminLink.style.display = isAdmin ? 'flex' : 'none';
  } else {
    guestNavBtns.style.display = 'flex';
    userNavProfile.style.display = 'none';
    if (dropAdminLink) dropAdminLink.style.display = 'none';
  }
  updateTopupPageBalance();
}
window.updateUserState = updateUserState;
window.updateUserUI = updateUserState;

// Global state for Initial Avatar Generator
window.selectedInitialColor = 'blue';

function selectInitialColor(colorKey) {
  window.selectedInitialColor = colorKey || 'blue';
  document.querySelectorAll('.initial-color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-color') === colorKey);
  });
  const input = document.getElementById('customInitialLetterInput');
  const letter = (input ? input.value : '') || (currentUser?.username?.charAt(0) || 'D');
  updateInitialAvatarPreview(letter);
}
window.selectInitialColor = selectInitialColor;

function updateInitialAvatarPreview(letter) {
  const display = document.getElementById('initialAvatarLetterDisplay');
  const box = document.getElementById('initialAvatarPreviewBox');
  if (!display || !box) return;

  const char = (letter || (currentUser?.username?.charAt(0) || 'D')).trim().slice(0, 2).toUpperCase();
  display.textContent = char;

  const gradients = {
    blue: 'linear-gradient(135deg, #0055ff, #00c6ff)',
    purple: 'linear-gradient(135deg, #5865F2, #8b5cf6)',
    red: 'linear-gradient(135deg, #ff3300, #ff7700)',
    green: 'linear-gradient(135deg, #10b981, #059669)',
    gold: 'linear-gradient(135deg, #facc15, #f59e0b)',
    dark: 'linear-gradient(135deg, #1e293b, #0f172a)'
  };
  box.style.background = gradients[window.selectedInitialColor] || gradients.blue;
}
window.updateInitialAvatarPreview = updateInitialAvatarPreview;

function generateInitialAvatarSvg(letter, colorTheme) {
  const char = (letter || 'D').trim().slice(0, 2).toUpperCase();
  const gradients = {
    blue: ['#0055ff', '#00c6ff'],
    purple: ['#5865F2', '#8b5cf6'],
    red: ['#ff3300', '#ff7700'],
    green: ['#10b981', '#059669'],
    gold: ['#facc15', '#f59e0b'],
    dark: ['#1e293b', '#0f172a']
  };
  const colors = gradients[colorTheme] || gradients.blue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="initGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors[0]}"/>
        <stop offset="100%" stop-color="${colors[1]}"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="100" fill="url(#initGrad)"/>
    <text x="50%" y="54%" font-family="system-ui, -apple-system, Prompt, sans-serif" font-size="96" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${char}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
window.generateInitialAvatarSvg = generateInitialAvatarSvg;

function applyInitialAvatarToProfile() {
  const input = document.getElementById('customInitialLetterInput');
  let letter = input ? input.value.trim() : '';
  if (!letter && currentUser) {
    letter = (currentUser.displayName || currentUser.username || 'D').charAt(0);
  }
  if (!letter) letter = 'D';

  const svgDataUri = generateInitialAvatarSvg(letter, window.selectedInitialColor);
  const urlInput = document.getElementById('profileAvatarUrlInput');
  if (urlInput) urlInput.value = svgDataUri;
  previewProfileAvatar(svgDataUri);
  showToast(`นำตัวอักษร "${letter.toUpperCase()}" มาตั้งเป็นรูปโปรไฟล์แล้ว (กดบันทึกเพื่อยืนยัน)`, 'success');
}
window.applyInitialAvatarToProfile = applyInitialAvatarToProfile;

// Reseller Code Redemption in User Profile Modal
async function redeemResellerCode() {
  const input = document.getElementById('resellerCodeInput');
  const code = (input ? input.value : '').trim().toUpperCase();
  if (!code) {
    showToast('กรุณากรอกโค้ดตัวแทนจำหน่าย', 'error');
    return;
  }

  const btn = document.getElementById('btnRedeemReseller');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบโค้ด...</span>`;
  }

  try {
    const res = await fetch('/api/reseller/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || '🎉 ยินดีด้วย! บัญชีของคุณได้รับการอัปเกรดเป็นตัวแทนจำหน่ายเรียบร้อยแล้ว', 'success');
      updateUserState(data.user);
      renderProfileDetails(data.user);
      if (input) input.value = '';
      if (typeof fetchResellerPricing === 'function') fetchResellerPricing();
      if (typeof renderProductsGrid === 'function') renderProductsGrid();
    } else {
      showToast(data.error || 'โค้ดตัวแทนจำหน่ายไม่ถูกต้องหรือหมดอายุ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-key"></i> <span>ใช้งานโค้ด</span>`;
    }
  }
}
window.redeemResellerCode = redeemResellerCode;

// Render profile details inside modal (with initial avatar generator & Discord frames)
function renderProfileDetails(user) {
  if (!user) return;
  document.getElementById('userDisplayName').textContent = user.displayName || user.username;
  document.getElementById('profileUsername').textContent = user.username || '-';
  document.getElementById('profileEmail').textContent = user.email || 'ไม่ได้ระบุอีเมล';
  document.getElementById('profileUserId').textContent = user.id;
  const putAccount = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  putAccount('accountHeroEmail', user.email || 'ไม่ได้ระบุอีเมล');
  const prettyDate = v => { if(!v) return '-'; const d=new Date(v); return Number.isNaN(d.getTime())?'-':d.toLocaleString('th-TH',{dateStyle:'long',timeStyle:'short'}); };
  putAccount('accountJoined',prettyDate(user.createdAt));
  putAccount('accountLastLogin',prettyDate(user.lastLoginAt || user.lastLogin));
  putAccount('accountOrderCount',user.orderCount ?? user.totalOrders ?? '—');
  putAccount('accountTotalSpent',user.totalSpent == null?'—':formatBaht(user.totalSpent));
  putAccount('accountDiscordStatus',user.discordId?'เชื่อมต่อแล้ว':'ยังไม่ได้เชื่อมต่อ');

  const balEl = document.getElementById('profileBalanceDisplay');
  if (balEl) balEl.textContent = formatBaht(user.balance || 0);

  const initialChar = (user.displayName || user.username || 'D').trim().charAt(0).toUpperCase();
  const avatarUrl = user.avatar || generateInitialAvatarSvg(initialChar, 'blue');
  const avatarEl = document.getElementById('userAvatar');
  avatarEl.src = avatarUrl;

  const ringEl = document.getElementById('userAvatarRing');
  const userFrame = window.normalizeDiscordFrameKey ? window.normalizeDiscordFrameKey(user.frame) : (user.frame || 'none');
  window.currentProfileFrame = userFrame;
  if (window.applyAvatarFrame) applyAvatarFrame(ringEl, userFrame);
  if (window.renderDiscordNitroFramesGrid) renderDiscordNitroFramesGrid('all');
  const badge = document.getElementById('nitroSelectedNameBadge');
  if (badge && window.DISCORD_NITRO_FRAMES && window.DISCORD_NITRO_FRAMES[userFrame]) {
    badge.textContent = window.DISCORD_NITRO_FRAMES[userFrame].name;
  }

  // Update URL input and select active frame card
  const urlInput = document.getElementById('profileAvatarUrlInput');
  if (urlInput) urlInput.value = user.avatar || '';

  // Setup Reseller section in Profile
  const isReseller = (user.role === 'reseller' || user.isReseller === true);
  const redeemForm = document.getElementById('resellerRedeemForm');
  const activeBadge = document.getElementById('resellerActiveBadge');
  const discountDisplay = document.getElementById('resellerDiscountDisplay');
  const statusSubText = document.getElementById('resellerStatusSubText');

  if (isReseller) {
    if (redeemForm) redeemForm.style.display = 'none';
    if (activeBadge) activeBadge.style.display = 'block';
    if (discountDisplay) discountDisplay.textContent = `${user.resellerDiscount || 15}%`;
    if (statusSubText) statusSubText.textContent = `บัญชีของคุณเป็นตัวแทนจำหน่ายระดับ VIP (ส่วนลด ${user.resellerDiscount || 15}% ทุกชิ้น)`;
  } else {
    if (redeemForm) redeemForm.style.display = 'flex';
    if (activeBadge) activeBadge.style.display = 'none';
    if (statusSubText) statusSubText.textContent = 'กรอกโค้ดเพื่อรับสิทธิ์ราคาส่ง/ส่วนลดพิเศษตัวแทนจำหน่าย';
  }

  const providerTagEl = document.getElementById('providerTag');
  const providerBadgeEl = document.getElementById('providerBadge');

  if (user.provider === 'discord') {
    providerTagEl.textContent = 'เชื่อมต่อผ่าน Discord';
    providerTagEl.style.borderColor = '#5865F2';
    providerTagEl.style.color = '#5865F2';
    providerBadgeEl.innerHTML = `<i class="fa-brands fa-discord" style="color: #5865F2;"></i>`;
  } else if (user.provider === 'google') {
    providerTagEl.textContent = 'เชื่อมต่อผ่าน Google';
    providerTagEl.style.borderColor = '#ea4335';
    providerTagEl.style.color = '#ea4335';
    providerBadgeEl.innerHTML = `<i class="fa-brands fa-google" style="color: #ea4335;"></i>`;
  } else {
    providerTagEl.textContent = user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : isReseller ? 'ตัวแทนจำหน่าย (VIP Reseller)' : 'สมาชิก DekThep (ทั่วไป)';
    providerTagEl.style.borderColor = user.role === 'admin' ? '#ef4444' : isReseller ? '#f59e0b' : '#3b82f6';
    providerTagEl.style.color = user.role === 'admin' ? '#ef4444' : isReseller ? '#f59e0b' : '#3b82f6';
    providerBadgeEl.innerHTML = user.role === 'admin' ? `<i class="fa-solid fa-shield-halved" style="color: #ef4444;"></i>` : isReseller ? `<i class="fa-solid fa-handshake" style="color: #f59e0b;"></i>` : `<i class="fa-solid fa-user" style="color: #3b82f6;"></i>`;
  }
}

// Profile Customizer & Frame Picker Handlers
if (typeof window.selectProfileFrame !== 'function') {
  window.selectProfileFrame = function(frameKey) {
    window.currentProfileFrame = frameKey;
    const ringEl = document.getElementById('userAvatarRing');
    if (window.applyAvatarFrame) applyAvatarFrame(ringEl, frameKey);
  };
}

function previewProfileAvatar(url) {
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl && url) {
    avatarEl.src = url;
  }
}
window.previewProfileAvatar = previewProfileAvatar;

function handleUserAvatarUpload(fileInput) {
  if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.src = base64Data;
    const input = document.getElementById('profileAvatarUrlInput');
    if (input) input.value = base64Data;
    showToast('โหลดรูปโปรไฟล์ตัวอย่างเรียบร้อย กดบันทึกเพื่อใช้งาน', 'info');
  };
  reader.readAsDataURL(file);
}
window.handleUserAvatarUpload = handleUserAvatarUpload;

async function saveUserProfileCustomization() {
  if (!currentUser) return;
  const urlInput = document.getElementById('profileAvatarUrlInput');
  const avatar = urlInput ? urlInput.value.trim() : '';
  const frame = window.currentProfileFrame || 'none';

  const btn = document.getElementById('btnSaveCustomProfile');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังบันทึกข้อมูล...</span>`;
  }

  try {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ avatar, frame })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('อัปเดตโปรไฟล์และกรอบรูปเรียบร้อยแล้ว!', 'success');
      updateUserState(data.user);
    } else {
      showToast(data.error || 'บันทึกโปรไฟล์ไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>บันทึกการเปลี่ยนแปลงโปรไฟล์</span>`;
    }
  }
}
window.saveUserProfileCustomization = saveUserProfileCustomization;


// Check auth status from backend
async function checkAuthStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    oauthConfig = data.oauth;

    if (data.authenticated && data.user) {
      updateUserState(data.user);
    } else {
      updateUserState(null);
    }

    handleUrlQueryParams();

    // Check initial route / hash
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      switchPageView('admin');
    } else if (window.location.hash === '#topup' || window.location.pathname === '/topup') {
      switchPageView('topup');
    } else if (window.location.hash === '#store' || window.location.pathname === '/store') {
      switchPageView('store');
    } else {
      switchPageView('home');
    }
  } catch (err) {
    console.error('Failed to fetch auth status:', err);
  }
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#admin') {
    switchPageView('admin');
  } else if (window.location.hash === '#topup') {
    switchPageView('topup');
  } else if (window.location.hash === '#store') {
    switchPageView('store');
  } else {
    switchPageView('home');
  }
});

// Handle URL Query Params
function handleUrlQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('oauth_success')) {
    const provider = urlParams.get('oauth_success');
    showToast(`เข้าสู่ระบบด้วย ${provider.toUpperCase()} ของจริงสำเร็จแล้ว! ยินดีต้อนรับ`, 'success');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (urlParams.get('oauth_error')) {
    const errorType = urlParams.get('oauth_error');
    const desc = urlParams.get('desc') || '';

    if (errorType === 'discord_not_configured') {
      showToast('ยังไม่ได้ระบุ DISCORD_CLIENT_ID ในไฟล์ .env', 'info', {
        text: 'ดูวิธีตั้งค่า',
        onClick: () => { guideModal.style.display = 'flex'; }
      });
    } else if (errorType === 'google_not_configured') {
      showToast('ยังไม่ได้ระบุ GOOGLE_CLIENT_ID ในไฟล์ .env', 'info', {
        text: 'ดูวิธีตั้งค่า',
        onClick: () => { guideModal.style.display = 'flex'; }
      });
    } else {
      showToast(`การเชื่อมต่อไม่สำเร็จ: ${errorType} ${desc}`, 'error');
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Dropdown Trigger
if (userDropdownTrigger) {
  userDropdownTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    if (userDropdownMenu) userDropdownMenu.classList.remove('show');
  });
}

// Nav and Hero Buttons
navLoginBtn.addEventListener('click', () => openAuthModal('login'));
navRegisterBtn.addEventListener('click', () => openAuthModal('register'));

heroStartBtn.addEventListener('click', () => {
  if (currentUser) {
    document.getElementById('store').scrollIntoView({ behavior: 'smooth' });
  } else {
    openAuthModal('login');
  }
});

// ==========================================
// AUTH ALERTS & SUBMISSION LOGIC
// ==========================================

function showAuthAlert(formType, message, type = 'error') {
  const box = document.getElementById(formType === 'login' ? 'loginAlertBox' : 'regAlertBox');
  if (!box) return;
  const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  box.className = `auth-alert-box ${type}`;
  box.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  box.style.display = 'flex';
}

function clearAuthAlert(formType) {
  const box = document.getElementById(formType === 'login' ? 'loginAlertBox' : 'regAlertBox');
  if (box) {
    box.style.display = 'none';
    box.innerHTML = '';
  }
}

// Clear alerts automatically when user types in inputs
['loginIdentifier', 'loginPassword'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => clearAuthAlert('login'));
});
['regUsername', 'regEmail', 'regPassword', 'regConfirmPassword'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => clearAuthAlert('reg'));
});

// Smart API URL helper (ensures API calls work on localhost:3000, 127.0.0.1, or live-server)
function getApiUrl(path) {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3000' + path;
  }
  if (window.location.port === '3000') {
    return path;
  }
  return 'http://localhost:3000' + path;
}

// Automatically redirect to http://localhost:3000 if opened directly via file://
if (window.location.protocol === 'file:') {
  console.log('Redirecting from file:// to http://localhost:3000...');
  window.location.href = 'http://localhost:3000';
}

// Login Form Submit Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthAlert('login');

  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!identifier) {
    showAuthAlert('login', 'กรุณากรอกชื่อผู้ใช้หรืออีเมล', 'error');
    showToast('กรุณากรอกชื่อผู้ใช้หรืออีเมล', 'error');
    return;
  }
  if (!password) {
    showAuthAlert('login', 'กรุณากรอกรหัสผ่าน', 'error');
    showToast('กรุณากรอกรหัสผ่าน', 'error');
    return;
  }

  const submitBtn = document.getElementById('loginSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...`;

  try {
    const res = await fetch(getApiUrl('/api/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password })
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      data = { error: 'การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง' };
    }

    if (res.ok && data.success) {
      showAuthAlert('login', 'เข้าสู่ระบบสำเร็จ! กำลังโหลดข้อมูล...', 'success');
      showToast(data.message || 'เข้าสู่ระบบสำเร็จแล้ว!', 'success');
      updateUserState(data.user);
      setTimeout(() => {
        closeAuthModal();
        loginForm.reset();
        clearAuthAlert('login');
        if (data.user && (data.user.role === 'admin' || data.user.username === 'samobile')) {
          switchPageView('admin');
        }
      }, 700);
    } else {
      const errMsg = (data && data.error) ? data.error : 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      showAuthAlert('login', errMsg, 'error');
      showToast(errMsg, 'error');
    }
  } catch (err) {
    console.error('Login submit error:', err);
    showAuthAlert('login', 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่ที่ http://localhost:3000', 'error');
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>เข้าสู่ระบบ</span><i class="fa-solid fa-arrow-right"></i>`;
  }
});

// Register Form Submit Handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthAlert('reg');

  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (!username || username.length < 3) {
    showAuthAlert('reg', 'กรุณากรอกชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร', 'error');
    showToast('กรุณากรอกชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร', 'error');
    return;
  }

  if (!password || password.length < 4) {
    showAuthAlert('reg', 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร', 'error');
    showToast('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAuthAlert('reg', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'error');
    showToast('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน', 'error');
    return;
  }

  const submitBtn = document.getElementById('regSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังสร้างบัญชี...`;

  try {
    const res = await fetch(getApiUrl('/api/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password, confirmPassword })
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      data = { error: 'การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง' };
    }

    if (res.ok && data.success) {
      showAuthAlert('reg', data.message || 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ DEKTHEP STORE', 'success');
      showToast(data.message || 'สมัครสมาชิกสำเร็จแล้ว!', 'success');
      updateUserState(data.user);
      setTimeout(() => {
        closeAuthModal();
        registerForm.reset();
        clearAuthAlert('reg');
      }, 900);
    } else {
      const errMsg = (data && data.error) ? data.error : 'สมัครสมาชิกไม่สำเร็จ';
      let alertHtml = errMsg;
      if (errMsg.includes('ถูกใช้งานแล้ว') || errMsg.includes('มีอยู่ในระบบแล้ว')) {
        alertHtml = `${errMsg} <button type="button" onclick="switchTab('login')" style="background:none;border:none;color:#60a5fa;text-decoration:underline;cursor:pointer;font-weight:bold;margin-left:6px;">คลิกที่นี่เพื่อเข้าสู่ระบบ</button>`;
      }
      showAuthAlert('reg', alertHtml, 'error');
      showToast(errMsg, 'error');
    }
  } catch (err) {
    console.error('Register submit error:', err);
    showAuthAlert('reg', 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่ที่ http://localhost:3000', 'error');
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>สร้างบัญชี DekThep</span><i class="fa-solid fa-arrow-right"></i>`;
  }
});

// Discord & Google OAuth Buttons
discordLoginBtn.addEventListener('click', () => {
  if (oauthConfig.discord && oauthConfig.discord.configured) {
    window.location.href = '/auth/discord';
  } else {
    showToast('ยังไม่ได้ระบุ DISCORD_CLIENT_ID ในไฟล์ .env', 'info', {
      text: 'ทดสอบโหมดจำลอง (Demo)',
      onClick: async () => {
        const res = await fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'discord' })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          updateUserState(data.user);
          closeAuthModal();
        }
      }
    });
    setTimeout(() => { guideModal.style.display = 'flex'; }, 400);
  }
});

googleLoginBtn.addEventListener('click', () => {
  if (oauthConfig.google && oauthConfig.google.configured) {
    window.location.href = '/auth/google';
  } else {
    showToast('ยังไม่ได้ระบุ GOOGLE_CLIENT_ID ในไฟล์ .env', 'info', {
      text: 'ทดสอบโหมดจำลอง (Demo)',
      onClick: async () => {
        const res = await fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'google' })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          updateUserState(data.user);
          closeAuthModal();
        }
      }
    });
    setTimeout(() => { guideModal.style.display = 'flex'; }, 400);
  }
});

// Logout Handler
async function performLogout() {
  try {
    const res = await fetch('/api/logout', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
      updateUserState(null);
      closeAuthModal();
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
  }
}

navLogoutBtn.addEventListener('click', performLogout);
modalLogoutBtn.addEventListener('click', performLogout);

// ==========================================
// STORE & CATEGORY CONTROLLER (dekthepstore.dekhere.pro style)
// ==========================================
let currentStoreCategory = 'all';
let storeSearchQuery = '';
let storeSortOrder = 'default';

function selectStoreCategory(catId, scroll = true) {
  if (catId === undefined || catId === null) catId = 'all';
  currentStoreCategory = catId;

  // Make sure we are on the store view
  switchPageView('store');

  // Update category tab button active state (support both data-category and data-cat)
  document.querySelectorAll('.store-filter-tab').forEach(tab => {
    const cat = tab.getAttribute('data-category') || tab.getAttribute('data-cat');
    if (cat === catId) {
      tab.classList.add('active');
      tab.classList.add('store-filter-tab--active');
    } else {
      tab.classList.remove('active');
      tab.classList.remove('store-filter-tab--active');
    }
  });

  // Update banner title & subtitle & back link & current heading
  const prods = window.STORE_PRODUCTS || (typeof STORE_PRODUCTS !== 'undefined' ? STORE_PRODUCTS : []);
  const countInCat = catId === 'all' ? prods.length : prods.filter(p => p.category === catId).length;
  const catObj = (typeof STORE_CATEGORIES !== 'undefined') ? STORE_CATEGORIES.find(c => c.id === catId) : null;
  const bannerTitle = document.getElementById('storeBannerTitle');
  const bannerSubtitle = document.getElementById('storeBannerSubtitle');
  const currentHeading = document.getElementById('storeCurrentHeading');
  const backLink = document.getElementById('storeBackLink');

  if (bannerTitle) bannerTitle.textContent = (catId === 'all') ? 'สินค้าทั้งหมด' : (catObj?.title || catObj?.name || catId.toUpperCase());
  if (bannerSubtitle) bannerSubtitle.textContent = (catId === 'all') ? `เลือกดูสินค้าตามหมวดหมู่ ${prods.length} รายการ` : `${countInCat} รายการ`;
  if (currentHeading) {
    currentHeading.textContent = (catId === 'all') ? 'สินค้าทั้งหมด' : `${catObj?.name || catId.toUpperCase()} (${countInCat} รายการ)`;
  }

  if (backLink) {
    backLink.style.display = (catId === 'all') ? 'none' : 'inline-flex';
  }

  // Render products
  renderProductsGrid();

  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
window.selectStoreCategory = selectStoreCategory;

function updateCategoryTabCounts(productsList) {
  const prods = Array.isArray(productsList) ? productsList : (window.STORE_PRODUCTS || (typeof STORE_PRODUCTS !== 'undefined' ? STORE_PRODUCTS : []));
  const counts = {
    all: prods.length,
    pc: prods.filter(p => p.category === 'pc').length,
    ios: prods.filter(p => p.category === 'ios').length,
    xreg: prods.filter(p => p.category === 'xreg').length,
    ad: prods.filter(p => p.category === 'ad').length
  };

  // Update store category tabs
  document.querySelectorAll('.store-filter-tab').forEach(tab => {
    const cat = tab.getAttribute('data-category') || tab.getAttribute('data-cat');
    if (cat === 'all') tab.textContent = `ทั้งหมด (${counts.all})`;
    else if (cat === 'pc') tab.textContent = `PC (${counts.pc})`;
    else if (cat === 'ios') tab.textContent = `IOS (${counts.ios})`;
    else if (cat === 'xreg') tab.textContent = `XREG AD & IOS (${counts.xreg})`;
    else if (cat === 'ad') tab.textContent = `AD (${counts.ad})`;
  });

  // Update STORE_CATEGORIES count property if defined
  if (typeof STORE_CATEGORIES !== 'undefined' && Array.isArray(STORE_CATEGORIES)) {
    STORE_CATEGORIES.forEach(c => {
      if (counts[c.id] !== undefined) c.count = counts[c.id];
    });
  }

  // Update subtitle
  const bannerSubtitle = document.getElementById('storeBannerSubtitle');
  if (bannerSubtitle && currentStoreCategory === 'all') {
    bannerSubtitle.textContent = `เลือกดูสินค้าตามหมวดหมู่ ${counts.all} รายการ`;
  }
}
window.updateCategoryTabCounts = updateCategoryTabCounts;

function filterStoreProducts(val) {
  if (val === undefined || typeof val !== 'string') {
    const input = document.getElementById('storeSearchInput');
    val = input ? input.value : '';
  }
  storeSearchQuery = (val || '').trim().toLowerCase();
  
  const clearBtn = document.getElementById('storeSearchClear') || document.getElementById('storeClearSearchBtn');
  if (clearBtn) {
    clearBtn.style.display = storeSearchQuery ? 'inline-flex' : 'none';
  }
  renderProductsGrid();
}
window.filterStoreProducts = filterStoreProducts;

function clearStoreSearch() {
  const input = document.getElementById('storeSearchInput');
  if (input) input.value = '';
  filterStoreProducts('');
}
window.clearStoreSearch = clearStoreSearch;

function handleSortProducts(order) {
  if (order === 'price-asc') order = 'price_asc';
  if (order === 'price-desc') order = 'price_desc';
  storeSortOrder = order || 'default';
  renderProductsGrid();
}
window.handleSortProducts = handleSortProducts;
window.applyProductSort = handleSortProducts;

function renderProductsGrid() {
  const grid = document.getElementById('storeProductsGrid');
  if (!grid) return;

  const prods = window.STORE_PRODUCTS || (typeof STORE_PRODUCTS !== 'undefined' ? STORE_PRODUCTS : []);
  if (!prods.length) {
    grid.innerHTML = `<div class="store-empty-notice" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;"><i class="fa-solid fa-box-open" style="font-size:2.5rem;opacity:0.35;"></i><p style="margin-top:10px;color:#94a3b8;">ไม่พบรายการสินค้าในระบบ</p></div>`;
    return;
  }

  // 1. Filter by category
  let list = prods.filter(p => {
    if (currentStoreCategory === 'all') return true;
    return p.category === currentStoreCategory;
  });

  // 2. Filter by search query
  if (storeSearchQuery) {
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      const cat = (p.categoryName || '').toLowerCase();
      return name.includes(storeSearchQuery) || desc.includes(storeSearchQuery) || cat.includes(storeSearchQuery);
    });
  }

  // 3. Sort
  if (storeSortOrder === 'price_asc') {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (storeSortOrder === 'price_desc') {
    list = [...list].sort((a, b) => b.price - a.price);
  } else if (storeSortOrder === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="store-empty-notice" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(14,24,56,0.5); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #64748b; margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 1.1rem; color: #f1f5f9; margin-bottom: 6px;">ไม่พบสินค้าที่ตรงกับการค้นหา</h4>
        <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">ลองพิมพ์ค้นหาด้วยคำอื่น หรือเลือกดูหมวดหมู่อื่น</p>
        <button class="btn btn-secondary btn-sm" onclick="clearStoreSearch(); selectStoreCategory('all', false);" style="margin: 0 auto; display: inline-flex;">ดูสินค้าทั้งหมด (${prods.length} รายการ)</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => {
    const isSoldOut = item.status === 'soldout' || item.stock === 0;
    const isMaintenance = item.status === 'maintenance';
    const statusDotClass = isSoldOut ? 'dek-status-dot--out' : isMaintenance ? 'dek-status-dot--maintenance' : 'dek-status-dot--instock';
    const statusText = isSoldOut ? 'สินค้าหมด' : isMaintenance ? 'ปิดปรับปรุง' : `พร้อมขาย - คลัง ${typeof item.stock === 'number' ? item.stock + ' ชิ้น' : (item.stock || 'ไม่จำกัด')}`;

    const badgeHtml = isSoldOut
      ? `<span class="dek-badge-soldout"><i class="fa-solid fa-ban"></i> สินค้าหมด</span>`
      : isMaintenance
      ? `<span class="dek-badge-soldout" style="background: rgba(234, 88, 12, 0.9);"><i class="fa-solid fa-wrench"></i> ปรับปรุง</span>`
      : `<span class="dek-badge-sold"><i class="fa-solid fa-clock-rotate-left"></i> ขายแล้ว ${typeof item.sold !== 'undefined' ? item.sold : 1}</span>`;

    // Check if user is a reseller
    let effectivePrice = item.price;
    let priceHtml = `<span class="dek-card-price">${item.priceDisplay || formatBaht(item.price)}</span>`;

    const isReseller = currentUser && (currentUser.isReseller || currentUser.role === 'reseller');
    if (isReseller) {
      const resellerMap = window.RESELLER_PRICING_MAP || {};
      let rPrice = resellerMap[item.id] !== undefined ? resellerMap[item.id] : null;
      if (rPrice === null && currentUser.resellerDiscount) {
        rPrice = Math.max(1, Math.round(item.price * (1 - (currentUser.resellerDiscount / 100))));
      }
      if (rPrice !== null && rPrice < item.price) {
        effectivePrice = rPrice;
        priceHtml = `
          <div style="display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;">
            <span class="dek-card-price" style="color: #10b981;">${formatBaht(rPrice)}</span>
            <span style="font-size: 0.78rem; text-decoration: line-through; color: #94a3b8;">${formatBaht(item.price)}</span>
            <span class="reseller-price-tag"><i class="fa-solid fa-handshake"></i> ราคาส่งตัวแทน</span>
          </div>
        `;
      }
    }

    const buttonHtml = isSoldOut
      ? `<button type="button" class="dek-btn-buy dek-btn-soldout" disabled><i class="fa-solid fa-ban"></i> สินค้าหมด</button>`
      : isMaintenance
      ? `<button type="button" class="dek-btn-buy dek-btn-soldout" disabled><i class="fa-solid fa-wrench"></i> ปิดปรับปรุง</button>`
      : `<button type="button" class="dek-btn-buy" onclick="event.stopPropagation(); handleBuyClick('${item.name.replace(/'/g, "\\'")}', ${effectivePrice})"><i class="fa-solid fa-cart-shopping"></i> สั่งซื้อ <i class="fa-solid fa-chevron-right" style="font-size: 0.72rem; margin-left: 2px;"></i></button>`;

    return `
      <div class="dek-product-card" data-cat="${item.category}" onclick="handleBuyClick('${item.name.replace(/'/g, "\\'")}', ${effectivePrice})">
        <div class="dek-card-img-wrap">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='assets/cat_${item.category}.webp';">
          ${badgeHtml}
        </div>
        <div class="dek-card-body">
          <h3 class="dek-card-title" title="${item.name}">${item.name}</h3>
          <div class="dek-card-price-wrap" style="margin-top: 4px;">
            ${priceHtml}
          </div>
          <div style="margin-top: -2px; margin-bottom: 6px;">
            <span class="dek-stock-indicator ${statusDotClass}"><span class="dek-dot"></span> ${statusText}</span>
          </div>
          <div class="dek-card-bottom" style="margin-top: auto; padding-top: 6px; border-top: none;">
            ${buttonHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}
window.renderProductsGrid = renderProductsGrid;

// Category Showcases on Homepage (PC, IOS, XREG, AD)
function renderHomeCategoryShowcases() {
  const container = document.getElementById('homeShowcaseContainer');
  const prods = window.STORE_PRODUCTS || (typeof STORE_PRODUCTS !== 'undefined' ? STORE_PRODUCTS : []);
  if (!container || !prods) return;

  const cats = [
    { id: 'pc', name: 'PC', color: '#3b82f6', icon: 'fa-desktop' },
    { id: 'ios', name: 'IOS', color: '#60a5fa', icon: 'fa-apple' },
    { id: 'xreg', name: 'XREG AD & IOS', color: '#3b82f6', icon: 'fa-bolt' },
    { id: 'ad', name: 'AD', color: '#10b981', icon: 'fa-android' }
  ];

  container.innerHTML = cats.map(cat => {
    const products = prods.filter(p => p.category === cat.id).slice(0, 4);
    if (!products.length) return '';

    const cardsHtml = products.map(item => {
      const isSoldOut = item.status === 'soldout' || item.stock === 0;
      const isMaintenance = item.status === 'maintenance';
      const statusDotClass = isSoldOut ? 'dek-status-dot--out' : isMaintenance ? 'dek-status-dot--maintenance' : 'dek-status-dot--instock';
      const statusText = isSoldOut ? 'สินค้าหมด' : isMaintenance ? 'ปิดปรับปรุง' : `พร้อมขาย - คลัง ${typeof item.stock === 'number' ? item.stock + ' ชิ้น' : (item.stock || 'ไม่จำกัด')}`;

      const badgeHtml = isSoldOut
        ? `<span class="dek-badge-soldout"><i class="fa-solid fa-ban"></i> สินค้าหมด</span>`
        : isMaintenance
        ? `<span class="dek-badge-soldout" style="background: rgba(234, 88, 12, 0.9);"><i class="fa-solid fa-wrench"></i> ปรับปรุง</span>`
        : `<span class="dek-badge-sold"><i class="fa-solid fa-clock-rotate-left"></i> ขายแล้ว ${typeof item.sold !== 'undefined' ? item.sold : 1}</span>`;

      const buttonHtml = isSoldOut
        ? `<button type="button" class="dek-btn-buy dek-btn-soldout" disabled><i class="fa-solid fa-ban"></i> สินค้าหมด</button>`
        : isMaintenance
        ? `<button type="button" class="dek-btn-buy dek-btn-soldout" disabled><i class="fa-solid fa-wrench"></i> ปิดปรับปรุง</button>`
        : `<button type="button" class="dek-btn-buy" onclick="event.stopPropagation(); handleBuyClick('${item.name.replace(/'/g, "\\'")}', ${item.price})"><i class="fa-solid fa-cart-shopping"></i> สั่งซื้อ <i class="fa-solid fa-chevron-right" style="font-size: 0.72rem; margin-left: 2px;"></i></button>`;

      return `
        <div class="dek-product-card" data-cat="${item.category}" onclick="handleBuyClick('${item.name.replace(/'/g, "\\'")}', ${item.price})">
          <div class="dek-card-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='assets/cat_${item.category}.webp';">
            ${badgeHtml}
          </div>
          <div class="dek-card-body">
            <h3 class="dek-card-title" title="${item.name}">${item.name}</h3>
            <div class="dek-card-price-wrap" style="margin-top: 4px;">
              <span class="dek-card-price">${item.priceDisplay || formatBaht(item.price)}</span>
            </div>
            <div style="margin-top: -2px; margin-bottom: 6px;">
              <span class="dek-stock-indicator ${statusDotClass}"><span class="dek-dot"></span> ${statusText}</span>
            </div>
            <div class="dek-card-bottom" style="margin-top: auto; padding-top: 6px; border-top: none;">
              ${buttonHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const totalCount = prods.filter(p => p.category === cat.id).length;

    return `
      <div class="home-cat-section">
        <div class="home-cat-header-row">
          <h2 class="home-cat-title">
            <span>หมวดหมู่ : </span><span style="color: ${cat.color};">${cat.name}</span>
          </h2>
          <a href="#store" onclick="event.preventDefault(); selectStoreCategory('${cat.id}');" class="home-cat-see-all">
            ดูทั้งหมด (${totalCount}) &gt;
          </a>
        </div>
        <div class="home-cat-cards-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }).join('');
}
window.renderHomeCategoryShowcases = renderHomeCategoryShowcases;

// Setup Store Category Event Listeners
function setupStoreEventListeners() {
  document.querySelectorAll('.store-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.getAttribute('data-category') || tab.getAttribute('data-cat') || 'all';
      selectStoreCategory(cat, true);
    });
  });

  const searchInput = document.getElementById('storeSearchInput');
  searchInput?.addEventListener('input', (e) => filterStoreProducts(e.target.value));

  const sortSelect = document.getElementById('storeSortSelect');
  sortSelect?.addEventListener('change', (e) => handleSortProducts(e.target.value));
}

// =========================================================================
// 🛡️ DEKTHEP BACKOFFICE MASTER CONTROLLER (ระบบจัดการหลังบ้านเต็มรูปแบบ)
// ตั้งค่าได้ทุกอย่าง • เปลี่ยนสีได้ทุกจุด • เปลี่ยนรูปได้ทุกรูป • จัดการสินค้าและสมาชิก
// =========================================================================

window.SITE_SETTINGS = null;
window.ADMIN_PRODUCTS = [];
window.ADMIN_USERS = [];
window.ADMIN_ORDERS = [];

// Pre-defined Theme Color Presets
const THEME_PRESETS = {
  cyber_blue: {
    brandPrimary: '#070ee4',
    brandHover: '#1e26ff',
    brandAccent: '#3b82f6',
    bgBody: '#05070f',
    bgCard: '#0b0e1a',
    bgCardHover: '#11162a',
    borderCardHover: '#070ee4',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    btnPrimaryText: '#ffffff'
  },
  neon_purple: {
    brandPrimary: '#8b5cf6',
    brandHover: '#7c3aed',
    brandAccent: '#a855f7',
    bgBody: '#090614',
    bgCard: '#130d24',
    bgCardHover: '#1c1335',
    borderCardHover: '#8b5cf6',
    textPrimary: '#ffffff',
    textSecondary: '#c084fc',
    btnPrimaryText: '#ffffff'
  },
  crimson_red: {
    brandPrimary: '#ef4444',
    brandHover: '#dc2626',
    brandAccent: '#f87171',
    bgBody: '#120404',
    bgCard: '#1c0808',
    bgCardHover: '#2a0c0c',
    borderCardHover: '#ef4444',
    textPrimary: '#ffffff',
    textSecondary: '#fca5a5',
    btnPrimaryText: '#ffffff'
  },
  emerald_green: {
    brandPrimary: '#10b981',
    brandHover: '#059669',
    brandAccent: '#34d399',
    bgBody: '#03120b',
    bgCard: '#072013',
    bgCardHover: '#0d2d1c',
    borderCardHover: '#10b981',
    textPrimary: '#ffffff',
    textSecondary: '#6ee7b7',
    btnPrimaryText: '#ffffff'
  },
  golden_luxury: {
    brandPrimary: '#f59e0b',
    brandHover: '#d97706',
    brandAccent: '#fbbf24',
    bgBody: '#110c03',
    bgCard: '#1c1507',
    bgCardHover: '#281e0a',
    borderCardHover: '#f59e0b',
    textPrimary: '#ffffff',
    textSecondary: '#fde68a',
    btnPrimaryText: '#18181b'
  },
  deep_midnight: {
    brandPrimary: '#06b6d4',
    brandHover: '#0891b2',
    brandAccent: '#38bdf8',
    bgBody: '#020617',
    bgCard: '#0a1023',
    bgCardHover: '#111b38',
    borderCardHover: '#06b6d4',
    textPrimary: '#ffffff',
    textSecondary: '#7dd3fc',
    btnPrimaryText: '#0f172a'
  }
};

// 1. Load Settings and Apply Themes/Images/Text
async function loadSiteSettings() {
  try {
    const res = await fetch('/api/settings');
    const raw = await res.json();
    const settings = raw.settings || raw;
    window.SITE_SETTINGS = settings;

    // Apply Theme Colors to CSS variables
    applyThemeToDOM(settings.theme);

    // Apply Images across DOM
    applyImagesToDOM(settings.images, settings.categories);

    // Apply General Texts & Links
    applyGeneralToDOM(settings);

    // Apply Payment Channels & Bank Details
    applyPaymentsToDOM(settings.payments);

    // Apply Store Announcement & Maintenance / Grand Opening Countdown
    if (typeof applyAnnouncementAndMaintenance === 'function') {
      applyAnnouncementAndMaintenance(settings);
    }

    // Fetch Reseller Pricing Map
    if (typeof fetchResellerPricing === 'function') {
      fetchResellerPricing();
    }

    // Initialize Site Loading Addon Preloader
    if (typeof initSiteLoadingScreen === 'function') {
      initSiteLoadingScreen(settings.loadingAddon);
    }

    // Initialize Site Background Particles Addon
    if (typeof initSiteParticles === 'function') {
      initSiteParticles(settings.particleAddon);
    }

    // Apply Recent Purchases Speed
    if (settings.recentPurchases && settings.recentPurchases.speed && typeof updateRecentPurchasesSpeed === 'function') {
      updateRecentPurchasesSpeed(settings.recentPurchases.speed);
    }

    // Initialize Background Music Player
    if (typeof initBackgroundMusicPlayer === 'function') {
      initBackgroundMusicPlayer(settings.backgroundMusic);
    }

    // Populate inputs inside Admin Panels
    populateAdminInputs(settings);

    // Also fetch products from server to ensure live sync with products.json
    try {
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.products && Array.isArray(prodData.products)) {
          window.STORE_PRODUCTS = prodData.products;
          if (typeof STORE_PRODUCTS !== 'undefined') STORE_PRODUCTS = prodData.products;
          window.ADMIN_PRODUCTS = prodData.products;
          renderProductsGrid();
          renderHomeCategoryShowcases();
          updateCategoryTabCounts(prodData.products);
          if (typeof renderRecentPurchasesTicker === 'function') renderRecentPurchasesTicker();
          const cnt = document.getElementById('adminProdCount');
          if (cnt) cnt.textContent = prodData.products.length;
        }
      }
    } catch (e) {
      // ignore
    }

  } catch (err) {
    console.warn('Failed to load site settings:', err);
  }
}
window.loadSiteSettings = loadSiteSettings;

// Apply Theme CSS variables
function applyThemeToDOM(theme) {
  if (!theme) return;
  const root = document.documentElement;

  if (theme.brandPrimary) {
    root.style.setProperty('--brand', theme.brandPrimary);
    root.style.setProperty('--brand-primary', theme.brandPrimary);
    root.style.setProperty('--primary', theme.brandPrimary);
  }
  if (theme.brandHover) {
    root.style.setProperty('--brand-hover', theme.brandHover);
  }
  if (theme.brandAccent) {
    root.style.setProperty('--brand-accent', theme.brandAccent);
    root.style.setProperty('--accent', theme.brandAccent);
    root.style.setProperty('--brand-glow', `${theme.brandAccent}55`);
  }
  if (theme.bgBody) {
    root.style.setProperty('--bg-primary', theme.bgBody);
    root.style.setProperty('--bg-dark', theme.bgBody);
    document.body.style.backgroundColor = theme.bgBody;
  }
  if (theme.bgCard) {
    root.style.setProperty('--bg-card', theme.bgCard);
    root.style.setProperty('--bg-secondary', theme.bgCard);
  }
  if (theme.bgCardHover) {
    root.style.setProperty('--bg-card-hover', theme.bgCardHover);
  }
  if (theme.borderCardHover) {
    root.style.setProperty('--border-card-hover', theme.borderCardHover);
  }
  if (theme.textPrimary) {
    root.style.setProperty('--text-primary', theme.textPrimary);
  }
  if (theme.textSecondary) {
    root.style.setProperty('--text-secondary', theme.textSecondary);
  }
  if (theme.btnPrimaryText) {
    root.style.setProperty('--btn-primary-text', theme.btnPrimaryText);
  }
}

// Apply Images to DOM elements
function applyImagesToDOM(images, categories) {
  if (images) {
    // Logo
    if (images.logo) {
      document.querySelectorAll('.navbar-brand img, .footer-brand img, #navLogoImg, #footerLogoImg, #heroLogoImg, .brand-logo-img, .auth-logo-img, #contactModalAvatar').forEach(img => {
        img.src = images.logo;
      });
    }

    // Hero Banner
    if (images.heroBanner) {
      document.querySelectorAll('#heroMainBanner, #heroBannerImg, .hero-banner-img').forEach(img => {
        img.src = images.heroBanner;
      });
    }

    // Store Banner
    if (images.storeBanner) {
      document.querySelectorAll('#storeMainBannerImg, #storeBannerImg, .store-banner-img').forEach(img => {
        img.src = images.storeBanner;
      });
    }

    // Website Background Wallpaper
    const bgWallEl = document.getElementById('siteBackgroundWallpaper');
    if (images.siteWallpaper) {
      if (bgWallEl) {
        bgWallEl.style.backgroundImage = `url("${images.siteWallpaper}")`;
        bgWallEl.style.display = 'block';
      }
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url("${images.siteWallpaper}")`;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    } else {
      if (bgWallEl) bgWallEl.style.display = 'none';
      document.body.style.backgroundImage = 'none';
    }
  }

  // Categories Banners
  if (categories) {
    Object.keys(categories).forEach(catId => {
      const cat = categories[catId];
      if (cat && cat.banner) {
        document.querySelectorAll(`.cat-card-${catId} img, [data-cat-banner="${catId}"]`).forEach(img => {
          img.src = cat.banner;
        });
      }
    });
  }
}

// Apply General Texts & Links to DOM
function applyGeneralToDOM(settings) {
  if (!settings) return;
  const { general, hero, features } = settings;

  if (general) {
    if (general.siteTitle) document.title = general.siteTitle;
    if (general.storeName) {
      document.querySelectorAll('#navBrandName, #footerBrandName, .brand-store-name, #contactModalTitle').forEach(el => {
        el.textContent = general.storeName;
      });
    }
    if (general.discordUrl) {
      document.querySelectorAll('#navDiscordBtn, #footerDiscordLink, a.btn-discord-link, #contactModalDiscordBtn, #navDiscordQuickBtn').forEach(a => {
        a.href = general.discordUrl;
      });
    }
    if (general.youtubeUrl) {
      document.querySelectorAll('#footerYoutubeLink, a.btn-youtube-link, #contactModalYouTubeBtn').forEach(a => {
        a.href = general.youtubeUrl;
      });
    }
    if (general.footerText) {
      const footerEl = document.getElementById('footerDescText');
      if (footerEl) footerEl.textContent = general.footerText;
    }
  }

  if (hero) {
    const badgeEl = document.getElementById('heroBadgeText') || document.querySelector('.hero-badge span');
    if (badgeEl && hero.badgeText) badgeEl.textContent = hero.badgeText;

    const titlePrefixEl = document.getElementById('heroTitlePrefix');
    if (titlePrefixEl && hero.titlePrefix) titlePrefixEl.textContent = hero.titlePrefix;

    const titleGradientEl = document.getElementById('heroTitleGradient');
    if (titleGradientEl && hero.titleGradient) titleGradientEl.textContent = hero.titleGradient;

    const subHighlightEl = document.getElementById('heroSubtitleHighlight');
    if (subHighlightEl && hero.subtitleHighlight) subHighlightEl.textContent = hero.subtitleHighlight;

    const subtitleEl = document.getElementById('heroSubtitle');
    if (subtitleEl && hero.subtitle) subtitleEl.textContent = hero.subtitle;

    const announceEl = document.getElementById('announcementText');
    if (announceEl && hero.announcementText) announceEl.textContent = hero.announcementText;
  }

  const stats = (features && features.stats && (features.stats.users || features.stats.products || features.stats.stock || features.stats.sold))
    ? features.stats
    : (hero ? {
        users: hero.statsUsers || features?.stats?.users,
        products: hero.statsProducts || features?.stats?.products,
        stock: hero.statsStock || features?.stats?.stock,
        sold: hero.statsSold || features?.stats?.sold
      } : (features?.stats || null));

  if (stats) {
    const sUsers = document.getElementById('statUsersCount');
    const sProds = document.getElementById('statProductsCount');
    const sStock = document.getElementById('statStockCount');
    const sSold = document.getElementById('statSoldCount');

    if (sUsers && stats.users !== undefined && stats.users !== '') sUsers.textContent = stats.users;
    if (sProds && stats.products !== undefined && stats.products !== '') sProds.textContent = stats.products;
    if (sStock && stats.stock !== undefined && stats.stock !== '') sStock.textContent = stats.stock;
    if (sSold && stats.sold !== undefined && stats.sold !== '') sSold.textContent = stats.sold;
  }
}

// Populate Admin form inputs
function populateAdminInputs(settings) {
  if (!settings) return;
  const { theme, images, categories, general, hero, features } = settings;

  // Colors
  if (theme) {
    const colorMap = {
      cfg_brandPrimary: theme.brandPrimary,
      cfg_brandHover: theme.brandHover,
      cfg_brandAccent: theme.brandAccent,
      cfg_bgBody: theme.bgBody,
      cfg_bgCard: theme.bgCard,
      cfg_bgCardHover: theme.bgCardHover,
      cfg_borderCardHover: theme.borderCardHover,
      cfg_textPrimary: theme.textPrimary,
      cfg_textSecondary: theme.textSecondary,
      cfg_btnPrimaryText: theme.btnPrimaryText
    };

    Object.keys(colorMap).forEach(id => {
      const val = colorMap[id];
      if (!val) return;
      const colInput = document.getElementById(id);
      const txtInput = document.getElementById(id + '_text');
      if (colInput) colInput.value = val;
      if (txtInput) txtInput.value = val;
    });
  }

  // Images
  if (images) {
    if (images.logo) {
      setAdminImgInput('cfg_img_logo', 'preview_img_logo', images.logo);
    }
    if (images.heroBanner) {
      setAdminImgInput('cfg_img_heroBanner', 'preview_img_heroBanner', images.heroBanner);
    }
    if (images.storeBanner) {
      setAdminImgInput('cfg_img_storeBanner', 'preview_img_storeBanner', images.storeBanner);
    }
    if (images.siteWallpaper) {
      setAdminImgInput('cfg_img_siteWallpaper', 'preview_img_siteWallpaper', images.siteWallpaper);
    }
  }

  // Categories
  if (categories) {
    if (categories.pc?.banner) setAdminImgInput('cfg_img_cat_pc', 'preview_img_cat_pc', categories.pc.banner);
    if (categories.ios?.banner) setAdminImgInput('cfg_img_cat_ios', 'preview_img_cat_ios', categories.ios.banner);
    if (categories.xreg?.banner) setAdminImgInput('cfg_img_cat_xreg', 'preview_img_cat_xreg', categories.xreg.banner);
    if (categories.ad?.banner) setAdminImgInput('cfg_img_cat_ad', 'preview_img_cat_ad', categories.ad.banner);
  }

  // General & Hero
  if (general) {
    setVal('cfg_storeName', general.storeName);
    setVal('cfg_siteTitle', general.siteTitle);
    setVal('cfg_discordUrl', general.discordUrl);
    setVal('cfg_youtubeUrl', general.youtubeUrl);
    setVal('cfg_footerText', general.footerText);
  }

  if (hero) {
    setVal('cfg_badgeText', hero.badgeText);
    setVal('cfg_titlePrefix', hero.titlePrefix);
    setVal('cfg_titleGradient', hero.titleGradient);
    setVal('cfg_subtitleHighlight', hero.subtitleHighlight);
    setVal('cfg_subtitle', hero.subtitle);
    setVal('cfg_announcementText', hero.announcementText);
  }

  const stats = (features && features.stats && (features.stats.users || features.stats.products || features.stats.stock || features.stats.sold))
    ? features.stats
    : (hero ? {
        users: hero.statsUsers || features?.stats?.users || '3,552',
        products: hero.statsProducts || features?.stats?.products || '41',
        stock: hero.statsStock || features?.stats?.stock || '587',
        sold: hero.statsSold || features?.stats?.sold || '24,603'
      } : (features?.stats || {}));

  setVal('cfg_statsUsers', stats.users || '3,552');
  setVal('cfg_statsProducts', stats.products || '41');
  setVal('cfg_statsStock', stats.stock || '587');
  setVal('cfg_statsSold', stats.sold || '24,603');

  // Payments
  if (settings.payments) {
    populateAdminPaymentsInputs(settings.payments);
  }

  // Announcement & Maintenance
  if (typeof loadAdminAnnouncementSettings === 'function') {
    loadAdminAnnouncementSettings();
  }

  // Loading Addon
  if (settings.loadingAddon && typeof populateAdminLoadingInputs === 'function') {
    populateAdminLoadingInputs(settings.loadingAddon);
  }

  // Recent Purchases Speed
  if (settings.recentPurchases && settings.recentPurchases.speed && typeof updateRecentPurchasesSpeed === 'function') {
    updateRecentPurchasesSpeed(settings.recentPurchases.speed);
  }

  // Particle Addon
  if (typeof populateAdminParticleInputs === 'function') {
    populateAdminParticleInputs(settings.particleAddon);
  }

  // Background Music
  if (typeof populateAdminMusicInputs === 'function') {
    populateAdminMusicInputs(settings.backgroundMusic);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function setAdminImgInput(inputId, previewId, url) {
  const inp = document.getElementById(inputId);
  const prv = document.getElementById(previewId);
  if (inp) inp.value = url;
  if (prv) prv.src = url;
}

// 2. Initialize Admin Dashboard & Tabs (100% Real Database Stats)
async function loadAdminOverviewStats() {
  const totRevEl = document.getElementById('overviewTotalRevenue');
  const totProdEl = document.getElementById('overviewTotalProducts');
  const totUsersEl = document.getElementById('overviewTotalUsers');
  const totOrdersEl = document.getElementById('overviewTotalOrders');

  try {
    const res = await fetch('/api/admin/overview-stats', {
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) {
        if (totRevEl) totRevEl.textContent = data.stats.totalRevenueFormatted;
        if (totProdEl) totProdEl.textContent = data.stats.totalProductsFormatted;
        if (totUsersEl) totUsersEl.textContent = data.stats.totalUsersFormatted;
        if (totOrdersEl) totOrdersEl.textContent = `${data.stats.totalOrders || (window.ADMIN_ORDERS || []).length} รายการ`;
        return;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch /api/admin/overview-stats, falling back to local memory:', err);
  }

  const products = window.ADMIN_PRODUCTS || [];
  const users = window.ADMIN_USERS || [];
  const orders = window.ADMIN_ORDERS || [];

  let revenue = 0;
  orders.forEach(o => { revenue += (Number(o.price) || 0); });

  if (totRevEl) totRevEl.textContent = formatBaht(revenue);
  if (totProdEl) totProdEl.textContent = `${products.length} ชิ้น`;
  if (totUsersEl) totUsersEl.textContent = `${users.length} คน`;
  if (totOrdersEl) totOrdersEl.textContent = `${orders.length} รายการ`;
}
window.loadAdminOverviewStats = loadAdminOverviewStats;

function updateOverviewStats() {
  loadAdminOverviewStats();
}
window.updateOverviewStats = updateOverviewStats;

// ==========================================
// 2.5 Admin Data Reset Controllers
// ==========================================
async function confirmResetAdminData(target) {
  let endpoint = '';
  let confirmMsg = '';

  switch (target) {
    case 'orders':
      endpoint = '/api/admin/reset/orders';
      confirmMsg = 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ต "ประวัติรายการคำสั่งซื้อ" ทั้งหมดเป็น 0 รายการ? (ไม่สามารถย้อนกลับได้)';
      break;
    case 'revenue':
      endpoint = '/api/admin/reset/revenue';
      confirmMsg = 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ต "ยอดขายสินค้ารวม" ให้กลับเป็น ฿0.00?';
      break;
    case 'products':
      endpoint = '/api/admin/reset/products';
      confirmMsg = 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ต "รายการสินค้าทั้งหมด" คืนค่ากลับเป็น 41 รายการเริ่มต้น?';
      break;
    case 'users':
      endpoint = '/api/admin/reset/users';
      confirmMsg = 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ต "สมาชิกในระบบ" ทั้งหมด? (จะคงเหลือเฉพาะบัญชีผู้ดูแลระบบ)';
      break;
    case 'all':
      endpoint = '/api/admin/reset/all';
      confirmMsg = '⚠️ คำเตือนสำคัญ: คุณต้องการรีเซ็ตข้อมูลระบบทั้งหมด (ประวัติคำสั่งซื้อ, ยอดขาย, สินค้า, สมาชิก) ใช่หรือไม่?';
      break;
    default:
      return;
  }

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || 'รีเซ็ตข้อมูลเรียบร้อยแล้ว!', 'success');
      
      // Refresh affected lists
      if (target === 'orders' || target === 'revenue' || target === 'all') {
        window.ADMIN_ORDERS = [];
        await loadAdminOrders();
      }
      if (target === 'products' || target === 'all') {
        await loadAdminProducts();
        if (typeof renderProductsGrid === 'function') renderProductsGrid();
        if (typeof renderHomeCategoryShowcases === 'function') renderHomeCategoryShowcases();
      }
      if (target === 'users' || target === 'all') {
        await loadAdminUsers();
      }

      await loadAdminOverviewStats();
    } else {
      showToast(data.error || 'รีเซ็ตข้อมูลไม่สำเร็จ', 'error');
    }
  } catch (err) {
    console.error('Error resetting data:', err);
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.confirmResetAdminData = confirmResetAdminData;

function toggleAdvancedColors() {
  const sec = document.getElementById('advColorsSection');
  const arrow = document.getElementById('advColorArrow');
  if (!sec) return;
  const isHidden = sec.style.display === 'none' || getComputedStyle(sec).display === 'none';
  sec.style.display = isHidden ? 'block' : 'none';
  if (arrow) arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
}
window.toggleAdvancedColors = toggleAdvancedColors;

function initAdminDashboard() {
  if (window.SITE_SETTINGS) {
    populateAdminInputs(window.SITE_SETTINGS);
  } else {
    loadSiteSettings();
  }
  loadAdminProducts();
  loadAdminUsers();
  loadAdminOrders();
  switchAdminTab('dashboard');
}
window.initAdminDashboard = initAdminDashboard;

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-sidebar-item, .admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });

  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `adminPanel-${tabName}`);
  });

  if (tabName === 'dashboard') {
    updateOverviewStats();
  } else if (tabName === 'products') {
    loadAdminProducts();
  } else if (tabName === 'users') {
    loadAdminUsers();
  } else if (tabName === 'orders') {
    loadAdminOrders();
  } else if (tabName === 'payments') {
    if (window.SITE_SETTINGS && window.SITE_SETTINGS.payments) {
      populateAdminPaymentsInputs(window.SITE_SETTINGS.payments);
    }
  } else if (tabName === 'announcement') {
    loadAdminAnnouncementSettings();
  } else if (tabName === 'resellers') {
    loadAdminResellersData();
  } else if (tabName === 'loading') {
    populateAdminLoadingInputs(window.SITE_SETTINGS && window.SITE_SETTINGS.loadingAddon);
  } else if (tabName === 'particles') {
    populateAdminParticleInputs(window.SITE_SETTINGS && window.SITE_SETTINGS.particleAddon);
    startParticleLivePreview();
  } else if (tabName === 'music') {
    populateAdminMusicInputs(window.SITE_SETTINGS && window.SITE_SETTINGS.backgroundMusic);
  }
}
window.switchAdminTab = switchAdminTab;

// =========================================================
// 📢 STORE ANNOUNCEMENT & GRAND OPENING / MAINTENANCE CONTROLLER
// =========================================================
window.maintenanceInterval = null;
window.IS_ADMIN_BYPASS = false;
window.ADMIN_FORCE_CUSTOMER_VIEW = false;

function toggleCustomerStoreClosedView(show) {
  window.ADMIN_FORCE_CUSTOMER_VIEW = Boolean(show);
  if (window.SITE_SETTINGS) {
    applyAnnouncementAndMaintenance(window.SITE_SETTINGS);
  }
}
window.toggleCustomerStoreClosedView = toggleCustomerStoreClosedView;

function applyAnnouncementAndMaintenance(settings) {
  if (!settings) return;

  // 1. Store Announcement Bar
  const annBar = document.getElementById('storeAnnouncementBar');
  const annBadge = document.getElementById('announcementBadgeText') || document.getElementById('storeAnnouncementBadge');
  const annText = document.getElementById('announcementMessageText') || document.getElementById('storeAnnouncementText');

  if (settings.announcement && settings.announcement.enabled) {
    if (annBar) annBar.style.display = 'block';
    if (annBadge) annBadge.textContent = settings.announcement.badge || 'อัปเดตร้านค้า';
    if (annText) annText.textContent = settings.announcement.text || 'ยินดีต้อนรับสู่ DEKTHEP STORE';
  } else {
    if (annBar) annBar.style.display = 'none';
  }

}
window.applyAnnouncementAndMaintenance = applyAnnouncementAndMaintenance;

function closeStoreAnnouncement() {
  const bar = document.getElementById('storeAnnouncementBar');
  if (bar) bar.style.display = 'none';
}
window.closeStoreAnnouncement = closeStoreAnnouncement;

function startMaintenanceCountdown(targetIsoString, autoOpen) {
  if (window.maintenanceInterval) clearInterval(window.maintenanceInterval);
  if (!targetIsoString) return;

  const targetTime = new Date(targetIsoString).getTime();

  function update() {
    const now = Date.now();
    const diff = targetTime - now;

    if (diff <= 0) {
      const cdD = document.getElementById('cdDays');
      const cdH = document.getElementById('cdHours');
      const cdM = document.getElementById('cdMinutes');
      const cdS = document.getElementById('cdSeconds');
      if (cdD) cdD.textContent = '00';
      if (cdH) cdH.textContent = '00';
      if (cdM) cdM.textContent = '00';
      if (cdS) cdS.textContent = '00';

      if (window.maintenanceInterval) clearInterval(window.maintenanceInterval);

      if (autoOpen) {
        showToast('🎉 ถึงเวลาเปิดร้านแล้ว! ยินดีต้อนรับเข้าสู่ร้านค้า', 'success');
        const overlay = document.getElementById('storeMaintenanceOverlay');
        if (overlay) overlay.style.display = 'none';
        loadSiteSettings();
      }
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const cdD = document.getElementById('cdDays');
    const cdH = document.getElementById('cdHours');
    const cdM = document.getElementById('cdMinutes');
    const cdS = document.getElementById('cdSeconds');

    if (cdD) cdD.textContent = pad(d);
    if (cdH) cdH.textContent = pad(h);
    if (cdM) cdM.textContent = pad(m);
    if (cdS) cdS.textContent = pad(s);

    const simD = document.getElementById('adminSimDays');
    const simH = document.getElementById('adminSimHours');
    const simM = document.getElementById('adminSimMinutes');
    const simS = document.getElementById('adminSimSeconds');
    if (simD) simD.textContent = pad(d);
    if (simH) simH.textContent = pad(h);
    if (simM) simM.textContent = pad(m);
    if (simS) simS.textContent = pad(s);
  }

  update();
  window.maintenanceInterval = setInterval(update, 1000);
}

// Quick Timer Presets
function quickSetOpeningMinutes(minutes) {
  const target = new Date(Date.now() + minutes * 60 * 1000);
  const input = document.getElementById('cfg_maint_openingDateTime');
  if (input) {
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(target - tzOffset)).toISOString().slice(0, 16);
    input.value = localISOTime;
    const maintSwitch = document.getElementById('cfg_maint_enabled');
    if (maintSwitch && !maintSwitch.checked) {
      maintSwitch.checked = true;
      onMaintenanceSwitchChange(true);
    }
    showToast(`⏱️ ตั้งเวลานับถอยหลังเป็นอีก ${minutes} นาทีข้างหน้าแล้ว`, 'info');
  }
}
window.quickSetOpeningMinutes = quickSetOpeningMinutes;

function quickSetOpeningHours(hours) {
  const target = new Date(Date.now() + hours * 3600 * 1000);
  const input = document.getElementById('cfg_maint_openingDateTime');
  if (input) {
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(target - tzOffset)).toISOString().slice(0, 16);
    input.value = localISOTime;
    const maintSwitch = document.getElementById('cfg_maint_enabled');
    if (maintSwitch && !maintSwitch.checked) {
      maintSwitch.checked = true;
      onMaintenanceSwitchChange(true);
    }
    showToast(`⏱️ ตั้งเวลานับถอยหลังเป็นอีก ${hours} ชั่วโมงข้างหน้าแล้ว`, 'info');
  }
}
window.quickSetOpeningHours = quickSetOpeningHours;

// Quick Store Toggle & Status Display
async function quickToggleMaintenance(turnOn) {
  try {
    const dtInput = document.getElementById('cfg_maint_openingDateTime');
    const dtVal = dtInput ? dtInput.value : '';
    const openingDateTime = dtVal ? new Date(dtVal).toISOString() : undefined;
    const autoOpen = document.getElementById('cfg_maint_autoOpen')?.checked !== false;

    const res = await fetch('/api/admin/maintenance/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ 
        enabled: turnOn,
        openingDateTime: turnOn ? openingDateTime : undefined,
        autoOpen
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (!window.SITE_SETTINGS) window.SITE_SETTINGS = {};
      window.SITE_SETTINGS.maintenance = data.maintenance;
      if (turnOn) {
        window.ADMIN_FORCE_CUSTOMER_VIEW = true;
      } else {
        window.ADMIN_FORCE_CUSTOMER_VIEW = false;
      }
      applyAnnouncementAndMaintenance(window.SITE_SETTINGS);
      showToast(data.message, 'success');
      loadAdminAnnouncementSettings();
    } else {
      showToast(data.error || 'ดำเนินการไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.quickToggleMaintenance = quickToggleMaintenance;

function onMaintenanceSwitchChange(isChecked) {
  updateAdminStoreStatusDisplay({ enabled: isChecked });
}
window.onMaintenanceSwitchChange = onMaintenanceSwitchChange;

function updateAdminStoreStatusDisplay(maint) {
  const isEnabled = maint ? Boolean(maint.enabled) : false;
  const light = document.getElementById('adminStoreStatusLight');
  const title = document.getElementById('adminStoreStatusTitle');
  const sub = document.getElementById('adminStoreStatusSub');
  const btnClose = document.getElementById('btnQuickCloseStore');
  const btnOpen = document.getElementById('btnQuickOpenStore');

  if (light) {
    light.style.background = isEnabled ? '#ef4444' : '#10b981';
    light.style.boxShadow = isEnabled ? '0 0 15px #ef4444' : '0 0 15px #10b981';
  }
  if (title) {
    title.innerHTML = isEnabled 
      ? `สถานะร้านค้า: <span style="color: #ef4444;">🔴 ปิดร้าน / ปิดปรับปรุงชั่วคราว</span>`
      : `สถานะร้านค้า: <span style="color: #10b981;">🟢 เปิดให้บริการปกติ (Online)</span>`;
  }
  if (sub) {
    sub.textContent = isEnabled
      ? 'หน้าร้านค้าถูกปิดอยู่ ลูกค้าทั่วไปจะไม่สามารถสั่งซื้อสินค้าได้ (เฉพาะ Admin ที่เข้าจัดการหลังบ้านได้)'
      : 'ลูกค้าทุกคนสามารถเข้าชมร้าน เลือกซื้อสินค้า และเติมเงินได้ตามปกติ';
  }
  if (btnClose) btnClose.style.display = isEnabled ? 'none' : 'inline-flex';
  if (btnOpen) btnOpen.style.display = isEnabled ? 'inline-flex' : 'none';
}

function generateRandomAdminPin() {
  const rand = Math.floor(100000 + Math.random() * 900000).toString();
  const input = document.getElementById('cfg_maint_pinCode');
  if (input) {
    input.value = rand;
    input.type = 'text';
    const icon = document.getElementById('adminPinEyeIcon');
    if (icon) icon.className = 'fa-regular fa-eye-slash';
    showToast(`🎲 สุ่มรหัส PIN 6 ตัวใหม่แล้ว: ${rand} (อย่าลืมกดบันทึกการตั้งค่า)`, 'info');
  }
}
window.generateRandomAdminPin = generateRandomAdminPin;

let isAdminPinInputVisible = false;
function toggleAdminPinInputVisibility() {
  isAdminPinInputVisible = !isAdminPinInputVisible;
  const input = document.getElementById('cfg_maint_pinCode');
  const icon = document.getElementById('adminPinEyeIcon');
  if (input) input.type = isAdminPinInputVisible ? 'text' : 'password';
  if (icon) icon.className = isAdminPinInputVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}
window.toggleAdminPinInputVisibility = toggleAdminPinInputVisibility;

function copyAdminPinCode() {
  const input = document.getElementById('cfg_maint_pinCode');
  const pin = input ? input.value : '123456';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(pin).then(() => {
      showToast(`คัดลอกรหัส PIN ${pin} เรียบร้อยแล้ว`, 'success');
    }).catch(() => {
      prompt('รหัส PIN:', pin);
    });
  } else {
    prompt('รหัส PIN:', pin);
  }
}
window.copyAdminPinCode = copyAdminPinCode;

// Load inputs inside Announcement & Maintenance Backoffice Tab
function loadAdminAnnouncementSettings() {
  const settings = window.SITE_SETTINGS || {};
  const maint = settings.maintenance || {};

  const maintEn = document.getElementById('cfg_maint_enabled');
  if (maintEn) maintEn.checked = !!maint.enabled;
  setVal('cfg_maint_title', maint.title || 'ร้านปิดปรับปรุงชั่วคราว');
  setVal('cfg_maint_subtitle', maint.subtitle || 'ระบบกำลังทำการปรับปรุงและเตรียมเปิดให้บริการอย่างเป็นทางการเร็วๆ นี้');
  setVal('cfg_maint_discordUrl', maint.discordUrl || 'https://discord.gg/2gnZUFFSXU');
  setVal('cfg_maint_pinCode', maint.pinCode || '123456');

  const autoOpenChk = document.getElementById('cfg_maint_autoOpen');
  if (autoOpenChk) autoOpenChk.checked = maint.autoOpen !== false;

  const dtInput = document.getElementById('cfg_maint_openingDateTime');
  if (dtInput) {
    if (maint.openingDateTime) {
      const d = new Date(maint.openingDateTime);
      if (!isNaN(d.getTime())) {
        const tzOffset = d.getTimezoneOffset() * 60000;
        dtInput.value = (new Date(d - tzOffset)).toISOString().slice(0, 16);
      } else {
        quickSetOpeningHours(24);
      }
    } else {
      quickSetOpeningHours(24);
    }
  }

  updateAdminStoreStatusDisplay(maint);
}
window.loadAdminAnnouncementSettings = loadAdminAnnouncementSettings;

async function saveAdminAnnouncementAndSchedule() {
  const dtInput = document.getElementById('cfg_maint_openingDateTime');
  const dtVal = dtInput ? dtInput.value : '';
  const openingDateTime = dtVal ? new Date(dtVal).toISOString() : new Date(Date.now() + 24*3600*1000).toISOString();

  let pinCode = document.getElementById('cfg_maint_pinCode')?.value.trim() || '123456';
  if (!/^\d{6}$/.test(pinCode)) {
    showToast('รหัส PIN ต้องเป็นตัวเลข 6 ตัว (0-9)', 'warning');
    return;
  }

  const announcement = {
    enabled: false,
    badge: '',
    text: '',
    link: ''
  };

  const maintenance = {
    enabled: document.getElementById('cfg_maint_enabled')?.checked || false,
    title: document.getElementById('cfg_maint_title')?.value.trim() || 'ร้านปิดปรับปรุงชั่วคราว',
    subtitle: document.getElementById('cfg_maint_subtitle')?.value.trim() || 'ระบบกำลังทำการปรับปรุงและเตรียมเปิดให้บริการอย่างเป็นทางการเร็วๆ นี้',
    openingDateTime: openingDateTime,
    autoOpen: document.getElementById('cfg_maint_autoOpen')?.checked !== false,
    allowAdminBypass: true,
    pinCode: pinCode,
    discordUrl: document.getElementById('cfg_maint_discordUrl')?.value.trim() || 'https://discord.gg/2gnZUFFSXU'
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ announcement, maintenance })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (!window.SITE_SETTINGS) window.SITE_SETTINGS = {};
      window.SITE_SETTINGS.announcement = announcement;
      window.SITE_SETTINGS.maintenance = maintenance;
      applyAnnouncementAndMaintenance(window.SITE_SETTINGS);
      updateAdminStoreStatusDisplay(maintenance);
      showToast('บันทึกการตั้งค่าระบบเปิด-ปิดร้าน, ตัวจับเวลา และรหัส PIN 6 ตัวเรียบร้อยแล้ว!', 'success');
    } else {
      showToast(data.error || 'บันทึกข้อมูลไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.saveAdminAnnouncementAndSchedule = saveAdminAnnouncementAndSchedule;

// =========================================================
// 🔑 6-DIGIT ADMIN PIN CONTROLLER
// =========================================================
function openAdminPinModal() {
  const modal = document.getElementById('adminPinModalOverlay');
  if (!modal) return;
  modal.style.display = 'flex';
  clearPinInputs();
  const errMsg = document.getElementById('pinErrorMessage');
  if (errMsg) errMsg.style.display = 'none';
  setTimeout(() => {
    const firstDigit = document.querySelector('.pin-digit[data-idx="0"]');
    if (firstDigit) firstDigit.focus();
  }, 100);
}
window.openAdminPinModal = openAdminPinModal;

function closeAdminPinModal() {
  const modal = document.getElementById('adminPinModalOverlay');
  if (modal) modal.style.display = 'none';
  clearPinInputs();
}
window.closeAdminPinModal = closeAdminPinModal;

function getEnteredPin() {
  const digits = document.querySelectorAll('.pin-digit');
  let pin = '';
  digits.forEach(d => pin += (d.value || ''));
  return pin;
}

function clearPinInputs() {
  const digits = document.querySelectorAll('.pin-digit');
  digits.forEach(d => {
    d.value = '';
    d.classList.remove('filled');
  });
  const first = document.querySelector('.pin-digit[data-idx="0"]');
  if (first) first.focus();
}
window.clearPinInputs = clearPinInputs;

function backspacePinInput() {
  const digits = Array.from(document.querySelectorAll('.pin-digit'));
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i].value !== '') {
      digits[i].value = '';
      digits[i].classList.remove('filled');
      digits[i].focus();
      return;
    }
  }
  if (digits[0]) digits[0].focus();
}
window.backspacePinInput = backspacePinInput;

function pressPinKey(digitChar) {
  const digits = Array.from(document.querySelectorAll('.pin-digit'));
  for (let i = 0; i < digits.length; i++) {
    if (digits[i].value === '') {
      digits[i].value = digitChar;
      digits[i].classList.add('filled');
      if (i + 1 < digits.length) {
        digits[i + 1].focus();
      } else {
        // Last digit entered! Auto submit
        setTimeout(submitAdminPin, 100);
      }
      return;
    }
  }
}
window.pressPinKey = pressPinKey;

let isPinVisible = false;
function togglePinVisibility() {
  isPinVisible = !isPinVisible;
  const digits = document.querySelectorAll('.pin-digit');
  digits.forEach(d => {
    d.type = isPinVisible ? 'text' : 'password';
  });
  const icon = document.getElementById('pinEyeIcon');
  const text = document.getElementById('pinEyeText');
  if (icon) icon.className = isPinVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  if (text) text.textContent = isPinVisible ? 'ซ่อนตัวเลข' : 'แสดงตัวเลข';
}
window.togglePinVisibility = togglePinVisibility;

async function submitAdminPin() {
  const pin = getEnteredPin();
  const errMsg = document.getElementById('pinErrorMessage');
  const wrapper = document.getElementById('pinInputsWrapper');

  if (pin.length !== 6) {
    if (errMsg) {
      errMsg.textContent = 'กรุณากรอกรหัส PIN ให้ครบทั้ง 6 หลัก';
      errMsg.style.display = 'block';
    }
    if (wrapper) {
      wrapper.classList.remove('shake');
      void wrapper.offsetWidth;
      wrapper.classList.add('shake');
    }
    return;
  }

  const btn = document.getElementById('btnSubmitPin');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>กำลังตรวจสอบรหัส...</span>`;
  }

  try {
    const res = await fetch('/api/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      window.IS_ADMIN_BYPASS = true;
      if (data.user) {
        currentUser = data.user;
        updateUserState(currentUser);
      }
      showToast('🎉 รหัส PIN 6 ตัวถูกต้อง! ปลดล็อกเข้าสู่ระบบหลังบ้านสำเร็จ', 'success');
      closeAdminPinModal();
      
      // Hide maintenance screen for admin
      const maintOverlay = document.getElementById('storeMaintenanceOverlay');
      if (maintOverlay) maintOverlay.style.display = 'none';
      const previewBar = document.getElementById('adminMaintenancePreviewBar');
      if (previewBar && window.SITE_SETTINGS?.maintenance?.enabled) previewBar.style.display = 'block';

      // Switch view to admin
      switchPageView('admin');
    } else {
      if (errMsg) {
        errMsg.textContent = data.error || 'รหัส PIN 6 ตัวไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
        errMsg.style.display = 'block';
      }
      if (wrapper) {
        wrapper.classList.remove('shake');
        void wrapper.offsetWidth;
        wrapper.classList.add('shake');
      }
      clearPinInputs();
    }
  } catch (err) {
    if (errMsg) {
      errMsg.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      errMsg.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-unlock-keyhole"></i> <span>ปลดล็อกเข้าสู่ระบบหลังบ้าน</span>`;
    }
  }
}
window.submitAdminPin = submitAdminPin;

function initPinDigitInputs() {
  const digits = document.querySelectorAll('.pin-digit');
  digits.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val ? val[0] : '';
      if (e.target.value) {
        e.target.classList.add('filled');
        if (index < digits.length - 1) {
          digits[index + 1].focus();
        } else {
          if (getEnteredPin().length === 6) {
            setTimeout(submitAdminPin, 100);
          }
        }
      } else {
        e.target.classList.remove('filled');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        digits[index - 1].focus();
      } else if (e.key === 'Enter') {
        submitAdminPin();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      if (pasteData) {
        const chars = pasteData.slice(0, 6).split('');
        chars.forEach((c, i) => {
          if (digits[i]) {
            digits[i].value = c;
            digits[i].classList.add('filled');
          }
        });
        if (chars.length === 6) {
          setTimeout(submitAdminPin, 100);
        } else if (digits[chars.length]) {
          digits[chars.length].focus();
        }
      }
    });
  });
}
window.initPinDigitInputs = initPinDigitInputs;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPinDigitInputs);
} else {
  initPinDigitInputs();
}

// =========================================================
// 🤝 RESELLER BACKOFFICE MANAGEMENT CONTROLLER
// =========================================================
window.ADMIN_RESELLER_DATA = null;
window.RESELLER_PRICING_MAP = {};

async function fetchResellerPricing() {
  try {
    const res = await fetch('/api/reseller/pricing');
    if (res.ok) {
      const data = await res.json();
      window.RESELLER_PRICING_MAP = data.productPrices || {};
    }
  } catch (e) {
    // ignore
  }
}
window.fetchResellerPricing = fetchResellerPricing;

async function loadAdminResellersData() {
  const codesTbody = document.getElementById('adminResellerCodesTbody');
  const pricingTbody = document.getElementById('adminResellerPricingTbody');
  const membersTbody = document.getElementById('adminResellerMembersTbody');

  try {
    const res = await fetch('/api/admin/resellers', {
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'ไม่สามารถโหลดข้อมูลตัวแทนจำหน่ายได้', 'error');
      return;
    }

    window.ADMIN_RESELLER_DATA = data;
    window.RESELLER_PRICING_MAP = data.productPrices || {};

    // 1. Render Codes Table
    if (codesTbody) {
      const codes = data.codes || [];
      if (codes.length === 0) {
        codesTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">ยังไม่มีโค้ดตัวแทนจำหน่ายในระบบ</td></tr>`;
      } else {
        codesTbody.innerHTML = codes.map(c => `
          <tr>
            <td><strong style="color: #60a5fa; font-family: monospace; font-size: 0.95rem;">${c.code}</strong></td>
            <td><span class="badge badge-success" style="font-weight: 700;">ลด ${c.discountPercent || 15}%</span></td>
            <td>${c.usedCount || 0} / ${c.maxUses || 50} ครั้ง</td>
            <td style="color: #94a3b8; font-size: 0.85rem;">${c.note || '-'}</td>
            <td style="color: #94a3b8; font-size: 0.8rem;">${c.createdAt ? new Date(c.createdAt).toLocaleDateString('th-TH') : '-'}</td>
            <td style="text-align: right;">
              <button type="button" class="btn btn-danger btn-sm" onclick="deleteAdminResellerCode('${c.code}')" title="ลบโค้ดนี้">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // 2. Render Reseller Product Pricing Table (ตรงตาม Screenshot 100%)
    if (pricingTbody) {
      const products = window.STORE_PRODUCTS || window.ADMIN_PRODUCTS || [];
      const customPrices = data.productPrices || {};
      window.RESELLER_EXPANDED_PRODS = window.RESELLER_EXPANDED_PRODS || {};

      const countEl = document.getElementById('resellerProdCount');
      if (countEl) countEl.textContent = products.length;

      if (products.length === 0) {
        pricingTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 24px;">ไม่พบรายการสินค้า</td></tr>`;
      } else {
        const rowsHtml = [];
        products.forEach(p => {
          // Resolve package options (use variants if defined, or generate standard 3 packages: 1 วัน, 10 วัน, 30 วัน)
          let variants = [];
          if (Array.isArray(p.variants) && p.variants.length > 0) {
            variants = p.variants;
          } else {
            const baseP = parseFloat(p.price) || 25;
            variants = [
              { name: '1 วัน', price: baseP },
              { name: '10 วัน', price: Math.round(baseP * 6.36) || 159 },
              { name: '30 วัน', price: Math.round(baseP * 11.96) || 299 }
            ];
          }

          // Default state: if not explicitly false, default to true (expanded like in screenshot)
          const isOpen = window.RESELLER_EXPANDED_PRODS[p.id] !== false;

          // Main product row (ตรงตามแถวบนในภาพผู้ใช้)
          rowsHtml.push(`
            <tr class="reseller-parent-row" data-prod-id="${p.id}">
              <td style="width: 42%;">
                <div class="reseller-prod-col">
                  <button type="button" class="reseller-expand-btn" onclick="toggleResellerProduct('${p.id}')" title="${isOpen ? 'ย่อแพ็กเกจย่อย' : 'เปิดแพ็กเกจย่อย'}">
                    <i class="fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-chevron-right'}"></i>
                  </button>
                  <img src="${p.image || 'assets/cat_pc.webp'}" alt="${p.name}" class="reseller-prod-thumb" onerror="this.src='assets/cat_pc.webp'">
                  <div class="reseller-prod-info">
                    <span class="reseller-prod-name">${p.name}</span>
                    <span class="reseller-variant-badge-sub">${variants.length} ตัวเลือกแพ็กเกจ</span>
                  </div>
                </div>
              </td>
              <td style="width: 28%;">
                <span class="reseller-dim-text">(กรุณากดเปิดเพื่อตั้งราคาแพ็กเกจย่อย)</span>
              </td>
              <td style="width: 30%; text-align: right;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 14px;">
                  <span class="reseller-dim-text">(กรุณากดเปิดเพื่อตั้งราคาแพ็กเกจย่อย)</span>
                  <button type="button" class="reseller-pill-btn ${isOpen ? '' : 'closed-state'}" onclick="toggleResellerProduct('${p.id}')">${isOpen ? 'ปิด' : 'เปิด'}</button>
                </div>
              </td>
            </tr>
          `);

          // Variant subrows (ตรงตาม 3 แถวล่างในภาพผู้ใช้)
          variants.forEach(v => {
            const varKey = `${p.id}__${v.name}`;
            const customVarP = customPrices[varKey] !== undefined ? customPrices[varKey] : '';
            const safeVarName = v.name.replace(/"/g, '&quot;');
            const priceFormatted = '฿' + parseFloat(v.price || 0).toFixed(2);

            rowsHtml.push(`
              <tr class="reseller-variant-subrow reseller-subrow-${p.id}" style="${isOpen ? '' : 'display: none;'}">
                <td style="width: 42%;">
                  <span class="reseller-subvar-name">📦 ${v.name}</span>
                </td>
                <td style="width: 28%;">
                  <span class="reseller-normal-price">${priceFormatted}</span>
                </td>
                <td style="width: 30%; text-align: right;">
                  <input type="number" step="any" min="0" class="reseller-pill-input reseller-price-input" 
                    data-prod-id="${p.id}" 
                    data-variant-name="${safeVarName}" 
                    value="${customVarP}" 
                    placeholder="ราคาตัวแทน">
                </td>
              </tr>
            `);
          });
        });
        pricingTbody.innerHTML = rowsHtml.join('');
      }
    }

    // 3. Render Reseller Members Table
    if (membersTbody) {
      const members = data.members || [];
      if (members.length === 0) {
        membersTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">ยังไม่มีสมาชิกที่เป็นตัวแทนจำหน่าย</td></tr>`;
      } else {
        membersTbody.innerHTML = members.map(m => `
          <tr>
            <td>
              <strong style="color: #ffffff;">${m.username}</strong>
              <div style="font-size: 0.72rem; color: #64748b; font-family: monospace;">ID: ${m.id}</div>
            </td>
            <td>${m.email || 'ไม่มีอีเมล'}</td>
            <td><span class="badge badge-success">ลด ${m.resellerDiscount || 15}%</span></td>
            <td style="color: #60a5fa; font-weight: 700;">${formatBaht(m.balance || 0)}</td>
            <td style="color: #94a3b8; font-size: 0.8rem;">${m.resellerGrantedAt ? new Date(m.resellerGrantedAt).toLocaleDateString('th-TH') : '-'}</td>
            <td style="text-align: right;">
              <button type="button" class="btn btn-danger btn-sm" onclick="revokeAdminReseller('${m.id}', '${m.username}')" title="ยกเลิกสิทธิ์ตัวแทน">
                <i class="fa-solid fa-user-xmark"></i> ยกเลิก
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Failed to load admin reseller data:', err);
  }
}
window.loadAdminResellersData = loadAdminResellersData;

function generateRandomResellerCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const input = document.getElementById('adminNewResellerCode');
  if (input) input.value = `VIP-${rand}`;
}
window.generateRandomResellerCode = generateRandomResellerCode;

async function createAdminResellerCode() {
  const code = document.getElementById('adminNewResellerCode')?.value.trim().toUpperCase();
  const discountPercent = parseFloat(document.getElementById('adminNewResellerDiscount')?.value) || 20;
  const maxUses = parseInt(document.getElementById('adminNewResellerMaxUses')?.value, 10) || 50;
  const note = document.getElementById('adminNewResellerNote')?.value.trim() || '';

  if (!code) {
    showToast('กรุณากรอกรหัสโค้ดตัวแทนจำหน่าย', 'error');
    return;
  }

  try {
    const res = await fetch('/api/admin/resellers/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ code, discountPercent, maxUses, note })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`สร้างโค้ดตัวแทนจำหน่าย "${code}" สำเร็จ!`, 'success');
      document.getElementById('adminNewResellerCode').value = '';
      document.getElementById('adminNewResellerNote').value = '';
      loadAdminResellersData();
    } else {
      showToast(data.error || 'สร้างโค้ดไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.createAdminResellerCode = createAdminResellerCode;

async function deleteAdminResellerCode(code) {
  if (!confirm(`คุณต้องการลบโค้ดตัวแทน "${code}" ใช่หรือไม่?`)) return;

  try {
    const res = await fetch(`/api/admin/resellers/code/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`ลบโค้ด "${code}" สำเร็จ`, 'info');
      loadAdminResellersData();
    } else {
      showToast(data.error || 'ลบโค้ดไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.deleteAdminResellerCode = deleteAdminResellerCode;

async function saveAdminResellerPricing() {
  const inputs = document.querySelectorAll('.reseller-price-input');
  const productPrices = {};

  inputs.forEach(input => {
    const prodId = input.getAttribute('data-prod-id');
    const variantName = input.getAttribute('data-variant-name');
    const val = input.value.trim();
    if (prodId && val !== '') {
      const p = parseFloat(val);
      if (!isNaN(p) && p >= 0) {
        if (variantName) {
          productPrices[`${prodId}__${variantName}`] = p;
        } else {
          productPrices[prodId] = p;
        }
      }
    }
  });

  try {
    const res = await fetch('/api/admin/resellers/pricing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ productPrices })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกราคาสินค้าสำหรับตัวแทนจำหน่ายเรียบร้อยแล้ว!', 'success');
      window.RESELLER_PRICING_MAP = productPrices;
      if (typeof renderProductsGrid === 'function') renderProductsGrid();
    } else {
      showToast(data.error || 'บันทึกราคาไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.saveAdminResellerPricing = saveAdminResellerPricing;

function toggleResellerProduct(prodId) {
  window.RESELLER_EXPANDED_PRODS = window.RESELLER_EXPANDED_PRODS || {};
  const currentState = window.RESELLER_EXPANDED_PRODS[prodId] !== false;
  const newState = !currentState;
  window.RESELLER_EXPANDED_PRODS[prodId] = newState;

  const parentRow = document.querySelector(`.reseller-parent-row[data-prod-id="${prodId}"]`);
  const subRows = document.querySelectorAll(`.reseller-subrow-${prodId}`);
  if (parentRow) {
    const expandBtn = parentRow.querySelector('.reseller-expand-btn i');
    if (expandBtn) expandBtn.className = `fa-solid ${newState ? 'fa-chevron-down' : 'fa-chevron-right'}`;
    const pillBtn = parentRow.querySelector('.reseller-pill-btn');
    if (pillBtn) {
      pillBtn.textContent = newState ? 'ปิด' : 'เปิด';
      pillBtn.classList.toggle('closed-state', !newState);
    }
  }
  subRows.forEach(row => {
    row.style.display = newState ? '' : 'none';
  });
}
window.toggleResellerProduct = toggleResellerProduct;

function toggleAllResellerProducts(expand) {
  window.RESELLER_EXPANDED_PRODS = window.RESELLER_EXPANDED_PRODS || {};
  const products = window.STORE_PRODUCTS || window.ADMIN_PRODUCTS || [];

  let targetState = expand;
  if (typeof targetState !== 'boolean') {
    const firstState = products.length > 0 ? (window.RESELLER_EXPANDED_PRODS[products[0].id] !== false) : true;
    targetState = !firstState;
  }

  products.forEach(p => {
    window.RESELLER_EXPANDED_PRODS[p.id] = targetState;
  });

  document.querySelectorAll('.reseller-parent-row').forEach(parentRow => {
    const expandBtn = parentRow.querySelector('.reseller-expand-btn i');
    if (expandBtn) expandBtn.className = `fa-solid ${targetState ? 'fa-chevron-down' : 'fa-chevron-right'}`;
    const pillBtn = parentRow.querySelector('.reseller-pill-btn');
    if (pillBtn) {
      pillBtn.textContent = targetState ? 'ปิด' : 'เปิด';
      pillBtn.classList.toggle('closed-state', !targetState);
    }
  });

  document.querySelectorAll('.reseller-variant-subrow').forEach(row => {
    row.style.display = targetState ? '' : 'none';
  });

  showToast(targetState ? '📂 เปิดแสดงตัวเลือกแพ็กเกจทุกรายการแล้ว' : '📁 ย่อ/ปิดตัวเลือกแพ็กเกจทุกรายการแล้ว', 'info');
}
window.toggleAllResellerProducts = toggleAllResellerProducts;

// ==============================================================
// 🚀 LOADING ADDONS & ANIMATIONS CONTROLLER (ระบบหน้าโหลด)
// ==============================================================
window.LOADING_PREVIEW_TIMER = null;

function populateAdminLoadingInputs(loadingAddon) {
  const cfg = loadingAddon || (window.SITE_SETTINGS && window.SITE_SETTINGS.loadingAddon) || {
    enabled: true,
    style: 'cyber_pulse',
    title: 'DEKTHEP STORE',
    subtitle: 'กำลังโหลดระบบและข้อมูลความปลอดภัย 24 ชม...',
    logo: 'assets/real_logo.webp',
    bgImage: '',
    bgDim: 0.75,
    duration: 1.2,
    bgStyle: 'cyber_black',
    progressBar: true
  };

  const enabledInput = document.getElementById('cfg_loading_enabled');
  if (enabledInput) enabledInput.checked = cfg.enabled !== false;

  const styleInput = document.getElementById('cfg_loading_style');
  if (styleInput) styleInput.value = cfg.style || 'cyber_pulse';
  selectLoadingPreset(cfg.style || 'cyber_pulse', false);

  const titleInput = document.getElementById('cfg_loading_title');
  if (titleInput) titleInput.value = cfg.title || 'DEKTHEP STORE';

  const subInput = document.getElementById('cfg_loading_subtitle');
  if (subInput) subInput.value = cfg.subtitle || 'กำลังโหลดระบบและข้อมูลความปลอดภัย 24 ชม...';

  const logoInput = document.getElementById('cfg_loading_logo');
  if (logoInput) logoInput.value = cfg.logo || 'assets/real_logo.webp';

  const bgImageInput = document.getElementById('cfg_loading_bgImage');
  if (bgImageInput) bgImageInput.value = cfg.bgImage || '';

  const previewBgImg = document.getElementById('preview_loading_bgImage');
  if (previewBgImg) previewBgImg.src = cfg.bgImage || 'assets/banner.jpg';

  const bgDimInput = document.getElementById('cfg_loading_bgDim');
  const bgDimDisplay = document.getElementById('loadingBgDimDisplay');
  if (bgDimInput) {
    const dimVal = cfg.bgDim !== undefined ? parseFloat(cfg.bgDim) : 0.75;
    bgDimInput.value = dimVal;
    if (bgDimDisplay) bgDimDisplay.textContent = Math.round(dimVal * 100) + '%';
  }

  const durationInput = document.getElementById('cfg_loading_duration');
  const durationDisplay = document.getElementById('loadingDurationDisplay');
  if (durationInput) {
    const durVal = parseFloat(cfg.duration) || 1.2;
    durationInput.value = durVal;
    if (durationDisplay) durationDisplay.textContent = durVal.toFixed(1) + ' วินาที';
  }

  const bgInput = document.getElementById('cfg_loading_bgStyle');
  if (bgInput) bgInput.value = cfg.bgStyle || (cfg.bgImage ? 'custom_image' : 'cyber_black');

  const barInput = document.getElementById('cfg_loading_progressBar');
  if (barInput) barInput.checked = cfg.progressBar !== false;

  toggleLoadingBgImageUI();
}
window.populateAdminLoadingInputs = populateAdminLoadingInputs;

function toggleLoadingBgImageUI() {
  const bgStyle = document.getElementById('cfg_loading_bgStyle')?.value || 'cyber_black';
  const section = document.getElementById('loadingBgImageSection');
  if (!section) return;
  if (bgStyle === 'custom_image') {
    section.style.borderColor = 'rgba(37, 99, 235, 0.6)';
    section.style.boxShadow = '0 0 15px rgba(37, 99, 235, 0.15)';
  } else {
    section.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    section.style.boxShadow = 'none';
  }
}
window.toggleLoadingBgImageUI = toggleLoadingBgImageUI;

function useStoreBannerForLoadingBg() {
  const banner = (window.SITE_SETTINGS?.images?.heroBanner) || 'assets/banner.jpg';
  const bgInput = document.getElementById('cfg_loading_bgImage');
  const preview = document.getElementById('preview_loading_bgImage');
  const styleSelect = document.getElementById('cfg_loading_bgStyle');

  if (bgInput) bgInput.value = banner;
  if (preview) preview.src = banner;
  if (styleSelect) styleSelect.value = 'custom_image';
  toggleLoadingBgImageUI();
  showToast('ดึงภาพแบนเนอร์ของร้านมาตั้งเป็นพื้นหลังเรียบร้อยแล้ว!', 'success');
}
window.useStoreBannerForLoadingBg = useStoreBannerForLoadingBg;

function clearLoadingBgImage() {
  const bgInput = document.getElementById('cfg_loading_bgImage');
  const preview = document.getElementById('preview_loading_bgImage');
  const styleSelect = document.getElementById('cfg_loading_bgStyle');

  if (bgInput) bgInput.value = '';
  if (preview) preview.src = 'assets/banner.jpg';
  if (styleSelect) styleSelect.value = 'cyber_black';
  toggleLoadingBgImageUI();
  showToast('ลบรูปภาพพื้นหลังหน้าโหลดแล้ว (กลับไปใช้สีดำ Cyber Dark)', 'info');
}
window.clearLoadingBgImage = clearLoadingBgImage;

function selectLoadingPreset(presetName, markDirty = true) {
  const styleInput = document.getElementById('cfg_loading_style');
  if (styleInput) styleInput.value = presetName;

  document.querySelectorAll('.loading-preset-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-preset') === presetName);
  });
}
window.selectLoadingPreset = selectLoadingPreset;

function useCurrentStoreLogoForLoading() {
  const currentLogo = (window.SITE_SETTINGS && window.SITE_SETTINGS.images && window.SITE_SETTINGS.images.logo) || 'assets/real_logo.webp';
  const logoInput = document.getElementById('cfg_loading_logo');
  if (logoInput) {
    logoInput.value = currentLogo;
    showToast('ดึงโลโก้ปัจจุบันของร้านเรียบร้อยแล้ว', 'success');
  }
}
window.useCurrentStoreLogoForLoading = useCurrentStoreLogoForLoading;

async function saveAdminLoadingSettings() {
  const loadingAddon = {
    enabled: document.getElementById('cfg_loading_enabled')?.checked ?? true,
    style: document.getElementById('cfg_loading_style')?.value || 'cyber_pulse',
    title: document.getElementById('cfg_loading_title')?.value || 'DEKTHEP STORE',
    subtitle: document.getElementById('cfg_loading_subtitle')?.value || 'กำลังโหลดระบบและข้อมูลความปลอดภัย 24 ชม...',
    logo: document.getElementById('cfg_loading_logo')?.value || 'assets/real_logo.webp',
    bgImage: document.getElementById('cfg_loading_bgImage')?.value || '',
    bgDim: parseFloat(document.getElementById('cfg_loading_bgDim')?.value || '0.75'),
    duration: parseFloat(document.getElementById('cfg_loading_duration')?.value || '1.2'),
    bgStyle: document.getElementById('cfg_loading_bgStyle')?.value || 'cyber_black',
    progressBar: document.getElementById('cfg_loading_progressBar')?.checked ?? true
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ loadingAddon })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกการตั้งค่าหน้าโหลด (Loading Addons) เรียบร้อยแล้ว!', 'success');
      window.SITE_SETTINGS = window.SITE_SETTINGS || {};
      window.SITE_SETTINGS.loadingAddon = loadingAddon;
    } else {
      showToast(data.error || 'บันทึกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.saveAdminLoadingSettings = saveAdminLoadingSettings;

function previewLoadingScreenLive() {
  const screen = document.getElementById('siteLoadingScreen');
  if (!screen) return;

  const style = document.getElementById('cfg_loading_style')?.value || 'cyber_pulse';
  const title = document.getElementById('cfg_loading_title')?.value || 'DEKTHEP STORE';
  const subtitle = document.getElementById('cfg_loading_subtitle')?.value || 'กำลังโหลดระบบและข้อมูลความปลอดภัย 24 ชม...';
  const logo = document.getElementById('cfg_loading_logo')?.value || 'assets/real_logo.webp';
  const bgImage = document.getElementById('cfg_loading_bgImage')?.value || '';
  const bgDim = parseFloat(document.getElementById('cfg_loading_bgDim')?.value || '0.75');
  const duration = parseFloat(document.getElementById('cfg_loading_duration')?.value || '1.2');
  const bgStyle = document.getElementById('cfg_loading_bgStyle')?.value || 'cyber_black';
  const showProgressBar = document.getElementById('cfg_loading_progressBar')?.checked ?? true;

  // Apply preview styles
  screen.className = 'site-loading-screen ' + (bgStyle === 'glass_blur' ? 'bg-glass' : '') + ' style-' + style;
  
  const logoImg = document.getElementById('loadingLogoImg');
  if (logoImg) logoImg.src = logo;

  // Custom Wallpaper Handling
  const wallpaperEl = document.getElementById('loadingScreenWallpaper');
  if (wallpaperEl) {
    if (bgStyle === 'custom_image' || (bgStyle !== 'glass_blur' && bgImage)) {
      wallpaperEl.style.display = 'block';
      wallpaperEl.style.backgroundImage = `url("${bgImage || 'assets/banner.jpg'}")`;
      wallpaperEl.style.setProperty('--loading-bg-dim', bgDim);
    } else {
      wallpaperEl.style.display = 'none';
    }
  }

  const titleEl = document.getElementById('loadingTitleText');
  if (titleEl) titleEl.textContent = title;

  const subEl = document.getElementById('loadingSubtitleText');
  if (subEl) subEl.textContent = subtitle;

  const progressContainer = document.getElementById('loadingProgressContainer');
  const progressFill = document.getElementById('loadingProgressFill');
  const percentText = document.getElementById('loadingPercentText');

  if (progressContainer) {
    progressContainer.style.display = showProgressBar ? 'block' : 'none';
  }

  // Show close button for preview
  const closeBtn = document.getElementById('loadingPreviewCloseBtn');
  if (closeBtn) closeBtn.style.display = 'block';

  screen.style.display = 'flex';
  screen.classList.remove('fade-out');

  // Animate progress bar
  if (progressFill) progressFill.style.width = '0%';
  if (percentText) percentText.textContent = '0%';

  const startTime = Date.now();
  const totalMs = duration * 1000;

  if (window.LOADING_PREVIEW_TIMER) clearInterval(window.LOADING_PREVIEW_TIMER);
  window.LOADING_PREVIEW_TIMER = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
    if (progressFill) progressFill.style.width = pct + '%';
    if (percentText) percentText.textContent = pct + '%';

    if (pct >= 100) {
      clearInterval(window.LOADING_PREVIEW_TIMER);
      setTimeout(() => {
        closeLoadingScreenPreview();
      }, 400);
    }
  }, 30);
}
window.previewLoadingScreenLive = previewLoadingScreenLive;

function closeLoadingScreenPreview() {
  if (window.LOADING_PREVIEW_TIMER) clearInterval(window.LOADING_PREVIEW_TIMER);
  const screen = document.getElementById('siteLoadingScreen');
  if (screen) {
    screen.classList.add('fade-out');
    setTimeout(() => {
      screen.style.display = 'none';
      screen.classList.remove('fade-out');
      const wallpaperEl = document.getElementById('loadingScreenWallpaper');
      if (wallpaperEl) wallpaperEl.style.display = 'none';
      const closeBtn = document.getElementById('loadingPreviewCloseBtn');
      if (closeBtn) closeBtn.style.display = 'none';
    }, 500);
  }
}
window.closeLoadingScreenPreview = closeLoadingScreenPreview;

// Site Startup Preloader
window.SITE_PRELOADER_SHOWN = false;

function initSiteLoadingScreen(loadingAddon) {
  const cfg = loadingAddon || (window.SITE_SETTINGS && window.SITE_SETTINGS.loadingAddon);
  if (!cfg || cfg.enabled === false) {
    const screen = document.getElementById('siteLoadingScreen');
    if (screen) screen.style.display = 'none';
    return;
  }

  if (window.SITE_PRELOADER_SHOWN) return;
  window.SITE_PRELOADER_SHOWN = true;

  const screen = document.getElementById('siteLoadingScreen');
  if (!screen) return;

  const style = cfg.style || 'cyber_pulse';
  const title = cfg.title || 'DEKTHEP STORE';
  const subtitle = cfg.subtitle || 'กำลังโหลดระบบและข้อมูลความปลอดภัย 24 ชม...';
  const logo = cfg.logo || 'assets/real_logo.webp';
  const bgImage = cfg.bgImage || '';
  const bgDim = cfg.bgDim !== undefined ? parseFloat(cfg.bgDim) : 0.75;
  const duration = parseFloat(cfg.duration) || 1.2;
  const bgStyle = cfg.bgStyle || (bgImage ? 'custom_image' : 'cyber_black');
  const showProgressBar = cfg.progressBar !== false;

  screen.className = 'site-loading-screen ' + (bgStyle === 'glass_blur' ? 'bg-glass' : '') + ' style-' + style;

  const logoImg = document.getElementById('loadingLogoImg');
  if (logoImg) logoImg.src = logo;

  // Custom Wallpaper Handling
  const wallpaperEl = document.getElementById('loadingScreenWallpaper');
  if (wallpaperEl) {
    if (bgStyle === 'custom_image' || (bgStyle !== 'glass_blur' && bgImage)) {
      wallpaperEl.style.display = 'block';
      wallpaperEl.style.backgroundImage = `url("${bgImage || 'assets/banner.jpg'}")`;
      wallpaperEl.style.setProperty('--loading-bg-dim', bgDim);
    } else {
      wallpaperEl.style.display = 'none';
    }
  }

  const titleEl = document.getElementById('loadingTitleText');
  if (titleEl) titleEl.textContent = title;

  const subEl = document.getElementById('loadingSubtitleText');
  if (subEl) subEl.textContent = subtitle;

  const progressContainer = document.getElementById('loadingProgressContainer');
  const progressFill = document.getElementById('loadingProgressFill');
  const percentText = document.getElementById('loadingPercentText');

  if (progressContainer) {
    progressContainer.style.display = showProgressBar ? 'block' : 'none';
  }

  screen.style.display = 'flex';
  screen.classList.remove('fade-out');

  // Animate progress bar
  if (progressFill) progressFill.style.width = '0%';
  if (percentText) percentText.textContent = '0%';

  const startTime = Date.now();
  const totalMs = duration * 1000;

  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
    if (progressFill) progressFill.style.width = pct + '%';
    if (percentText) percentText.textContent = pct + '%';

    if (pct >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
          screen.style.display = 'none';
          screen.classList.remove('fade-out');
          if (wallpaperEl) wallpaperEl.style.display = 'none';
        }, 500);
      }, 300);
    }
  }, 25);
}
window.initSiteLoadingScreen = initSiteLoadingScreen;

// ==============================================================
// 🛍️ RECENT PURCHASES SPEED CONTROLLER
// ==============================================================
function updateRecentPurchasesSpeed(val) {
  const speed = parseInt(val, 10);
  if (isNaN(speed) || speed < 5) return;

  document.documentElement.style.setProperty('--marquee-speed', speed + 's');

  const marqueeTrack = document.getElementById('recentPurchasesMarquee');
  if (marqueeTrack) {
    marqueeTrack.style.animationDuration = speed + 's';
  }

  const slider = document.getElementById('cfg_recentPurchases_speed');
  if (slider) slider.value = speed;

  const display = document.getElementById('recentPurchasesSpeedDisplay');
  if (display) display.textContent = speed + ' วินาที';

  if (!window.SITE_SETTINGS) window.SITE_SETTINGS = {};
  if (!window.SITE_SETTINGS.recentPurchases) window.SITE_SETTINGS.recentPurchases = {};
  window.SITE_SETTINGS.recentPurchases.speed = speed;
}
window.updateRecentPurchasesSpeed = updateRecentPurchasesSpeed;

// ==============================================================
// 🔮 PARTICLE ADDONS CONTROLLER & ENGINE (ตรงตามภาพ 1, 2, 3)
// ==============================================================
window.PARTICLE_CURRENT_CONFIG = {
  status: 'active',
  style: 'silver_rain',
  density: 30,
  speed: 0.50,
  size: 1.05,
  color: 'white',
  customColor: '#ffffff'
};

function populateAdminParticleInputs(particleAddon) {
  const cfg = particleAddon || (window.SITE_SETTINGS && window.SITE_SETTINGS.particleAddon) || {
    status: 'active',
    style: 'silver_rain',
    density: 30,
    speed: 0.50,
    size: 1.05,
    color: 'white',
    customColor: '#ffffff'
  };

  window.PARTICLE_CURRENT_CONFIG = { ...cfg };

  const statusSelect = document.getElementById('cfg_particle_status');
  if (statusSelect) statusSelect.value = cfg.status || 'active';

  selectParticleStyle(cfg.style || 'silver_rain', false);

  const densityInput = document.getElementById('cfg_particle_density');
  if (densityInput) densityInput.value = cfg.density || 30;

  const speedInput = document.getElementById('cfg_particle_speed');
  const speedValText = document.getElementById('particleSpeedValText');
  if (speedInput) {
    const spd = parseFloat(cfg.speed) || 0.50;
    speedInput.value = spd;
    if (speedValText) speedValText.textContent = spd.toFixed(2) + 'x';
  }

  const sizeInput = document.getElementById('cfg_particle_size');
  const sizeValText = document.getElementById('particleSizeValText');
  if (sizeInput) {
    const sz = parseFloat(cfg.size) || 1.05;
    sizeInput.value = sz;
    if (sizeValText) sizeValText.textContent = sz.toFixed(2) + 'x';
  }

  selectParticleColor(cfg.color || 'white', false);

  const customColorInput = document.getElementById('cfg_particle_customColor');
  if (customColorInput && cfg.customColor) {
    customColorInput.value = cfg.customColor;
  }

  startParticleLivePreview();
}
window.populateAdminParticleInputs = populateAdminParticleInputs;

function selectParticleStyle(styleName, updateLive = true) {
  const styleInput = document.getElementById('cfg_particle_style');
  if (styleInput) styleInput.value = styleName;
  window.PARTICLE_CURRENT_CONFIG.style = styleName;

  document.querySelectorAll('.particle-style-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-style') === styleName);
  });

  if (updateLive) {
    startParticleLivePreview();
  }
}
window.selectParticleStyle = selectParticleStyle;

function onParticleSpeedInput(val) {
  const spd = parseFloat(val) || 1.0;
  window.PARTICLE_CURRENT_CONFIG.speed = spd;
  const speedValText = document.getElementById('particleSpeedValText');
  if (speedValText) speedValText.textContent = spd.toFixed(2) + 'x';
}
window.onParticleSpeedInput = onParticleSpeedInput;

function setParticleSpeedQuick(val) {
  const spd = parseFloat(val);
  const speedInput = document.getElementById('cfg_particle_speed');
  if (speedInput) speedInput.value = spd;
  onParticleSpeedInput(spd);
}
window.setParticleSpeedQuick = setParticleSpeedQuick;

function onParticleSizeInput(val) {
  const sz = parseFloat(val) || 1.0;
  window.PARTICLE_CURRENT_CONFIG.size = sz;
  const sizeValText = document.getElementById('particleSizeValText');
  if (sizeValText) sizeValText.textContent = sz.toFixed(2) + 'x';
}
window.onParticleSizeInput = onParticleSizeInput;

function setParticleSizeQuick(val) {
  const sz = parseFloat(val);
  const sizeInput = document.getElementById('cfg_particle_size');
  if (sizeInput) sizeInput.value = sz;
  onParticleSizeInput(sz);
}
window.setParticleSizeQuick = setParticleSizeQuick;

function selectParticleColor(colorKey, updateLive = true) {
  const colorInput = document.getElementById('cfg_particle_color');
  if (colorInput) colorInput.value = colorKey;
  window.PARTICLE_CURRENT_CONFIG.color = colorKey;

  document.querySelectorAll('.particle-swatch-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-color') === colorKey);
  });

  if (updateLive) {
    startParticleLivePreview();
  }
}
window.selectParticleColor = selectParticleColor;

function triggerParticleCustomColorPicker() {
  selectParticleColor('custom', false);
  const colorPicker = document.getElementById('cfg_particle_customColor');
  if (colorPicker) {
    colorPicker.click();
  }
}
window.triggerParticleCustomColorPicker = triggerParticleCustomColorPicker;

function onCustomColorPick(hexVal) {
  window.PARTICLE_CURRENT_CONFIG.customColor = hexVal;
  selectParticleColor('custom', true);
}
window.onCustomColorPick = onCustomColorPick;

function onParticleConfigChange() {
  const status = document.getElementById('cfg_particle_status')?.value || 'active';
  const density = parseInt(document.getElementById('cfg_particle_density')?.value || '30', 10);
  window.PARTICLE_CURRENT_CONFIG.status = status;
  window.PARTICLE_CURRENT_CONFIG.density = Math.max(5, Math.min(250, density));
  startParticleLivePreview();
}
window.onParticleConfigChange = onParticleConfigChange;

async function saveAdminParticleSettings() {
  const particleAddon = {
    status: document.getElementById('cfg_particle_status')?.value || 'active',
    style: document.getElementById('cfg_particle_style')?.value || 'silver_rain',
    density: parseInt(document.getElementById('cfg_particle_density')?.value || '30', 10),
    speed: parseFloat(document.getElementById('cfg_particle_speed')?.value || '0.50'),
    size: parseFloat(document.getElementById('cfg_particle_size')?.value || '1.05'),
    color: document.getElementById('cfg_particle_color')?.value || 'white',
    customColor: document.getElementById('cfg_particle_customColor')?.value || '#ffffff'
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ particleAddon })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกการตั้งค่าพาร์ติเคิลเรียบร้อยแล้ว!', 'success');
      window.SITE_SETTINGS = window.SITE_SETTINGS || {};
      window.SITE_SETTINGS.particleAddon = particleAddon;
      initSiteParticles(particleAddon);
    } else {
      showToast(data.error || 'บันทึกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.saveAdminParticleSettings = saveAdminParticleSettings;

// -------------------------------------------------------------
// PARTICLE ENGINE RENDERER (Dual Canvas: Live Preview & Full Site)
// -------------------------------------------------------------
function resolveParticleColorHex(colorKey, customColor) {
  const map = {
    theme: (window.SITE_SETTINGS && window.SITE_SETTINGS.theme && window.SITE_SETTINGS.theme.brandPrimary) || '#8b5cf6',
    white: '#ffffff',
    silver: '#cbd5e1',
    gold: '#f59e0b',
    pink: '#fb7185',
    green: '#10b981',
    cyan: '#06b6d4',
    purple: '#a855f7',
    orange: '#f97316',
    red: '#ef4444',
    custom: customColor || '#ffffff'
  };
  return map[colorKey] || '#ffffff';
}

function createParticleRenderer(canvas, getConfigFn, isPreview = false) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width = canvas.width;
  let height = canvas.height;
  let running = true;

  function resize() {
    if (isPreview) {
      width = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 280;
      height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 480;
    } else {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    initParticles();
  }

  function initParticles() {
    const cfg = getConfigFn();
    const count = Math.min(isPreview ? 40 : 120, cfg.density || 30);
    particles = [];

    const iconsMap = {
      xmas_2025: ['🎅', '🎁', '🧝', '❄️'],
      valentine_2026: ['💖', '💘', '💓', '💕'],
      halloween_2025: ['🕷️', '🦇', '🕸️'],
      cny_2026: ['🎆', '🧨', '☁️', '🧧'],
      cny_2025: ['🏮', '✨', '🧧'],
      xmas_2024: ['❄️', '🔔', '🎄', '⭐'],
      halloween_2024: ['🦇'],
      st_patrick: ['☘️', '🪙', '🍀'],
      hearts: ['❤️', '💖', '🤍']
    };

    for (let i = 0; i < count; i++) {
      const p = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        radius: Math.random() * 3 + 1.5,
        len: Math.random() * 18 + 10,
        alpha: Math.random() * 0.7 + 0.3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        tilt: Math.random() * Math.PI,
        tiltSpeed: Math.random() * 0.04 + 0.01,
        color: cfg.color === 'custom' ? cfg.customColor : cfg.color,
        icon: null
      };

      if (iconsMap[cfg.style]) {
        const arr = iconsMap[cfg.style];
        p.icon = arr[Math.floor(Math.random() * arr.length)];
      }

      if (cfg.style === 'confetti') {
        const confColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];
        p.confColor = confColors[Math.floor(Math.random() * confColors.length)];
        p.w = Math.random() * 8 + 6;
        p.h = Math.random() * 6 + 4;
      }

      particles.push(p);
    }
  }

  function frame() {
    if (!running) return;
    const cfg = getConfigFn();

    ctx.clearRect(0, 0, width, height);

    if (cfg.status === 'disabled' && !isPreview) {
      requestAnimationFrame(frame);
      return;
    }

    const baseColor = resolveParticleColorHex(cfg.color, cfg.customColor);
    const speed = cfg.speed || 1.0;
    const size = cfg.size || 1.0;

    // 1. Spider Web (Network Lines)
    if (cfg.style === 'spider_web') {
      ctx.fillStyle = baseColor;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = (isPreview ? 70 : 110) * size;

          if (dist < maxDist) {
            ctx.strokeStyle = baseColor;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    // 2. Silver Rain
    else if (cfg.style === 'silver_rain') {
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1.5 * size;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (p.vy * 4 + 4) * speed;
        if (p.y > height) {
          p.y = -p.len;
          p.x = Math.random() * width;
        }

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.len * size);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // 3. Snow
    else if (cfg.style === 'snow') {
      ctx.fillStyle = baseColor;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (p.vy * 1.2 + 0.8) * speed;
        p.x += Math.sin(p.tilt) * 0.8 * speed;
        p.tilt += p.tiltSpeed;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // 4. Sakura 3D
    else if (cfg.style === 'sakura_3d') {
      ctx.fillStyle = cfg.color === 'theme' ? baseColor : '#fbcfe8';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (p.vy * 1.5 + 1) * speed;
        p.x += Math.sin(p.tilt) * 1.2 * speed;
        p.tilt += p.tiltSpeed;
        p.rot += p.rotSpeed * speed;

        if (p.y > height) {
          p.y = -15;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(Math.sin(p.tilt), 1);
        ctx.beginPath();
        ctx.ellipse(0, 0, 7 * size, 4 * size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 5. Confetti
    else if (cfg.style === 'confetti') {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (p.vy * 2 + 1.5) * speed;
        p.x += Math.sin(p.tilt) * 0.8 * speed;
        p.rot += p.rotSpeed * speed * 2;
        p.tilt += p.tiltSpeed;

        if (p.y > height) {
          p.y = -15;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.confColor;
        ctx.fillRect(-p.w * size / 2, -p.h * size / 2, p.w * size, p.h * size);
        ctx.restore();
      }
    }

    // 6. Icons / Emojis (xmas, halloween, valentine, cny, st_patrick, hearts)
    else {
      const fontSize = Math.round(18 * size);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        if (cfg.style === 'hearts' || cfg.style === 'valentine_2026') {
          p.y -= (p.vy * 1.2 + 0.8) * speed;
          if (p.y < -30) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
        } else if (cfg.style === 'halloween_2024') {
          p.x -= (p.vy * 3 + 2) * speed;
          p.y += Math.sin(p.tilt) * 2 * speed;
          p.tilt += 0.08;
          if (p.x < -40) {
            p.x = width + 40;
            p.y = Math.random() * (height * 0.8);
          }
        } else {
          p.y += (p.vy * 1.5 + 1) * speed;
          p.x += Math.sin(p.tilt) * 0.8 * speed;
          p.tilt += p.tiltSpeed;
          if (p.y > height + 30) {
            p.y = -30;
            p.x = Math.random() * width;
          }
        }

        if (cfg.style === 'halloween_2025' && p.icon === '🕷️') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, 0);
          ctx.lineTo(p.x, p.y - 10);
          ctx.stroke();
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        p.rot += p.rotSpeed * speed;
        ctx.fillText(p.icon || '✨', 0, 0);
        ctx.restore();
      }
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);

  return {
    destroy: () => {
      running = false;
      window.removeEventListener('resize', resize);
    },
    refresh: () => {
      initParticles();
    }
  };
}

let livePreviewInstance = null;
let siteParticlesInstance = null;

function startParticleLivePreview() {
  const canvas = document.getElementById('particleLivePreviewCanvas');
  if (!canvas) return;

  if (livePreviewInstance) {
    livePreviewInstance.refresh();
    return;
  }

  livePreviewInstance = createParticleRenderer(canvas, () => window.PARTICLE_CURRENT_CONFIG, true);
}
window.startParticleLivePreview = startParticleLivePreview;

function initSiteParticles(particleAddon) {
  const cfg = particleAddon || (window.SITE_SETTINGS && window.SITE_SETTINGS.particleAddon);
  if (!cfg) return;

  const canvas = document.getElementById('siteParticlesCanvas');
  if (!canvas) return;

  if (siteParticlesInstance) {
    siteParticlesInstance.refresh();
    return;
  }

  siteParticlesInstance = createParticleRenderer(canvas, () => {
    return (window.SITE_SETTINGS && window.SITE_SETTINGS.particleAddon) || window.PARTICLE_CURRENT_CONFIG;
  }, false);
}
window.initSiteParticles = initSiteParticles;

async function revokeAdminReseller(userId, username) {
  if (!confirm(`คุณต้องการยกเลิกสิทธิ์ตัวแทนจำหน่ายของ "${username}" ใช่หรือไม่?`)) return;

  try {
    const res = await fetch('/api/admin/resellers/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`ยกเลิกสิทธิ์ตัวแทนของ "${username}" เรียบร้อยแล้ว`, 'info');
      loadAdminResellersData();
    } else {
      showToast(data.error || 'ยกเลิกสิทธิ์ไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.revokeAdminReseller = revokeAdminReseller;

// ==============================================================
// 🎵 BACKGROUND MUSIC CONTROLLER & YOUTUBE PLAYER (ระบบเพลงประกอบเว็บ)
// ==============================================================
window.BGM_PLAYER = null;
window.BGM_PLAYLIST = [];
window.BGM_CURRENT_INDEX = 0;
window.BGM_IS_MUTED = false;
window.BGM_USER_INTERACTED = false;
window.BGM_AUTO_FETCH_TIMER = null;

function populateAdminMusicInputs(backgroundMusic) {
  const bgm = backgroundMusic || (window.SITE_SETTINGS && window.SITE_SETTINGS.backgroundMusic) || {
    enabled: false,
    title: '',
    artist: '',
    youtubeUrls: '',
    volume: 30
  };

  const enabledInput = document.getElementById('cfg_music_enabled');
  if (enabledInput) enabledInput.checked = Boolean(bgm.enabled);

  const titleInput = document.getElementById('cfg_music_title');
  if (titleInput) titleInput.value = bgm.title || '';

  const artistInput = document.getElementById('cfg_music_artist');
  if (artistInput) artistInput.value = bgm.artist || '';

  const urlsInput = document.getElementById('cfg_music_youtubeUrls');
  if (urlsInput) urlsInput.value = bgm.youtubeUrls || '';

  const vol = (bgm.volume !== undefined) ? parseInt(bgm.volume, 10) : 30;
  const volInput = document.getElementById('cfg_music_volume');
  if (volInput) volInput.value = vol;

  updateMusicVolumeSlider(vol, false);
}
window.populateAdminMusicInputs = populateAdminMusicInputs;

function toggleMusicActive(isChecked) {
  if (isChecked) {
    showToast('🎵 เปิดใช้งานระบบเพลงประกอบเว็บไซต์แล้ว (อย่าลืมกดบันทึก)', 'info');
  } else {
    showToast('🔇 ปิดการเล่นเพลงประกอบเว็บไซต์แล้ว (อย่าลืมกดบันทึก)', 'info');
  }
}
window.toggleMusicActive = toggleMusicActive;

function updateMusicVolumeSlider(val, syncPlayer = true) {
  const num = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
  const numDisplay = document.getElementById('musicVolumeNumDisplay');
  if (numDisplay) numDisplay.textContent = num;

  const slider = document.getElementById('cfg_music_volume');
  if (slider) {
    slider.style.setProperty('--music-vol-percent', `${num}%`);
  }

  if (syncPlayer && window.BGM_PLAYER && typeof window.BGM_PLAYER.setVolume === 'function') {
    try {
      window.BGM_PLAYER.setVolume(num);
    } catch (e) {}
  }
}
window.updateMusicVolumeSlider = updateMusicVolumeSlider;

function extractYoutubeVideoId(urlOrId) {
  if (!urlOrId) return '';
  const str = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);
  return (match && match[1]) ? match[1] : '';
}
window.extractYoutubeVideoId = extractYoutubeVideoId;

function handleMusicUrlInput(val) {
  if (window.BGM_AUTO_FETCH_TIMER) clearTimeout(window.BGM_AUTO_FETCH_TIMER);

  window.BGM_AUTO_FETCH_TIMER = setTimeout(async () => {
    if (!val || !val.trim()) return;

    const firstLine = val.trim().split('\n')[0].trim();
    const vid = extractYoutubeVideoId(firstLine);
    if (!vid) return;

    try {
      const res = await fetch('/api/admin/fetch-youtube-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dekthep_admin_2026'
        },
        body: JSON.stringify({ urlOrId: vid })
      });
      const data = await res.json();
      if (res.ok && data.success && data.meta) {
        const titleInput = document.getElementById('cfg_music_title');
        const artistInput = document.getElementById('cfg_music_artist');

        if (titleInput && (!titleInput.value || titleInput.value.trim() === '')) {
          titleInput.value = data.meta.title || '';
        }
        if (artistInput && (!artistInput.value || artistInput.value.trim() === '')) {
          artistInput.value = data.meta.artist || '';
        }

        showToast(`🎶 ดึงข้อมูลเพลง "${data.meta.title}" จาก YouTube สำเร็จ!`, 'success');
      }
    } catch (err) {
      console.warn('Auto fetch youtube metadata failed:', err);
    }
  }, 600);
}
window.handleMusicUrlInput = handleMusicUrlInput;

async function saveAdminMusicSettings() {
  const enabled = document.getElementById('cfg_music_enabled')?.checked || false;
  const title = document.getElementById('cfg_music_title')?.value?.trim() || '';
  const artist = document.getElementById('cfg_music_artist')?.value?.trim() || '';
  const youtubeUrls = document.getElementById('cfg_music_youtubeUrls')?.value?.trim() || '';
  const volume = parseInt(document.getElementById('cfg_music_volume')?.value, 10) || 30;

  const backgroundMusic = {
    enabled,
    title,
    artist,
    youtubeUrls,
    volume
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ backgroundMusic })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (!window.SITE_SETTINGS) window.SITE_SETTINGS = {};
      window.SITE_SETTINGS.backgroundMusic = backgroundMusic;
      initBackgroundMusicPlayer(backgroundMusic, enabled);
      showToast('🎉 บันทึกการตั้งค่าเพลงประกอบเว็บไซต์เรียบร้อยแล้ว!', 'success');
    } else {
      showToast(data.error || 'บันทึกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่าเพลง', 'error');
  }
}
window.saveAdminMusicSettings = saveAdminMusicSettings;

function testPlayAdminMusic() {
  const urls = document.getElementById('cfg_music_youtubeUrls')?.value?.trim() || '';
  if (!urls) {
    showToast('กรุณากรอกลิงก์ YouTube ก่อนกดทดสอบ', 'error');
    return;
  }
  const lines = urls.split('\n').map(s => s.trim()).filter(Boolean);
  const vid = extractYoutubeVideoId(lines[0]);
  if (!vid) {
    showToast('ไม่พบ YouTube Video ID ที่ถูกต้อง', 'error');
    return;
  }

  const vol = parseInt(document.getElementById('cfg_music_volume')?.value, 10) || 30;
  const title = document.getElementById('cfg_music_title')?.value?.trim() || 'เพลงทดสอบ';
  const artist = document.getElementById('cfg_music_artist')?.value?.trim() || 'YouTube Audio';

  initBackgroundMusicPlayer({
    enabled: true,
    title,
    artist,
    youtubeUrls: urls,
    volume: vol
  }, true);

  showToast('▶️ กำลังเริ่มทดสอบเล่นเพลง...', 'info');
}
window.testPlayAdminMusic = testPlayAdminMusic;

// Floating Widget & YouTube Player Engine
function initBackgroundMusicPlayer(bgmConfig, forcePlay = false) {
  const cfg = bgmConfig || (window.SITE_SETTINGS && window.SITE_SETTINGS.backgroundMusic);
  const widget = document.getElementById('siteMusicWidget');

  if (!cfg || cfg.enabled === false) {
    if (widget) widget.style.display = 'none';
    if (window.BGM_PLAYER && typeof window.BGM_PLAYER.pauseVideo === 'function') {
      try { window.BGM_PLAYER.pauseVideo(); } catch (e) {}
    }
    updateMusicWidgetUI(false);
    return;
  }

  const lines = (cfg.youtubeUrls || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length === 0) {
    if (widget) widget.style.display = 'none';
    return;
  }

  window.BGM_PLAYLIST = lines.map(line => extractYoutubeVideoId(line)).filter(Boolean);
  if (window.BGM_PLAYLIST.length === 0) {
    if (widget) widget.style.display = 'none';
    return;
  }

  // Show floating music widget
  if (widget) widget.style.display = 'flex';

  // Update track title & artist
  const titleEl = document.getElementById('musicWidgetTitle');
  const artistEl = document.getElementById('musicWidgetArtist');
  if (titleEl) titleEl.textContent = cfg.title || 'เพลงประกอบเว็บไซต์';
  if (artistEl) artistEl.textContent = cfg.artist || 'DEKTHEP STORE';

  const firstVid = window.BGM_PLAYLIST[window.BGM_CURRENT_INDEX % window.BGM_PLAYLIST.length];

  function setupOrLoadPlayer() {
    if (!window.YT || !window.YT.Player) {
      setTimeout(setupOrLoadPlayer, 300);
      return;
    }

    if (!window.BGM_PLAYER) {
      window.BGM_PLAYER = new YT.Player('ytBgmPlayer', {
        height: '1',
        width: '1',
        videoId: firstVid,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: (event) => {
            const vol = cfg.volume !== undefined ? cfg.volume : 30;
            event.target.setVolume(vol);
            event.target.playVideo();
            updateMusicWidgetUI(true);

            // Unlock autoplay on first user interaction if blocked by browser
            if (!window.BGM_USER_INTERACTED) {
              const unlockAutoplay = () => {
                window.BGM_USER_INTERACTED = true;
                if (window.BGM_PLAYER && typeof window.BGM_PLAYER.playVideo === 'function') {
                  const state = window.BGM_PLAYER.getPlayerState();
                  if (state !== YT.PlayerState.PLAYING) {
                    window.BGM_PLAYER.playVideo();
                  }
                }
                window.removeEventListener('click', unlockAutoplay);
                window.removeEventListener('keydown', unlockAutoplay);
                window.removeEventListener('touchstart', unlockAutoplay);
              };
              window.addEventListener('click', unlockAutoplay, { once: true });
              window.addEventListener('keydown', unlockAutoplay, { once: true });
              window.addEventListener('touchstart', unlockAutoplay, { once: true });
            }
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              updateMusicWidgetUI(true);
            } else if (event.data === YT.PlayerState.PAUSED) {
              updateMusicWidgetUI(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              playNextMusicTrack();
            }
          },
          onError: (err) => {
            console.warn('YouTube BGM Player error:', err);
            playNextMusicTrack();
          }
        }
      });
    } else {
      try {
        const curVol = cfg.volume !== undefined ? cfg.volume : 30;
        window.BGM_PLAYER.setVolume(curVol);
        if (forcePlay) {
          window.BGM_PLAYER.loadVideoById(firstVid);
          window.BGM_PLAYER.playVideo();
          updateMusicWidgetUI(true);
        }
      } catch (e) {}
    }
  }

  setupOrLoadPlayer();
}
window.initBackgroundMusicPlayer = initBackgroundMusicPlayer;

function updateMusicWidgetUI(isPlaying) {
  const widget = document.getElementById('siteMusicWidget');
  const circleIcon = document.getElementById('musicCircleIcon');
  const testIcon = document.getElementById('testPlayMusicIcon');

  if (widget) {
    widget.classList.toggle('playing', Boolean(isPlaying));
    widget.classList.toggle('paused', !isPlaying);
    widget.title = isPlaying 
      ? 'กำลังเล่นเพลง (คลิกที่วงกลมเพื่อปิดเพลง)' 
      : 'เพลงปิดอยู่ (คลิกที่วงกลมเพื่อเปิดเพลง)';
  }
  if (circleIcon) {
    circleIcon.className = isPlaying ? 'fa-solid fa-music' : 'fa-solid fa-volume-xmark';
  }
  if (testIcon) {
    testIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }
}

function toggleBackgroundMusic() {
  if (!window.BGM_PLAYER || typeof window.BGM_PLAYER.getPlayerState !== 'function') {
    initBackgroundMusicPlayer(window.SITE_SETTINGS && window.SITE_SETTINGS.backgroundMusic, true);
    return;
  }

  try {
    const state = window.BGM_PLAYER.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      window.BGM_PLAYER.pauseVideo();
      updateMusicWidgetUI(false);
      showToast('🔇 ปิดเพลงแล้ว (คลิกที่วงกลมเพื่อเปิดเพลง)', 'info');
    } else {
      window.BGM_PLAYER.playVideo();
      updateMusicWidgetUI(true);
      showToast('🎵 กำลังเปิดเพลงประกอบเว็บไซต์', 'info');
    }
  } catch (err) {
    console.warn('Error toggling BGM:', err);
  }
}
window.toggleBackgroundMusic = toggleBackgroundMusic;

function playNextMusicTrack() {
  if (!window.BGM_PLAYLIST || window.BGM_PLAYLIST.length === 0) return;
  window.BGM_CURRENT_INDEX = (window.BGM_CURRENT_INDEX + 1) % window.BGM_PLAYLIST.length;
  const nextVid = window.BGM_PLAYLIST[window.BGM_CURRENT_INDEX];

  if (window.BGM_PLAYER && typeof window.BGM_PLAYER.loadVideoById === 'function') {
    try {
      window.BGM_PLAYER.loadVideoById(nextVid);
      window.BGM_PLAYER.playVideo();
      updateMusicWidgetUI(true);
      showToast('⏭️ เล่นเพลงถัดไปแล้ว', 'info');
    } catch (e) {}
  }
}
window.playNextMusicTrack = playNextMusicTrack;

function toggleMusicMute() {
  if (!window.BGM_PLAYER || typeof window.BGM_PLAYER.isMuted !== 'function') return;

  try {
    const volIcon = document.getElementById('musicWidgetVolIcon');
    if (window.BGM_PLAYER.isMuted()) {
      window.BGM_PLAYER.unMute();
      if (volIcon) volIcon.className = 'fa-solid fa-volume-high';
      showToast('🔊 เปิดเสียงเพลงแล้ว', 'info');
    } else {
      window.BGM_PLAYER.mute();
      if (volIcon) volIcon.className = 'fa-solid fa-volume-xmark';
      showToast('🔇 ปิดเสียงเพลงแล้ว', 'info');
    }
  } catch (e) {}
}
window.toggleMusicMute = toggleMusicMute;

// Global YouTube IFrame API Callback
window.onYouTubeIframeAPIReady = function() {
  if (window.SITE_SETTINGS && window.SITE_SETTINGS.backgroundMusic) {
    initBackgroundMusicPlayer(window.SITE_SETTINGS.backgroundMusic);
  }
};

// 3. Theme Presets and Live Color Pickers
function applyColorPreset(presetKey) {
  const preset = THEME_PRESETS[presetKey];
  if (!preset) return;

  document.querySelectorAll('.clean-preset-card, .preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-preset') === presetKey);
  });

  const colorMap = {
    cfg_brandPrimary: preset.brandPrimary,
    cfg_brandHover: preset.brandHover,
    cfg_brandAccent: preset.brandAccent,
    cfg_bgBody: preset.bgBody,
    cfg_bgCard: preset.bgCard,
    cfg_bgCardHover: preset.bgCardHover,
    cfg_borderCardHover: preset.borderCardHover,
    cfg_textPrimary: preset.textPrimary,
    cfg_textSecondary: preset.textSecondary,
    cfg_btnPrimaryText: preset.btnPrimaryText
  };

  Object.keys(colorMap).forEach(id => {
    const val = colorMap[id];
    const colInput = document.getElementById(id);
    const txtInput = document.getElementById(id + '_text');
    if (colInput) colInput.value = val;
    if (txtInput) txtInput.value = val;
  });

  // Apply immediately to CSS variables so user sees it live
  applyThemeToDOM(preset);
  showToast(`นำเข้าชุดสี ${presetKey.replace('_', ' ').toUpperCase()} สำเร็จ!`, 'info');
}
window.applyColorPreset = applyColorPreset;

// Two-way sync: Color picker -> Text input & Live CSS variables
function syncColorInput(inputEl, textInputId) {
  const textInput = document.getElementById(textInputId);
  if (textInput) textInput.value = inputEl.value;
  applyCurrentPickersLive();
}
window.syncColorInput = syncColorInput;

// Two-way sync: Text input -> Color picker & Live CSS variables
function syncColorText(textEl, colorInputId) {
  const val = textEl.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    const colInput = document.getElementById(colorInputId);
    if (colInput) colInput.value = val;
    applyCurrentPickersLive();
  }
}
window.syncColorText = syncColorText;

function applyCurrentPickersLive() {
  const theme = {
    brandPrimary: document.getElementById('cfg_brandPrimary')?.value,
    brandHover: document.getElementById('cfg_brandHover')?.value,
    brandAccent: document.getElementById('cfg_brandAccent')?.value,
    bgBody: document.getElementById('cfg_bgBody')?.value,
    bgCard: document.getElementById('cfg_bgCard')?.value,
    bgCardHover: document.getElementById('cfg_bgCardHover')?.value,
    borderCardHover: document.getElementById('cfg_borderCardHover')?.value,
    textPrimary: document.getElementById('cfg_textPrimary')?.value,
    textSecondary: document.getElementById('cfg_textSecondary')?.value,
    btnPrimaryText: document.getElementById('cfg_btnPrimaryText')?.value
  };
  applyThemeToDOM(theme);
}

// 4. Live Image Preview & File Uploads
function updateLiveImgPreview(previewId, url) {
  const img = document.getElementById(previewId);
  if (img && url) img.src = url;
}
window.updateLiveImgPreview = updateLiveImgPreview;

async function handleAdminFileUpload(fileInput, textInputId, previewImgId, type) {
  if (!fileInput.files || !fileInput.files[0]) return;
  const file = fileInput.files[0];

  const reader = new FileReader();
  reader.onload = async (e) => {
    const fileData = e.target.result;
    try {
      showToast('กำลังอัปโหลดรูปภาพ...', 'info');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dekthep_admin_2026'
        },
        body: JSON.stringify({
          fileData,
          fileName: file.name,
          type
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const textInput = document.getElementById(textInputId);
        const previewImg = document.getElementById(previewImgId);
        if (textInput) textInput.value = data.url;
        if (previewImg) previewImg.src = data.url;
        showToast('อัปโหลดรูปภาพสำเร็จ!', 'success');
      } else {
        showToast(data.error || 'อัปโหลดรูปไม่สำเร็จ', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'error');
    }
  };
  reader.readAsDataURL(file);
}
window.handleAdminFileUpload = handleAdminFileUpload;

// 5. Saving Admin Settings
async function saveAdminThemeColors() {
  const theme = {
    brandPrimary: document.getElementById('cfg_brandPrimary')?.value || '#070ee4',
    brandHover: document.getElementById('cfg_brandHover')?.value || '#1e26ff',
    brandAccent: document.getElementById('cfg_brandAccent')?.value || '#3b82f6',
    bgBody: document.getElementById('cfg_bgBody')?.value || '#05070f',
    bgCard: document.getElementById('cfg_bgCard')?.value || '#0b0e1a',
    bgCardHover: document.getElementById('cfg_bgCardHover')?.value || '#11162a',
    borderCardHover: document.getElementById('cfg_borderCardHover')?.value || '#070ee4',
    textPrimary: document.getElementById('cfg_textPrimary')?.value || '#ffffff',
    textSecondary: document.getElementById('cfg_textSecondary')?.value || '#94a3b8',
    btnPrimaryText: document.getElementById('cfg_btnPrimaryText')?.value || '#ffffff'
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ theme })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกโทนสีและชุดธีมสำเร็จ!', 'success');
      applyThemeToDOM(theme);
    } else {
      showToast(data.error || 'บันทึกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
  }
}
window.saveAdminThemeColors = saveAdminThemeColors;

async function saveAdminImages() {
  const images = {
    logo: document.getElementById('cfg_img_logo')?.value || '',
    heroBanner: document.getElementById('cfg_img_heroBanner')?.value || '',
    storeBanner: document.getElementById('cfg_img_storeBanner')?.value || '',
    siteWallpaper: document.getElementById('cfg_img_siteWallpaper')?.value || ''
  };

  const categories = {
    pc: { banner: document.getElementById('cfg_img_cat_pc')?.value || '' },
    ios: { banner: document.getElementById('cfg_img_cat_ios')?.value || '' },
    xreg: { banner: document.getElementById('cfg_img_cat_xreg')?.value || '' },
    ad: { banner: document.getElementById('cfg_img_cat_ad')?.value || '' }
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ images, categories })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกรูปภาพทั้งหมดเรียบร้อยแล้ว!', 'success');
      applyImagesToDOM(images, categories);
      window.SITE_SETTINGS = window.SITE_SETTINGS || {};
      window.SITE_SETTINGS.images = images;
      window.SITE_SETTINGS.categories = categories;
    } else {
      showToast(data.error || 'บันทึกรูปภาพไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการบันทึกรูปภาพ', 'error');
  }
}
window.saveAdminImages = saveAdminImages;

function clearSiteWallpaper() {
  const input = document.getElementById('cfg_img_siteWallpaper');
  const preview = document.getElementById('preview_img_siteWallpaper');
  const bgWallEl = document.getElementById('siteBackgroundWallpaper');
  if (input) input.value = '';
  if (preview) preview.src = 'assets/banner.jpg';
  if (bgWallEl) bgWallEl.style.display = 'none';
  document.body.style.backgroundImage = 'none';
  showToast('ลบภาพพื้นหลังเว็บไซต์แล้ว (กลับไปใช้สีพื้นหลังปกติ)', 'info');
}
window.clearSiteWallpaper = clearSiteWallpaper;

async function saveAdminGeneralSettings() {
  const general = {
    storeName: document.getElementById('cfg_storeName')?.value || 'DEKTHEP STORE',
    siteTitle: document.getElementById('cfg_siteTitle')?.value || 'DEKTHEP STORE',
    discordUrl: document.getElementById('cfg_discordUrl')?.value || '',
    youtubeUrl: document.getElementById('cfg_youtubeUrl')?.value || '',
    footerText: document.getElementById('cfg_footerText')?.value || ''
  };

  const statsUsers = document.getElementById('cfg_statsUsers')?.value?.trim() || '3,552';
  const statsProducts = document.getElementById('cfg_statsProducts')?.value?.trim() || '41';
  const statsStock = document.getElementById('cfg_statsStock')?.value?.trim() || '587';
  const statsSold = document.getElementById('cfg_statsSold')?.value?.trim() || '24,603';

  const hero = {
    badgeText: document.getElementById('cfg_badgeText')?.value || 'EXTERNAL CHEAT NO.1',
    titlePrefix: document.getElementById('cfg_titlePrefix')?.value || 'ยินดีต้อนรับสู่ร้าน',
    titleGradient: document.getElementById('cfg_titleGradient')?.value || 'DEKTHEP STORE',
    subtitleHighlight: document.getElementById('cfg_subtitleHighlight')?.value || '',
    subtitle: document.getElementById('cfg_subtitle')?.value || '',
    announcementText: document.getElementById('cfg_announcementText')?.value || '',
    statsUsers,
    statsProducts,
    statsStock,
    statsSold
  };

  const features = {
    stats: {
      users: statsUsers,
      products: statsProducts,
      stock: statsStock,
      sold: statsSold
    }
  };

  const recentPurchases = {
    speed: parseInt(document.getElementById('cfg_recentPurchases_speed')?.value || '30', 10)
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ general, hero, features, recentPurchases })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกข้อมูลและข้อความเว็บไซต์สำเร็จ!', 'success');
      if (!window.SITE_SETTINGS) window.SITE_SETTINGS = {};
      window.SITE_SETTINGS.general = general;
      window.SITE_SETTINGS.hero = hero;
      window.SITE_SETTINGS.features = features;
      window.SITE_SETTINGS.recentPurchases = recentPurchases;
      applyGeneralToDOM({ general, hero, features });
      updateRecentPurchasesSpeed(recentPurchases.speed);
    } else {
      showToast(data.error || 'บันทึกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
  }
}
window.saveAdminGeneralSettings = saveAdminGeneralSettings;

// =========================================================================
// 💳 PAYMENT CHANNELS BACKOFFICE CONTROLLER (จัดการช่องทางเติมเงินหลังบ้าน)
// =========================================================================

const BANK_PRESETS = {
  GSB: { name: 'ธนาคารออมสิน (GSB)', shortName: 'ออมสิน', logo: 'assets/banks/gsb.png', color: '#eb198d' },
  KBANK: { name: 'ธนาคารกสิกรไทย (KBANK)', shortName: 'กสิกรไทย', logo: 'assets/banks/kbank.png', color: '#138f2d' },
  SCB: { name: 'ธนาคารไทยพาณิชย์ (SCB)', shortName: 'ไทยพาณิชย์', logo: 'assets/banks/scb.png', color: '#4e2e7f' },
  KTB: { name: 'ธนาคารกรุงไทย (KTB)', shortName: 'กรุงไทย', logo: 'assets/banks/ktb.png', color: '#00a8e8' },
  BBL: { name: 'ธนาคารกรุงเทพ (BBL)', shortName: 'กรุงเทพ', logo: 'assets/banks/bbl.png', color: '#1e3a8a' },
  BAY: { name: 'ธนาคารกรุงศรีอยุธยา (BAY)', shortName: 'กรุงศรี', logo: 'assets/banks/bay.png', color: '#fec20c' },
  TTB: { name: 'ธนาคารทหารไทยธนชาต (TTB)', shortName: 'ทีทีบี', logo: 'assets/banks/ttb.png', color: '#002d63' },
  PROMPTPAY: { name: 'พร้อมเพย์ (PromptPay)', shortName: 'พร้อมเพย์', logo: 'assets/banks/promptpay.png', color: '#003b70' }
};

function renderAdminBankPresetGrid(activeCode = 'GSB') {
  const grid = document.getElementById('adminBankPresetGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(BANK_PRESETS).map(([code, b]) => {
    const isActive = code === activeCode;
    return `
      <div class="admin-bank-preset-card ${isActive ? 'active' : ''}" onclick="selectBankPreset('${code}')" title="${b.name}">
        <img src="${b.logo}" alt="${b.name}" onerror="this.src='assets/banks/promptpay.png'">
        <div class="preset-name">${b.shortName}</div>
      </div>
    `;
  }).join('');
}
window.renderAdminBankPresetGrid = renderAdminBankPresetGrid;

function selectBankPreset(code) {
  const p = BANK_PRESETS[code];
  if (!p) return;
  const selInput = document.getElementById('cfg_pay_bank_preset_select');
  if (selInput) selInput.value = code;
  const logoInput = document.getElementById('cfg_pay_bank_logo');
  if (logoInput) logoInput.value = p.logo;
  const nameInput = document.getElementById('cfg_pay_bank_name');
  if (nameInput) nameInput.value = p.name;
  renderAdminBankPresetGrid(code);
}
window.selectBankPreset = selectBankPreset;

function handleBankPresetSelect(presetKey) {
  selectBankPreset(presetKey);
}
window.handleBankPresetSelect = handleBankPresetSelect;

function toggleChannelAdminUI(channelKey, isEnabled) {
  const badge = document.getElementById(`badge_status_${channelKey}`);
  if (badge) {
    if (isEnabled) {
      badge.className = 'toggle-status-badge status-open';
      badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>เปิดใช้งาน</span>';
    } else {
      badge.className = 'toggle-status-badge status-closed';
      badge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span>ปิดใช้งาน</span>';
    }
  }
}
window.toggleChannelAdminUI = toggleChannelAdminUI;

function populateAdminPaymentsInputs(payments) {
  if (!payments) return;

  // 1. Bank
  if (payments.bank) {
    const b = payments.bank;
    const isEnabled = b.enabled !== false;
    const chk = document.getElementById('cfg_pay_bank_enabled');
    if (chk) chk.checked = isEnabled;
    toggleChannelAdminUI('bank', isEnabled);

    const activeBankCode = b.bankCode || 'GSB';
    const selPreset = document.getElementById('cfg_pay_bank_preset_select');
    if (selPreset) selPreset.value = activeBankCode;

    const logoInput = document.getElementById('cfg_pay_bank_logo');
    if (logoInput) logoInput.value = b.bankLogo || BANK_PRESETS[activeBankCode]?.logo || 'assets/banks/gsb.png';

    renderAdminBankPresetGrid(activeBankCode);

    setVal('cfg_pay_bank_name', b.bankName || 'ธนาคารออมสิน (GSB)');
    setVal('cfg_pay_bank_accNo', b.accountNo || b.accountNumber || '020463192979');
    setVal('cfg_pay_bank_accName', b.accountName || 'ด.ช. ไออ้อน ขันธพาลี');
    setVal('cfg_pay_bank_promptpayNo', b.promptpayNo || b.promptPay || '');
    setVal('cfg_pay_bank_note', b.note || b.instructions || '');
  }

  // 2. TrueMoney
  if (payments.truemoney) {
    const tm = payments.truemoney;
    const isEnabled = tm.enabled !== false;
    const chk = document.getElementById('cfg_pay_truemoney_enabled');
    if (chk) chk.checked = isEnabled;
    toggleChannelAdminUI('truemoney', isEnabled);

    setVal('cfg_pay_truemoney_phone', tm.phone || '0822847225');
    setVal('cfg_pay_truemoney_feePercent', (tm.feePercent !== undefined) ? tm.feePercent : 2.9);
    setVal('cfg_pay_truemoney_minAmount', tm.minAmount || 10);
    setVal('cfg_pay_truemoney_note', tm.note || tm.instructions || '');
  }

  // 3. Coupon
  if (payments.coupon) {
    const cp = payments.coupon;
    const isEnabled = cp.enabled !== false;
    const chk = document.getElementById('cfg_pay_coupon_enabled');
    if (chk) chk.checked = isEnabled;
    toggleChannelAdminUI('coupon', isEnabled);

    setVal('cfg_pay_coupon_note', cp.note || cp.instructions || '');
  }
}
window.populateAdminPaymentsInputs = populateAdminPaymentsInputs;

async function saveAdminPayments() {
  const bankCode = document.getElementById('cfg_pay_bank_preset_select')?.value || 'GSB';
  const payments = {
    bank: {
      enabled: document.getElementById('cfg_pay_bank_enabled')?.checked ?? true,
      bankCode: bankCode,
      bankLogo: document.getElementById('cfg_pay_bank_logo')?.value || (BANK_PRESETS[bankCode]?.logo) || 'assets/banks/gsb.svg',
      bankName: document.getElementById('cfg_pay_bank_name')?.value?.trim() || 'ธนาคารออมสิน (GSB)',
      accountNo: document.getElementById('cfg_pay_bank_accNo')?.value?.trim() || '020463192979',
      accountName: document.getElementById('cfg_pay_bank_accName')?.value?.trim() || 'ด.ช. ไออ้อน ขันธพาลี',
      promptpayNo: document.getElementById('cfg_pay_bank_promptpayNo')?.value?.trim() || '',
      note: document.getElementById('cfg_pay_bank_note')?.value?.trim() || ''
    },
    truemoney: {
      enabled: document.getElementById('cfg_pay_truemoney_enabled')?.checked ?? true,
      phone: document.getElementById('cfg_pay_truemoney_phone')?.value?.trim() || '0822847225',
      feePercent: parseFloat(document.getElementById('cfg_pay_truemoney_feePercent')?.value || '2.9') || 0,
      minAmount: parseFloat(document.getElementById('cfg_pay_truemoney_minAmount')?.value || '10') || 10,
      note: document.getElementById('cfg_pay_truemoney_note')?.value?.trim() || ''
    },
    coupon: {
      enabled: document.getElementById('cfg_pay_coupon_enabled')?.checked ?? true,
      note: document.getElementById('cfg_pay_coupon_note')?.value?.trim() || ''
    }
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ payments })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (!window.SITE_SETTINGS) window.SITE_SETTINGS = {};
      window.SITE_SETTINGS.payments = payments;
      applyPaymentsToDOM(payments);
      showToast('บันทึกการตั้งค่าช่องทางเติมเงินสำเร็จ!', 'success');
      return true;
    } else {
      showToast(data.error || 'บันทึกช่องทางเติมเงินไม่สำเร็จ', 'error');
      return false;
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการบันทึกช่องทางเติมเงิน', 'error');
    return false;
  }
}
window.saveAdminPayments = saveAdminPayments;

async function saveAllAdminSettings() {
  await saveAdminThemeColors();
  await saveAdminImages();
  await saveAdminPayments();
  await saveAdminGeneralSettings();
  showToast('🎉 บันทึกการตั้งค่าทั้งหมดสมบูรณ์ 100%!', 'success');
}
window.saveAllAdminSettings = saveAllAdminSettings;

async function resetAllSettingsToDefault() {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตการตั้งค่าและสีทั้งหมดกลับเป็นค่าเริ่มต้น?')) {
    return;
  }
  try {
    const res = await fetch('/api/admin/reset-settings', {
      method: 'POST',
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('รีเซ็ตการตั้งค่าเรียบร้อยแล้ว!', 'success');
      loadSiteSettings();
    } else {
      showToast(data.error || 'เกิดข้อผิดพลาดในการรีเซ็ต', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.resetAllSettingsToDefault = resetAllSettingsToDefault;

// 6. Products CRUD Controller
let adminProductSearchQuery = '';
let adminProductCatFilterVal = 'all';

async function loadAdminProducts() {
  try {
    const res = await fetch('/api/admin/products', {
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (res.ok && data.products) {
      window.ADMIN_PRODUCTS = data.products;
      window.STORE_PRODUCTS = data.products;
      if (typeof STORE_PRODUCTS !== 'undefined') STORE_PRODUCTS = data.products;
      renderAdminProductsTable();
      renderProductsGrid();
      renderHomeCategoryShowcases();
      updateCategoryTabCounts(data.products);
      if (typeof renderRecentPurchasesTicker === 'function') renderRecentPurchasesTicker();
      const countEl = document.getElementById('adminProdCount');
      if (countEl) countEl.textContent = data.products.length;
      updateOverviewStats();
    }
  } catch (err) {
    console.error('Failed to load admin products:', err);
  }
}
window.loadAdminProducts = loadAdminProducts;

function filterAdminProductsTable(q) {
  adminProductSearchQuery = (q || '').trim().toLowerCase();
  renderAdminProductsTable();
}
window.filterAdminProductsTable = filterAdminProductsTable;

function filterAdminProductsCategory(cat) {
  adminProductCatFilterVal = cat || 'all';
  renderAdminProductsTable();
}
window.filterAdminProductsCategory = filterAdminProductsCategory;

function renderAdminProductsTable() {
  const tbody = document.getElementById('adminProductsTbody');
  if (!tbody) return;

  let list = window.ADMIN_PRODUCTS || [];

  if (adminProductCatFilterVal !== 'all') {
    list = list.filter(p => p.category === adminProductCatFilterVal);
  }

  if (adminProductSearchQuery) {
    list = list.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.categoryName || '').toLowerCase();
      return name.includes(adminProductSearchQuery) || cat.includes(adminProductSearchQuery);
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #94a3b8;">ไม่พบสินค้าที่ตรงกับเงื่อนไข</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const statusBadge = item.status === 'soldout'
      ? `<span class="badge badge-soldout">หมด</span>`
      : item.status === 'maintenance'
      ? `<span class="badge" style="background: rgba(234, 88, 12, 0.2); color: #fb923c; border: 1px solid rgba(234, 88, 12, 0.4);">ปิดปรับปรุง</span>`
      : `<span class="badge badge-instock">พร้อมส่ง</span>`;

    const catBadge = `<span class="badge badge-cat badge-cat-${item.category}">${item.categoryName || item.category.toUpperCase()}</span>`;

    return `
      <tr>
        <td>
          <img src="${item.image}" alt="${item.name}" class="table-prod-img" onerror="this.src='assets/cat_${item.category}.webp'">
        </td>
        <td style="font-weight: 700; color: #ffffff;">${item.name}</td>
        <td>${catBadge}</td>
        <td style="color: #60a5fa; font-weight: 700;">${formatBaht(item.price)}</td>
        <td>${typeof item.stock === 'number' ? item.stock : 'ไม่จำกัด'}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-stock btn-sm" onclick="openProductStockModal('${item.id}')" title="จัดการสต็อกสินค้า (ใส่คีย์)">
            <i class="fa-solid fa-database"></i>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="openProductEditModal('${item.id}')" title="แก้ไข" style="margin-left: 4px;">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteAdminProduct('${item.id}', '${item.name.replace(/'/g, "\\'")}')" title="ลบสินค้า" style="margin-left: 4px;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Product Edit Modal Controllers (Clean, Intuitive & Modern)
// ========================================================
// ⚡ Product Variants Controller for Add/Edit Modal (Matches Image 1)
// ========================================================
window.currentModalVariants = [];

function renderVariantsUI() {
  const container = document.getElementById('pvmVariantsList');
  if (!container) return;

  if (!window.currentModalVariants || window.currentModalVariants.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 0.85rem; padding: 14px 10px;">ยังไม่มีตัวเลือก กดปุ่ม "+ เพิ่มตัวเลือกใหม่" ด้านล่าง</div>`;
    return;
  }

  container.innerHTML = window.currentModalVariants.map((v, idx) => `
    <div class="pvm-variant-card">
      <div class="pvm-var-top">
        <input type="text" class="pvm-input pvm-var-name" placeholder="ชื่อตัวเลือก (เช่น 1 วัน, 7 วัน, 30 วัน ...)" value="${v.name || ''}" oninput="updateVariantField(${idx}, 'name', this.value)">
        <button type="button" class="pvm-btn-del-var" onclick="removeVariantRow(${idx})" title="ลบตัวเลือก">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <div class="pvm-var-pricing">
        <div class="pvm-var-price-group">
          <span class="pvm-var-prefix">ราคาขาย:</span>
          <input type="number" class="pvm-input pvm-var-input" min="0" step="any" value="${v.price !== undefined ? v.price : 0}" oninput="updateVariantField(${idx}, 'price', parseFloat(this.value) || 0)">
        </div>
        <div class="pvm-var-cost-group">
          <span class="pvm-var-prefix">ราคาต้นทุน:</span>
          <input type="text" class="pvm-input pvm-var-input" placeholder="ไม่บังคับ" value="${v.costPrice || ''}" oninput="updateVariantField(${idx}, 'costPrice', this.value)">
        </div>
      </div>
      <div class="pvm-var-bonus">
        <span class="pvm-var-bonus-label">🎁 แถม:</span>
        <select class="pvm-input pvm-select pvm-bonus-select" onchange="updateVariantField(${idx}, 'gift', this.value)">
          <option value="none" ${(!v.gift || v.gift === 'none') ? 'selected' : ''}>ไม่มีของแถม</option>
          <option value="vip" ${v.gift === 'vip' ? 'selected' : ''}>บัตร VIP 3 วัน</option>
          <option value="key" ${v.gift === 'key' ? 'selected' : ''}>คีย์สำรอง 1 ชิ้น</option>
          <option value="points" ${v.gift === 'points' ? 'selected' : ''}>แต้มสะสม 50 พอยท์</option>
        </select>
      </div>
    </div>
  `).join('');
}
window.renderVariantsUI = renderVariantsUI;

function addNewVariantRow() {
  if (!window.currentModalVariants) window.currentModalVariants = [];
  const days = [1, 7, 15, 30, 60, 90];
  const count = window.currentModalVariants.length;
  const dayName = days[count] ? `${days[count]} วัน` : `${(count + 1) * 7} วัน`;
  const defaultP = count === 0 ? 0 : count === 1 ? 150 : count === 2 ? 249 : 400;

  window.currentModalVariants.push({
    name: dayName,
    price: defaultP,
    costPrice: '',
    gift: 'none',
    subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด'
  });
  renderVariantsUI();
}
window.addNewVariantRow = addNewVariantRow;

function removeVariantRow(idx) {
  if (!window.currentModalVariants) return;
  window.currentModalVariants.splice(idx, 1);
  renderVariantsUI();
}
window.removeVariantRow = removeVariantRow;

function updateVariantField(idx, field, val) {
  if (!window.currentModalVariants || !window.currentModalVariants[idx]) return;
  window.currentModalVariants[idx][field] = val;
}
window.updateVariantField = updateVariantField;

function toggleProductTypeVariants(type) {
  const box = document.getElementById('pvmVariantsBox');
  if (!box) return;
  if (type === 'variants') {
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}
window.toggleProductTypeVariants = toggleProductTypeVariants;

function openProductEditModal(productId) {
  const modal = document.getElementById('productEditModalOverlay');
  const title = document.getElementById('productModalTitle');
  const sub = document.getElementById('productModalSub');
  const tag = document.getElementById('prodModalTag');
  const icon = document.getElementById('prodModalIcon');
  if (!modal) return;

  const item = productId ? (window.ADMIN_PRODUCTS || []).find(p => String(p.id) === String(productId)) : null;

  if (item) {
    if (tag) tag.textContent = 'แก้ไขข้อมูลสินค้า';
    if (icon) icon.className = 'fa-solid fa-pen-to-square';
    if (title) title.textContent = `แก้ไขสินค้า: ${item.name}`;
    if (sub) sub.textContent = `รหัสสินค้า: #${item.id} | จัดการราคา หมวดหมู่ และสถานะ`;
    
    document.getElementById('edit_prod_id').value = item.id;
    document.getElementById('edit_prod_name').value = item.name || '';
    document.getElementById('edit_prod_category').value = item.category || 'pc';
    document.getElementById('edit_prod_price').value = item.price || 0;
    
    const origPriceInput = document.getElementById('edit_prod_orig_price');
    if (origPriceInput) origPriceInput.value = item.originalPrice || '';

    const typeSelect = document.getElementById('edit_prod_type');
    if (typeSelect) typeSelect.value = item.productType || 'variants';

    const keySysSelect = document.getElementById('edit_prod_key_sys');
    if (keySysSelect) keySysSelect.value = item.keySystem || 'manual';

    document.getElementById('edit_prod_status').value = item.status || 'instock';
    document.getElementById('edit_prod_desc').value = item.desc || '';
    
    // Handle Stock (Unlimited vs Specific quantity)
    const isUnlimited = (item.stock === 'unlimited' || item.stock === null || item.stock === undefined || item.stock === '');
    const stockToggle = document.getElementById('edit_prod_unlimited_toggle');
    const stockInput = document.getElementById('edit_prod_stock');
    if (stockToggle) stockToggle.checked = isUnlimited;
    if (stockInput) {
      if (isUnlimited) {
        stockInput.value = '';
        stockInput.disabled = true;
        stockInput.placeholder = 'คลังไม่จำกัด (ขายได้ตลอด)';
      } else {
        stockInput.disabled = false;
        stockInput.value = item.stock;
        stockInput.placeholder = 'จำนวนชิ้น (เช่น 10, 50)';
      }
    }

    // Image & Preview
    const imgVal = item.image || `assets/cat_${item.category || 'pc'}.webp`;
    document.getElementById('edit_prod_image').value = imgVal;
    const previewEl = document.getElementById('edit_prod_preview');
    if (previewEl) {
      previewEl.src = imgVal;
    }
    const badge = document.getElementById('previewBadge');
    if (badge) badge.textContent = 'รูปภาพปัจจุบัน';

    // Populate Variants
    if (Array.isArray(item.variants) && item.variants.length > 0) {
      window.currentModalVariants = JSON.parse(JSON.stringify(item.variants));
    } else {
      window.currentModalVariants = [
        { name: '1 วัน', price: item.price || 0, costPrice: '', gift: 'none', subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด' }
      ];
    }
    renderVariantsUI();
    toggleProductTypeVariants(item.productType || 'variants');

  } else {
    // Add New Product (Matches Image 1 default state)
    if (tag) tag.textContent = 'สร้างสินค้าใหม่';
    if (icon) icon.className = 'fa-solid fa-box-open';
    if (title) title.textContent = 'เพิ่มสินค้าใหม่';
    if (sub) sub.textContent = 'กรอกข้อมูลเพื่อลงขายสินค้าใหม่ในระบบร้านค้า';

    document.getElementById('edit_prod_id').value = '';
    document.getElementById('edit_prod_name').value = '';
    document.getElementById('edit_prod_category').value = 'pc';
    document.getElementById('edit_prod_price').value = '0';
    
    const origPriceInput = document.getElementById('edit_prod_orig_price');
    if (origPriceInput) origPriceInput.value = '';

    const typeSelect = document.getElementById('edit_prod_type');
    if (typeSelect) typeSelect.value = 'variants';

    const keySysSelect = document.getElementById('edit_prod_key_sys');
    if (keySysSelect) keySysSelect.value = 'manual';

    document.getElementById('edit_prod_status').value = 'instock';
    document.getElementById('edit_prod_desc').value = '';

    const stockToggle = document.getElementById('edit_prod_unlimited_toggle');
    const stockInput = document.getElementById('edit_prod_stock');
    if (stockToggle) stockToggle.checked = true;
    if (stockInput) {
      stockInput.value = '';
      stockInput.disabled = true;
      stockInput.placeholder = 'คลังไม่จำกัด (ขายได้ตลอด)';
    }

    document.getElementById('edit_prod_image').value = 'assets/cat_pc.webp';
    const previewEl = document.getElementById('edit_prod_preview');
    if (previewEl) previewEl.src = 'assets/cat_pc.webp';
    const badge = document.getElementById('previewBadge');
    if (badge) badge.textContent = 'รูปภาพเริ่มต้น (PC)';

    // Default variant row matching Image 1
    window.currentModalVariants = [
      { name: '', price: 0, costPrice: '', gift: 'none', subtitle: 'สินค้าดิจิทัล · สต็อกไม่จำกัด' }
    ];
    renderVariantsUI();
    toggleProductTypeVariants('variants');
  }

  modal.style.display = 'flex';
}
window.openProductEditModal = openProductEditModal;

function closeProductEditModal() {
  const modal = document.getElementById('productEditModalOverlay');
  if (modal) modal.style.display = 'none';
}
window.closeProductEditModal = closeProductEditModal;

// Toggle Unlimited Stock
function toggleUnlimitedStock(checked) {
  const stockInput = document.getElementById('edit_prod_stock');
  const helpText = document.getElementById('stockHelpText');
  if (!stockInput) return;

  if (checked) {
    stockInput.value = '';
    stockInput.disabled = true;
    stockInput.placeholder = 'คลังไม่จำกัด (ขายได้ตลอด)';
    if (helpText) helpText.innerHTML = '<i class="fa-solid fa-circle-info"></i> ติ๊ก "คลังไม่จำกัด" ไว้: ลูกค้าจะสั่งซื้อได้ตลอดเวลาโดยไม่มีวันหมด';
  } else {
    stockInput.disabled = false;
    stockInput.placeholder = 'ระบุจำนวนชิ้น เช่น 50';
    stockInput.focus();
    if (helpText) helpText.innerHTML = '<i class="fa-solid fa-circle-info"></i> ระบุจำนวนชิ้น: เมื่อลูกค้าซื้อครบ สต็อกจะเปลี่ยนเป็น "สินค้าหมด" อัตโนมัติ';
  }
}
window.toggleUnlimitedStock = toggleUnlimitedStock;

// Live Image Preview
function updateLiveImgPreview(targetId, url) {
  const el = document.getElementById(targetId);
  const badge = document.getElementById('previewBadge');
  if (!el) return;
  const cleanUrl = (url || '').trim();
  if (cleanUrl) {
    el.src = cleanUrl;
    if (badge) badge.textContent = 'แสดงตัวอย่างจาก URL';
  } else {
    el.src = 'assets/cat_pc.webp';
    if (badge) badge.textContent = 'รูปภาพสำรอง';
  }
}
window.updateLiveImgPreview = updateLiveImgPreview;

// Handle preview image load error gracefully
function handlePreviewImgError(imgElement) {
  if (!imgElement) return;
  imgElement.src = 'assets/cat_pc.webp';
  const badge = document.getElementById('previewBadge');
  if (badge) badge.textContent = 'ใช้รูปภาพสำรอง (URL เดิมโหลดไม่ได้)';
}
window.handlePreviewImgError = handlePreviewImgError;

// Quick Preset Category Image
function applyPresetProdImage(cat) {
  const url = `assets/cat_${cat}.webp`;
  const input = document.getElementById('edit_prod_image');
  const preview = document.getElementById('edit_prod_preview');
  const badge = document.getElementById('previewBadge');
  if (input) input.value = url;
  if (preview) preview.src = url;
  if (badge) badge.textContent = `รูปภาพหมวดหมู่: ${cat.toUpperCase()}`;
}
window.applyPresetProdImage = applyPresetProdImage;

// Handle file upload from client
async function handleAdminFileUpload(fileInput, targetUrlInputId, previewImgId, type) {
  if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
  const file = fileInput.files[0];

  // Preview immediately with FileReader
  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64Data = e.target.result;
    const previewEl = document.getElementById(previewImgId);
    if (previewEl) previewEl.src = base64Data;
    const badge = document.getElementById('previewBadge');
    if (badge) badge.textContent = 'กำลังอัปโหลด...';

    // Upload to server
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'dekthep_admin_2026'
        },
        body: JSON.stringify({
          image: base64Data,
          name: `${type || 'upload'}_${Date.now()}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        const inputEl = document.getElementById(targetUrlInputId);
        if (inputEl) inputEl.value = data.url;
        if (previewEl) previewEl.src = data.url;
        if (badge) badge.textContent = 'อัปโหลดสำเร็จ ✅';
        showToast('อัปโหลดรูปภาพสำเร็จแล้ว!', 'success');
      } else {
        showToast(data.error || 'อัปโหลดรูปภาพไม่สำเร็จ', 'error');
        if (badge) badge.textContent = 'อัปโหลดล้มเหลว';
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่ออัปโหลด', 'error');
      if (badge) badge.textContent = 'อัปโหลดล้มเหลว';
    }
  };
  reader.readAsDataURL(file);
}
window.handleAdminFileUpload = handleAdminFileUpload;

async function handleSaveProductModal() {
  const id = document.getElementById('edit_prod_id').value;
  const name = document.getElementById('edit_prod_name').value.trim();
  const category = document.getElementById('edit_prod_category').value;
  const price = parseFloat(document.getElementById('edit_prod_price').value) || 0;
  const originalPrice = document.getElementById('edit_prod_orig_price')?.value.trim() || '';
  const productType = document.getElementById('edit_prod_type')?.value || 'variants';
  const keySystem = document.getElementById('edit_prod_key_sys')?.value || 'manual';
  const status = document.getElementById('edit_prod_status').value;
  
  const isUnlimited = document.getElementById('edit_prod_unlimited_toggle')?.checked;
  const stockVal = document.getElementById('edit_prod_stock')?.value.trim();
  let stock = 'unlimited';
  if (!isUnlimited && stockVal !== '') {
    stock = parseInt(stockVal, 10);
    if (isNaN(stock) || stock < 0) stock = 0;
  }

  const image = document.getElementById('edit_prod_image').value.trim() || `assets/cat_${category}.webp`;
  const desc = document.getElementById('edit_prod_desc').value.trim();

  if (!name) {
    showToast('กรุณากรอกชื่อสินค้า', 'error');
    return;
  }

  const catNames = { pc: 'PC', ios: 'IOS', xreg: 'XREG AD & IOS', ad: 'ANDROID' };

  const payload = {
    id: id || undefined,
    name,
    category,
    categoryName: catNames[category] || category.toUpperCase(),
    price,
    originalPrice,
    productType,
    keySystem,
    variants: window.currentModalVariants || [],
    status,
    stock,
    image,
    desc
  };

  try {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('บันทึกข้อมูลสินค้าเรียบร้อยแล้ว!', 'success');
      closeProductEditModal();
      if (data.products && Array.isArray(data.products)) {
        window.ADMIN_PRODUCTS = data.products;
        window.STORE_PRODUCTS = data.products;
        if (typeof STORE_PRODUCTS !== 'undefined') STORE_PRODUCTS = data.products;
        renderAdminProductsTable();
        const countEl = document.getElementById('adminProdCount');
        if (countEl) countEl.textContent = data.products.length;
        updateOverviewStats();
      } else {
        await loadAdminProducts();
      }
      renderProductsGrid();
      renderHomeCategoryShowcases();
      updateCategoryTabCounts(window.STORE_PRODUCTS);
      if (typeof renderRecentPurchasesTicker === 'function') renderRecentPurchasesTicker();
    } else {
      showToast(data.error || 'บันทึกสินค้าไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.handleSaveProductModal = handleSaveProductModal;


async function deleteAdminProduct(id, name) {
  if (!confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) return;

  try {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('ลบสินค้าเรียบร้อยแล้ว', 'info');
      if (data.products && Array.isArray(data.products)) {
        window.ADMIN_PRODUCTS = data.products;
        window.STORE_PRODUCTS = data.products;
        if (typeof STORE_PRODUCTS !== 'undefined') STORE_PRODUCTS = data.products;
        renderAdminProductsTable();
        const countEl = document.getElementById('adminProdCount');
        if (countEl) countEl.textContent = data.products.length;
        updateOverviewStats();
      } else {
        await loadAdminProducts();
      }
      renderProductsGrid();
      renderHomeCategoryShowcases();
      updateCategoryTabCounts(window.STORE_PRODUCTS);
      if (typeof renderRecentPurchasesTicker === 'function') renderRecentPurchasesTicker();
    } else {
      showToast(data.error || 'ลบสินค้าไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการลบสินค้า', 'error');
  }
}
window.deleteAdminProduct = deleteAdminProduct;

// ==============================================================
// 6.5 Product Stock & License Keys Management (จัดการสต็อกสินค้า)
// ==============================================================
window.currentStockProductId = null;
window.currentStockData = null;
window.currentStockVariantName = null;

async function openProductStockModal(productId) {
  try {
    window.currentStockProductId = productId;
    const overlay = document.getElementById('productStockModalOverlay');
    if (!overlay) return;

    // Set product title
    const prod = (window.ADMIN_PRODUCTS || []).find(p => String(p.id) === String(productId));
    const titleEl = document.getElementById('stockModalSubtitle');
    if (titleEl) {
      titleEl.textContent = prod ? prod.name : `Product #${productId}`;
    }

    // Fetch stock info from backend
    const res = await fetch(`/api/admin/products/${productId}/stock`, {
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'ไม่สามารถโหลดข้อมูลสต็อกได้', 'error');
      return;
    }

    window.currentStockData = data;

    // Populate variant select
    const select = document.getElementById('stockVariantSelect');
    if (select) {
      select.innerHTML = '';
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        data.variants.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.name;
          const count = (data.stocks && Array.isArray(data.stocks[v.name])) ? data.stocks[v.name].length : 0;
          opt.textContent = `${v.name} (ราคา: ฿${v.price}) [สต็อก: ${count}]`;
          select.appendChild(opt);
        });
        window.currentStockVariantName = data.variants[0].name;
        select.value = window.currentStockVariantName;
      } else {
        const opt = document.createElement('option');
        opt.value = 'ปกติ';
        const count = (data.stocks && Array.isArray(data.stocks['ปกติ'])) ? data.stocks['ปกติ'].length : 0;
        opt.textContent = `ปกติ (ราคา: ฿${data.product.price}) [สต็อก: ${count}]`;
        select.appendChild(opt);
        window.currentStockVariantName = 'ปกติ';
        select.value = 'ปกติ';
      }
    }

    // Reset textarea
    const inputArea = document.getElementById('stockKeysInput');
    if (inputArea) inputArea.value = '';

    // Render table
    renderStockTable(window.currentStockVariantName);

    // Show modal
    overlay.style.display = 'flex';
  } catch (err) {
    console.error('Error opening stock modal:', err);
    showToast('เกิดข้อผิดพลาดในการโหลดสต็อก', 'error');
  }
}
window.openProductStockModal = openProductStockModal;

function closeProductStockModal() {
  const overlay = document.getElementById('productStockModalOverlay');
  if (overlay) overlay.style.display = 'none';
  window.currentStockProductId = null;
  window.currentStockData = null;
  window.currentStockVariantName = null;
}
window.closeProductStockModal = closeProductStockModal;

function onStockVariantChanged(varName) {
  window.currentStockVariantName = varName;
  renderStockTable(varName);
}
window.onStockVariantChanged = onStockVariantChanged;

function renderStockTable(varName) {
  const countEl = document.getElementById('stockCountNumber');
  const tbody = document.getElementById('stockTableTbody');
  if (!tbody) return;

  const stocks = window.currentStockData?.stocks || {};
  const list = Array.isArray(stocks[varName]) ? stocks[varName] : [];

  if (countEl) countEl.textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="stock-empty-text">ยังไม่มีสต็อกในตัวเลือกนี้</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((item, idx) => {
    return `
      <tr>
        <td style="color: #94a3b8; font-weight: 700;">#${idx + 1}</td>
        <td>
          <code style="background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; font-family: monospace; color: #60a5fa; word-break: break-all;">
            ${escapeHtml(item)}
          </code>
        </td>
        <td style="text-align: right;">
          <button type="button" class="stock-btn-del-item" onclick="handleStockDeleteKey(${idx})" title="ลบรายการนี้">
            <i class="fa-solid fa-trash-can" style="font-size: 0.8rem;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
window.renderStockTable = renderStockTable;

async function handleStockAddKeys() {
  if (!window.currentStockProductId) return;
  const input = document.getElementById('stockKeysInput');
  const rawText = input ? input.value : '';
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length === 0) {
    showToast('กรุณากรอกข้อมูลสินค้าหรือคีย์อย่างน้อย 1 รายการ', 'warning');
    return;
  }

  const vName = window.currentStockVariantName || 'ปกติ';
  const addBtn = document.getElementById('btnStockAddKeys');
  if (addBtn) addBtn.disabled = true;

  try {
    const res = await fetch(`/api/admin/products/${window.currentStockProductId}/stock/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({
        variantName: vName,
        keys: lines
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`เพิ่มสต็อกสำเร็จ +${lines.length} รายการ`, 'success');
      if (input) input.value = '';
      if (!window.currentStockData.stocks) window.currentStockData.stocks = {};
      window.currentStockData.stocks = data.stocks;
      renderStockTable(vName);
      
      // Update variant dropdown text count
      const select = document.getElementById('stockVariantSelect');
      if (select && select.selectedOptions[0]) {
        const text = select.selectedOptions[0].textContent.replace(/\[สต็อก: \d+\]/, `[สต็อก: ${data.totalInVariant}]`);
        select.selectedOptions[0].textContent = text;
      }
      
      // Refresh admin products table to update count if applicable
      await loadAdminProducts();
    } else {
      showToast(data.error || 'เพิ่มสต็อกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    console.error('Error adding stock keys:', err);
    showToast('เกิดข้อผิดพลาดในการเพิ่มสต็อก', 'error');
  } finally {
    if (addBtn) addBtn.disabled = false;
  }
}
window.handleStockAddKeys = handleStockAddKeys;

async function handleStockDeleteKey(index) {
  if (!window.currentStockProductId) return;
  const vName = window.currentStockVariantName || 'ปกติ';

  try {
    const res = await fetch(`/api/admin/products/${window.currentStockProductId}/stock/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({
        variantName: vName,
        keyIndex: index
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('ลบสต็อกรายการนี้เรียบร้อยแล้ว', 'info');
      if (!window.currentStockData.stocks) window.currentStockData.stocks = {};
      window.currentStockData.stocks = data.stocks;
      renderStockTable(vName);
      
      const select = document.getElementById('stockVariantSelect');
      if (select && select.selectedOptions[0]) {
        const text = select.selectedOptions[0].textContent.replace(/\[สต็อก: \d+\]/, `[สต็อก: ${data.totalInVariant}]`);
        select.selectedOptions[0].textContent = text;
      }
      await loadAdminProducts();
    } else {
      showToast(data.error || 'ลบสต็อกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    console.error('Error deleting stock key:', err);
    showToast('เกิดข้อผิดพลาดในการลบสต็อก', 'error');
  }
}
window.handleStockDeleteKey = handleStockDeleteKey;

async function handleStockClearKeys() {
  if (!window.currentStockProductId) return;
  const vName = window.currentStockVariantName || 'ปกติ';
  
  if (!confirm(`คุณต้องการล้างสต็อกทั้งหมดในตัวเลือก "${vName}" ใช่หรือไม่?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/products/${window.currentStockProductId}/stock/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({
        variantName: vName
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('ล้างสต็อกทั้งหมดเรียบร้อยแล้ว', 'success');
      if (!window.currentStockData.stocks) window.currentStockData.stocks = {};
      window.currentStockData.stocks = data.stocks;
      renderStockTable(vName);
      
      const select = document.getElementById('stockVariantSelect');
      if (select && select.selectedOptions[0]) {
        const text = select.selectedOptions[0].textContent.replace(/\[สต็อก: \d+\]/, `[สต็อก: 0]`);
        select.selectedOptions[0].textContent = text;
      }
      await loadAdminProducts();
    } else {
      showToast(data.error || 'ล้างสต็อกไม่สำเร็จ', 'error');
    }
  } catch (err) {
    console.error('Error clearing stock:', err);
    showToast('เกิดข้อผิดพลาดในการล้างสต็อก', 'error');
  }
}
window.handleStockClearKeys = handleStockClearKeys;

// 7. Users and Balance CRUD Controller
let adminUserSearchQuery = '';

async function loadAdminUsers() {
  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (res.ok && data.users) {
      window.ADMIN_USERS = data.users;
      renderAdminUsersTable();
      const memEl = document.getElementById('summaryTotalMembers');
      if (memEl) memEl.textContent = `${data.users.length} คน`;
      updateOverviewStats();
    }
  } catch (err) {
    console.error('Failed to load admin users:', err);
  }
}
window.loadAdminUsers = loadAdminUsers;

function filterAdminUsersTable(q) {
  adminUserSearchQuery = (q || '').trim().toLowerCase();
  renderAdminUsersTable();
}
window.filterAdminUsersTable = filterAdminUsersTable;

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTbody');
  if (!tbody) return;

  let list = window.ADMIN_USERS || [];

  if (adminUserSearchQuery) {
    list = list.filter(u => {
      const uname = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return uname.includes(adminUserSearchQuery) || email.includes(adminUserSearchQuery);
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #94a3b8;">ไม่พบรายชื่อสมาชิก</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(u => {
    const avatarUrl = u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || u.id}`;
    const isAdmin = u.role === 'admin';
    const roleBadge = isAdmin
      ? `<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);"><i class="fa-solid fa-shield"></i> Admin</span>`
      : `<span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">Member</span>`;

    const providerIcon = u.provider === 'discord'
      ? `<i class="fa-brands fa-discord" style="color: #5865F2;"></i> Discord`
      : u.provider === 'google'
      ? `<i class="fa-brands fa-google" style="color: #ea4335;"></i> Google`
      : `<i class="fa-solid fa-user" style="color: #60a5fa;"></i> เว็บไซต์`;

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${avatarUrl}" class="table-user-avatar" alt="${u.username}">
            <div>
              <div style="font-weight: 700; color: #ffffff;">${u.username}</div>
              <small style="color: #64748b;">ID: ${u.id.substring(0, 10)}...</small>
            </div>
          </div>
        </td>
        <td style="color: #94a3b8;">${u.email || '-'}</td>
        <td>${providerIcon}</td>
        <td>${roleBadge}</td>
        <td style="color: #10b981; font-weight: 800; font-size: 1.05rem;">${formatBaht(u.balance)}</td>
        <td style="text-align: right;">
          <div class="btn-user-action-group">
            <button type="button" class="btn btn-secondary btn-sm" onclick="openBalanceModal('${u.id}')" title="ปรับปรุงยอดเงิน">
              <i class="fa-solid fa-coins"></i> ปรับเงิน
            </button>
            <button type="button" class="btn btn-danger-soft btn-sm" onclick="quickClearUserBalance('${u.id}', '${encodeURIComponent(u.username)}')" title="ลบยอดเงินคงเหลือเป็น ฿0.00">
              <i class="fa-solid fa-eraser"></i> ลบยอดเงิน
            </button>
            <button type="button" class="btn btn-delete-user btn-sm" onclick="deleteUserAccount('${u.id}', '${encodeURIComponent(u.username)}')" title="ลบบัญชีสมาชิกนี้">
              <i class="fa-solid fa-trash"></i> ลบบัญชี
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="toggleUserAdminRole('${u.id}', '${u.role || 'member'}')" title="เปลี่ยนสิทธิ์" style="padding: 6px 9px;">
              <i class="fa-solid fa-shield"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Quick clear balance to 0
async function quickClearUserBalance(userId, encUsername) {
  const username = decodeURIComponent(encUsername || '');
  if (!confirm(`คุณต้องการลบยอดเงินคงเหลือของสมาชิก "${username}" ให้เป็น ฿0.00 ใช่หรือไม่?`)) return;
  try {
    const res = await fetch('/api/admin/users/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ userId, clearBalance: true, note: 'แอดมินลบยอดเงินเป็น ฿0.00' })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`ลบยอดเงินของ "${username}" เป็น ฿0.00 สำเร็จ!`, 'success');
      await loadAdminUsers();
      if (currentUser && currentUser.id === userId) {
        updateUserState(data.user);
      }
    } else {
      showToast(data.error || 'ลบยอดเงินไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.quickClearUserBalance = quickClearUserBalance;

// Delete User Account
async function deleteUserAccount(userId, encUsername) {
  const username = decodeURIComponent(encUsername || '');
  if (!confirm(`⚠️ ยืนยันการลบบัญชีสมาชิก: "${username}"\n\nการกระทำนี้จะลบข้อมูลบัญชีออกจากระบบถาวรและไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อหรือไม่?`)) return;
  try {
    const res = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || `ลบบัญชีสมาชิก "${username}" เรียบร้อยแล้ว`, 'success');
      await loadAdminUsers();
    } else {
      showToast(data.error || 'ลบบัญชีไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.deleteUserAccount = deleteUserAccount;

// Clear User Balance From Inside Modal
async function handleClearUserBalanceFromModal() {
  const userId = document.getElementById('balance_user_id').value;
  if (!userId) return;
  const user = (window.ADMIN_USERS || []).find(u => String(u.id) === String(userId));
  const uname = user ? user.username : 'สมาชิก';
  if (!confirm(`คุณต้องการลบยอดเงินคงเหลือของ "${uname}" ให้เป็น ฿0.00 ทันทีใช่หรือไม่?`)) return;

  try {
    const res = await fetch('/api/admin/users/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({
        userId,
        clearBalance: true,
        note: document.getElementById('balance_note').value.trim() || 'แอดมินลบยอดเงินเป็น ฿0.00'
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`ลบยอดเงินของ "${uname}" เป็น ฿0.00 สำเร็จ!`, 'success');
      closeBalanceModal();
      await loadAdminUsers();
      if (currentUser && currentUser.id === userId) {
        updateUserState(data.user);
      }
    } else {
      showToast(data.error || 'ลบยอดเงินไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.handleClearUserBalanceFromModal = handleClearUserBalanceFromModal;

// Balance Adjustment Modal (Clean & Easy)
function openBalanceModal(userId) {
  const modal = document.getElementById('balanceModalOverlay');
  if (!modal) return;

  const user = (window.ADMIN_USERS || []).find(u => String(u.id) === String(userId));
  if (!user) return;

  document.getElementById('balance_user_id').value = user.id;
  const subEl = document.getElementById('balanceModalSub');
  if (subEl) subEl.textContent = `สมาชิก: ${user.username} (${user.email || 'ไม่มีอีเมล'}) | รหัส: #${user.id.substring(0, 8)}`;
  
  const displayEl = document.getElementById('balance_current_display');
  if (displayEl) displayEl.textContent = formatBaht(user.balance);

  const valEl = document.getElementById('balance_current_val');
  if (valEl) valEl.value = user.balance || 0;

  document.getElementById('balance_adjust_amt').value = '100';
  document.getElementById('balance_direct_set').value = '';
  document.getElementById('balance_note').value = 'แอดมินปรับยอดเงิน';

  modal.style.display = 'flex';
}
window.openBalanceModal = openBalanceModal;

function closeBalanceModal() {
  const modal = document.getElementById('balanceModalOverlay');
  if (modal) modal.style.display = 'none';
}
window.closeBalanceModal = closeBalanceModal;

function quickSetAdjustAmt(amt) {
  const input = document.getElementById('balance_adjust_amt');
  const directInput = document.getElementById('balance_direct_set');
  if (directInput) directInput.value = '';
  if (input) {
    input.value = amt;
    input.focus();
  }
}
window.quickSetAdjustAmt = quickSetAdjustAmt;

async function handleSaveUserBalance() {
  const userId = document.getElementById('balance_user_id').value;
  const adjustAmt = parseFloat(document.getElementById('balance_adjust_amt').value);
  const directSet = document.getElementById('balance_direct_set').value.trim();
  const note = document.getElementById('balance_note').value.trim() || 'แอดมินปรับยอดเงิน';

  const payload = {
    userId,
    note
  };

  if (directSet !== '') {
    payload.balance = parseFloat(directSet) || 0;
  } else {
    payload.adjustment = isNaN(adjustAmt) ? 0 : adjustAmt;
  }

  try {
    const res = await fetch('/api/admin/users/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`ปรับปรุงยอดเงินสำเร็จ! ยอดใหม่: ${formatBaht(data.user.balance)}`, 'success');
      closeBalanceModal();
      await loadAdminUsers();
      if (currentUser && currentUser.id === userId) {
        updateUserState(data.user);
      }
    } else {
      showToast(data.error || 'ปรับยอดเงินไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
  }
}
window.handleSaveUserBalance = handleSaveUserBalance;

async function toggleUserAdminRole(userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'member' : 'admin';
  const roleName = newRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป (Member)';
  if (!confirm(`คุณต้องการเปลี่ยนสิทธิ์ของสมาชิกนี้เป็น "${roleName}" ใช่หรือไม่?`)) return;

  try {
    const res = await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'dekthep_admin_2026'
      },
      body: JSON.stringify({ userId, role: newRole })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`เปลี่ยนสิทธิ์เป็น ${roleName} สำเร็จ!`, 'success');
      await loadAdminUsers();
      if (currentUser && currentUser.id === userId) {
        updateUserState(data.user);
      }
    } else {
      showToast(data.error || 'เปลี่ยนสิทธิ์ไม่สำเร็จ', 'error');
    }
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์', 'error');
  }
}
window.toggleUserAdminRole = toggleUserAdminRole;

// 8. Orders and Summary Controller
async function loadAdminOrders() {
  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'x-admin-key': 'dekthep_admin_2026' }
    });
    const data = await res.json();
    if (res.ok && data.orders) {
      window.ADMIN_ORDERS = data.orders;
      renderAdminOrdersTable(data.orders);

      const totOrdersEl = document.getElementById('summaryTotalOrders');
      const totRevEl = document.getElementById('summaryTotalRevenue');

      let revenue = 0;
      data.orders.forEach(o => { revenue += (o.price || 0); });

      if (totOrdersEl) totOrdersEl.textContent = `${data.orders.length} รายการ`;
      if (totRevEl) totRevEl.textContent = formatBaht(revenue);
      updateOverviewStats();
    }
  } catch (err) {
    console.error('Failed to load admin orders:', err);
  }
}
window.loadAdminOrders = loadAdminOrders;

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('adminOrdersTbody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #94a3b8;">ยังไม่มีประวัติคำสั่งซื้อ</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('th-TH') : '-';
    return `
      <tr>
        <td style="font-family: monospace; color: #60a5fa;">#${o.id.substring(0, 8)}</td>
        <td>${o.username || 'สมาชิก'}</td>
        <td style="color: #ffffff; font-weight: 700;">${o.productName}</td>
        <td style="color: #10b981; font-weight: 700;">${formatBaht(o.price)}</td>
        <td style="color: #94a3b8; font-size: 0.85rem;">${dateStr}</td>
        <td><span class="badge badge-instock">สำเร็จ</span></td>
      </tr>
    `;
  }).join('');
}

// Global modal overlay click handlers for admin modals
document.getElementById('productEditModalOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'productEditModalOverlay') closeProductEditModal();
});
document.getElementById('balanceModalOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'balanceModalOverlay') closeBalanceModal();
});

// =========================================================
// 📞 CONTACT US MODAL CONTROLLER (ตรงตาม Image 2)
// =========================================================
function openContactModal() {
  const overlay = document.getElementById('contactModalOverlay');
  if (!overlay) return;

  const general = window.SITE_SETTINGS?.general || {};
  const titleEl = document.getElementById('contactModalTitle');
  const avatarEl = document.getElementById('contactModalAvatar');
  const discordBtn = document.getElementById('contactModalDiscordBtn');
  const youtubeBtn = document.getElementById('contactModalYouTubeBtn');

  if (titleEl && general.storeName) titleEl.textContent = general.storeName;
  if (avatarEl && window.SITE_SETTINGS?.images?.logo) avatarEl.src = window.SITE_SETTINGS.images.logo;
  if (discordBtn && general.discordUrl) discordBtn.href = general.discordUrl;
  if (youtubeBtn && general.youtubeUrl) youtubeBtn.href = general.youtubeUrl;

  overlay.style.display = 'flex';
}
window.openContactModal = openContactModal;

function closeContactModal() {
  const overlay = document.getElementById('contactModalOverlay');
  if (overlay) overlay.style.display = 'none';
}
window.closeContactModal = closeContactModal;

function handleContactOverlayClick(event) {
  if (event.target.id === 'contactModalOverlay') {
    closeContactModal();
  }
}
window.handleContactOverlayClick = handleContactOverlayClick;

// =========================================================
// 🌐 COUNTRY & LANGUAGE SELECTOR CONTROLLER (ตรงตาม Image 1)
// =========================================================
// =========================================================
// 🌐 COUNTRY & LANGUAGE SELECTOR CONTROLLER (ตรงตาม Image 1)
// =========================================================
const I18N_LOCALES = {
  th: { flag: 'https://flagcdn.com/w20/th.png', code: 'TH', name: 'ไทย (Thailand)' },
  en: { flag: 'https://flagcdn.com/w20/us.png', code: 'EN', name: 'English (United States)' },
  la: { flag: 'https://flagcdn.com/w20/la.png', code: 'LA', name: 'ພາສາລາວ (Laos)' },
  cn: { flag: 'https://flagcdn.com/w20/cn.png', code: 'CN', name: '简体中文 (China)' }
};

const I18N_TRANSLATIONS = {
  th: {
    nav_home: 'หน้าหลัก',
    nav_store: 'ร้านค้า',
    nav_topup: 'เติมเงิน',
    nav_history: 'ประวัติ',
    nav_contact: 'ติดต่อเรา',
    nav_login: 'เข้าสู่ระบบ',
    nav_register: 'สมัครสมาชิก',
    nav_admin: 'หลังบ้าน',
    buy_now: 'สั่งซื้อสินค้า',
    goto_topup: 'ไปที่หน้าเติมเงิน',
    cancel: 'ยกเลิก',
    qty: 'จำนวน',
    coupon: 'โค้ดส่วนลด',
    coupon_placeholder: 'กรอกโค้ดส่วนลด',
    coupon_btn: 'ใช้โค้ด',
    price: 'ราคา',
    variants: 'ตัวเลือกสินค้า',
    bal_user: 'ยอดเงินในกระเป๋าของคุณ:',
    bal_remain: 'ยอดคงเหลือหลังชำระ:'
  },
  en: {
    nav_home: 'Home',
    nav_store: 'Store',
    nav_topup: 'Top-up',
    nav_history: 'History',
    nav_contact: 'Contact Us',
    nav_login: 'Sign In',
    nav_register: 'Sign Up',
    nav_admin: 'Admin',
    buy_now: 'Buy Now',
    goto_topup: 'Go to Top-up',
    cancel: 'Cancel',
    qty: 'Quantity',
    coupon: 'Discount Code',
    coupon_placeholder: 'Enter discount code',
    coupon_btn: 'Apply',
    price: 'Price',
    variants: 'Product Variants',
    bal_user: 'Your Wallet Balance:',
    bal_remain: 'Remaining Balance:'
  },
  la: {
    nav_home: 'ໜ້າທຳອິດ',
    nav_store: 'ຮ້ານຄ້າ',
    nav_topup: 'ເຕີມເງິນ',
    nav_history: 'ປະຫວັດ',
    nav_contact: 'ຕິດຕໍ່ພວກເຮົາ',
    nav_login: 'ເຂົ້າສູ່ລະບົບ',
    nav_register: 'ສະໝັກສະມາຊິກ',
    nav_admin: 'ຫຼັງບ້ານ',
    buy_now: 'ສັ່ງຊື້ສິນຄ້າ',
    goto_topup: 'ໄປໜ້າເຕີມເງິນ',
    cancel: 'ຍົກເລີກ',
    qty: 'ຈຳນວນ',
    coupon: 'ລະຫັດສ່ວນຫຼຸດ',
    coupon_placeholder: 'ປ້ອນລະຫັດສ່ວນຫຼຸດ',
    coupon_btn: 'ໃຊ້ລະຫັດ',
    price: 'ລາຄາ',
    variants: 'ຕົວເລືອກສິນຄ້າ',
    bal_user: 'ຍອດເງິນໃນກະເປົາ:',
    bal_remain: 'ຍອດເຫຼືອຫຼັງຊຳລະ:'
  },
  cn: {
    nav_home: '首页',
    nav_store: '商城',
    nav_topup: '充值',
    nav_history: '历史记录',
    nav_contact: '联系我们',
    nav_login: '登录',
    nav_register: '注册',
    nav_admin: '后台管理',
    buy_now: '立即购买',
    goto_topup: '前往充值',
    cancel: '取消',
    qty: '数量',
    coupon: '优惠码',
    coupon_placeholder: '请输入折扣码',
    coupon_btn: '使用',
    price: '价格',
    variants: '商品选项',
    bal_user: '账户余额:',
    bal_remain: '扣款后剩余:'
  }
};

function applyTranslations(lang) {
  const t = I18N_TRANSLATIONS[lang] || I18N_TRANSLATIONS.th;

  // Navbar Links
  const navHome = document.querySelector('#navHomeLink span');
  const navStore = document.querySelector('#navStoreLink span');
  const navTopup = document.querySelector('#navTopupLink span');
  const navHist = document.querySelector('#navHistoryLink span');
  const navContact = document.querySelector('#navContactLink span');
  const navLogin = document.querySelector('#navLoginBtn span');
  const navRegister = document.querySelector('#navRegisterBtn span');
  const navAdmin = document.querySelector('#navAdminBtn span');

  if (navHome) navHome.textContent = t.nav_home;
  if (navStore) navStore.textContent = t.nav_store;
  if (navTopup) navTopup.textContent = t.nav_topup;
  if (navHist) navHist.textContent = t.nav_history;
  if (navContact) navContact.textContent = t.nav_contact;
  if (navLogin) navLogin.textContent = t.nav_login;
  if (navRegister) navRegister.textContent = t.nav_register;
  if (navAdmin) navAdmin.textContent = t.nav_admin;

  // Purchase Modal
  const btnBuy = document.getElementById('btnConfirmBuyText');
  if (btnBuy) btnBuy.textContent = t.buy_now;

  const btnCancel = document.getElementById('btnCancelBuy');
  if (btnCancel && btnCancel.textContent.trim() !== 'เสร็จสิ้น') btnCancel.textContent = t.cancel;

  const couponInput = document.getElementById('pbuyCouponInput');
  if (couponInput) couponInput.placeholder = t.coupon_placeholder;

  const couponBtn = document.getElementById('pbuyBtnApplyCoupon');
  if (couponBtn) couponBtn.textContent = t.coupon_btn;

  const priceLabel = document.querySelector('.pbuy-price-label');
  if (priceLabel) priceLabel.textContent = t.price;

  const qtyLabel = document.querySelector('.pbuy-qty-section .pbuy-field-label');
  if (qtyLabel) qtyLabel.textContent = t.qty;

  const couponLabel = document.querySelector('.pbuy-coupon-section .pbuy-field-label');
  if (couponLabel) couponLabel.textContent = t.coupon;

  const balRow1 = document.querySelector('.pbuy-bal-row:first-child span');
  if (balRow1) balRow1.textContent = t.bal_user;

  const balRow2 = document.querySelector('.pbuy-bal-row:last-child span');
  if (balRow2) balRow2.textContent = t.bal_remain;
}

function toggleCountryDropdown(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const popover = document.getElementById('countryDropdownPopover');
  if (!popover) return;
  const isShown = popover.style.display === 'block';
  popover.style.display = isShown ? 'none' : 'block';
}
window.toggleCountryDropdown = toggleCountryDropdown;

function closeCountryDropdown() {
  const popover = document.getElementById('countryDropdownPopover');
  if (popover) popover.style.display = 'none';
}
window.closeCountryDropdown = closeCountryDropdown;

document.addEventListener('click', (e) => {
  const container = document.getElementById('langSelectorContainer');
  if (container && !container.contains(e.target)) {
    closeCountryDropdown();
  }
});

function selectCountryLanguage(lang) {
  const locale = I18N_LOCALES[lang] || I18N_LOCALES.th;
  const flagImg = document.getElementById('activeCountryFlag');
  const codeSpan = document.getElementById('activeCountryCode');
  if (flagImg) flagImg.src = locale.flag;
  if (codeSpan) codeSpan.textContent = locale.code;

  document.querySelectorAll('.country-opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  localStorage.setItem('dekthep_lang', lang);
  applyTranslations(lang);
  closeCountryDropdown();
  showToast(`เปลี่ยนภาษาเป็น ${locale.name} แล้ว`, 'info');
}
window.selectCountryLanguage = selectCountryLanguage;

function initCountryLanguage() {
  const savedLang = localStorage.getItem('dekthep_lang') || 'th';
  if (savedLang && I18N_LOCALES[savedLang]) {
    const locale = I18N_LOCALES[savedLang];
    const flagImg = document.getElementById('activeCountryFlag');
    const codeSpan = document.getElementById('activeCountryCode');
    if (flagImg) flagImg.src = locale.flag;
    if (codeSpan) codeSpan.textContent = locale.code;
    document.querySelectorAll('.country-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === savedLang);
    });
    applyTranslations(savedLang);
  }
}

// Initial setup
setupStoreEventListeners();
renderHomeCategoryShowcases();
renderProductsGrid();
if (typeof renderRecentPurchasesTicker === 'function') renderRecentPurchasesTicker();
checkAuthStatus();
loadSiteSettings();
initCountryLanguage();


window.toggleAccountPassword=function(btn){const input=btn.parentElement.querySelector('input');input.type=input.type==='password'?'text':'password';};
window.accountConnectDiscord=function(){window.location.href='/auth/discord';};
document.addEventListener('submit',async function(e){if(e.target.id!=='accountPasswordForm')return;e.preventDefault();const oldPassword=document.getElementById('accountOldPassword').value,newPassword=document.getElementById('accountNewPassword').value,confirmPassword=document.getElementById('accountConfirmPassword').value,msg=document.getElementById('accountPasswordMessage');if(newPassword!==confirmPassword){msg.textContent='รหัสผ่านใหม่ไม่ตรงกัน';msg.style.color='#ff7777';return;}try{const r=await fetch('/api/user/change-password',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({oldPassword,newPassword})});const d=await r.json();msg.textContent=d.message||d.error||'ไม่สามารถเปลี่ยนรหัสผ่านได้';msg.style.color=r.ok?'#6cdb9c':'#ff7777';if(r.ok)e.target.reset();}catch(err){msg.textContent='ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์';msg.style.color='#ff7777';}});
