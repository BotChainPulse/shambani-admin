/**
 * ShambaNi Marketplace - Shared JavaScript
 * Handles: Cart, Language Switcher, Mobile Menu, Navigation, Common UI
 */

// ===== CART SYSTEM =====
const Cart = {
  items: JSON.parse(localStorage.getItem('shambani_cart') || '[]'),

  save() {
    localStorage.setItem('shambani_cart', JSON.stringify(this.items));
    this.updateUI();
  },

  add(product) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, qty: product.qty || 1 });
    }
    this.save();
    this.showNotification(`${product.name} added to cart!`);
  },

  remove(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
  },

  updateQty(id, qty) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save();
    }
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  getPlatformFee() {
    return this.getTotal() * 0.025;
  },

  getGrandTotal() {
    return this.getTotal() + this.getPlatformFee();
  },

  clear() {
    this.items = [];
    this.save();
  },

  updateUI() {
    // Update cart count badges
    document.querySelectorAll('.cart-count').forEach(el => {
      const count = this.getCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });

    // Update cart buttons text if on cart page
    const cartBtn = document.getElementById('nav-cart-btn');
    if (cartBtn) {
      cartBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Cart (${this.getCount()})`;
    }
  },

  showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed; top: 90px; right: 20px; z-index: 10000;
      background: linear-gradient(135deg, #2E7D32, #4CAF50);
      color: white; padding: 14px 22px; border-radius: 10px;
      font-weight: 600; font-size: 0.9rem; box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
    `;
    notif.innerHTML = `<i class="fas fa-check-circle" style="margin-right:8px"></i>${message}`;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 2500);
  },

  renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon"><i class="fas fa-shopping-basket"></i></div>
          <h3>Your cart is empty</h3>
          <p>Browse our fresh produce and add items to your cart.</p>
          <a href="./browse.html" class="btn btn-primary"><i class="fas fa-search"></i> Browse Produce</a>
        </div>
      `;
      if (summaryContainer) summaryContainer.style.display = 'none';
      return;
    }

    if (summaryContainer) summaryContainer.style.display = 'block';
    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image" style="background: ${item.bg || 'linear-gradient(135deg, #4CAF50, #2E7D32)'};">
          <i class="fas fa-${item.icon || 'leaf'}"></i>
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>${item.farmer || 'ShambaNi Farmer'} &middot; ${item.unit || 'each'}</p>
        </div>
        <div class="cart-item-qty">
          <button onclick="Cart.updateQty('${item.id}', ${item.qty - 1}); Cart.renderCartPage();"><i class="fas fa-minus"></i></button>
          <span style="font-weight:700;width:30px;text-align:center;">${item.qty}</span>
          <button onclick="Cart.updateQty('${item.id}', ${item.qty + 1}); Cart.renderCartPage();"><i class="fas fa-plus"></i></button>
        </div>
        <div class="cart-item-price">UGX ${(item.price * item.qty).toLocaleString()}</div>
        <button class="cart-item-remove" onclick="Cart.remove('${item.id}'); Cart.renderCartPage();"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');

    // Update summary
    const subtotal = this.getTotal();
    const fee = this.getPlatformFee();
    const total = this.getGrandTotal();

    const subtotalEl = document.getElementById('summary-subtotal');
    const feeEl = document.getElementById('summary-fee');
    const totalEl = document.getElementById('summary-total');
    if (subtotalEl) subtotalEl.textContent = `UGX ${subtotal.toLocaleString()}`;
    if (feeEl) feeEl.textContent = `UGX ${fee.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `UGX ${total.toLocaleString()}`;
  },

  getCheckoutData() {
    return {
      items: [...this.items],
      subtotal: this.getTotal(),
      platformFee: this.getPlatformFee(),
      total: this.getGrandTotal()
    };
  }
};

// ===== LANGUAGE SWITCHER =====
const Languages = {
  current: localStorage.getItem('shambani_lang') || 'en',

  data: {
    en: {
      name: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7',
      nav: { home: 'Home', browse: 'Browse', ussd: 'USSD', about: 'About', register: 'Sell', admin: 'Admin', cart: 'Cart' },
      hero: { badge: 'Connecting Farmers to Buyers', title: 'Fresh From the Farm', subtitle: 'to Your Table', desc: 'Buy and sell fresh produce directly from farmers across East Africa. No middlemen, fair prices, farm-fresh quality.', cta1: 'Browse Produce', cta2: 'Register as Farmer' },
      stats: { farmers: 'Active Farmers', districts: 'Districts Covered', countries: 'Countries', orders: 'Orders Delivered' },
      categories: 'Browse by Category', howItWorks: 'How It Works', testimonials: 'What Farmers & Buyers Say',
      ussd: { title: 'No Smartphone? No Problem!', desc: 'Dial *220# to buy or sell produce using any mobile phone. Works on all networks across East Africa.', cta: 'Learn More' },
      footer: { tagline: 'Connecting farmers to buyers across East Africa.', links: 'Quick Links', support: 'Support', contact: 'Contact' },
      browse: { title: 'Browse Fresh Produce', searchPlaceholder: 'Search produce, farmers, districts...', filterAll: 'All' },
      cart: { title: 'Shopping Cart', empty: 'Your cart is empty', checkout: 'Proceed to Checkout', summary: 'Order Summary' },
      about: { title: 'About ShambaNi', mission: 'Our Mission' },
      product: { quantity: 'Quantity', addToCart: 'Add to Cart', farmer: 'Farmer', related: 'Related Products' },
      farmerReg: { title: 'Register as a Farmer', step1: 'Personal Info', step2: 'Farm Details', step3: 'Payment', step4: 'Review' }
    },
    sw: {
      name: 'Kiswahili', flag: '\uD83C\uDDF0\uD83C\uDDEA',
      nav: { home: 'Nyumbani', browse: 'Vinjari', ussd: 'USSD', about: 'Kuhusu', register: 'Uza', admin: 'Admin', cart: 'Kikapu' },
      hero: { badge: 'Kuunganisha Wakulima na Wanunuzi', title: 'Fresh Kutoka Shambani', subtitle: 'had Mezani Pako', desc: 'Nunua na uza mazao mpya moja kwa moja kutoka kwa wakulima kote Afrika Mashariki.', cta1: 'Vinjari Mazao', cta2: 'Jiandikishe kama Mkulima' },
      stats: { farmers: 'Wakulima Hai', districts: 'Wilaya', countries: 'Nchi', orders: 'Maagizo' },
      categories: 'Vinjari kwa Kategoria', howItWorks: 'Jinsi Inavyofanya Kazi', testimonials: 'Wakulima & Wanunuzi Wanachosema',
      ussd: { title: 'Hakuna Simu Janja? Hakuna Shida!', desc: 'Piga *220# kununua au kuza mazao kwa kutumia simu yoyote.', cta: 'Jifunze Zaidi' },
      footer: { tagline: 'Kuunganisha wakulima na wanunuzi kote Afrika Mashariki.', links: 'Viungo', support: 'Msaada', contact: 'Mawasiliano' },
      browse: { title: 'Vinjari Mazao Mpya', searchPlaceholder: 'Tafuta mazao, wakulima...', filterAll: 'Yote' },
      cart: { title: 'Kikapu cha Manunuzi', empty: 'Kikapu chako ni tupu', checkout: 'Endelea na Kulipa', summary: 'Muhtasari wa Agizo' },
      about: { title: 'Kuhusu ShambaNi', mission: 'Dhamira Yetu' },
      product: { quantity: 'Kiasi', addToCart: 'Ongeza kwenye Kikapu', farmer: 'Mkulima', related: 'Mazao Yanayohusiana' },
      farmerReg: { title: 'Jiandikishe kama Mkulima', step1: 'Maelezo Binafsi', step2: 'Maelezo ya Shamba', step3: 'Malipo', step4: 'Kagua' }
    },
    rw: {
      name: 'Runyarwanda', flag: '\uD83C\uDDF7\uD83C\uDDFC',
      nav: { home: 'Ahabanza', browse: 'Shakisha', ussd: 'USSD', about: 'Ibihande', register: 'Kugurisha', admin: 'Admin', cart: 'Igare' },
      hero: { badge: 'Guhuza Abahinzi n\'Abaguzi', title: 'Biva mu Gihingwa', subtitle: 'kugera ku Meza yawe', desc: 'Gura cg kugurisha ibihingwa by\'umwihariko bivuye ku bahinzi bose mu Burasirazuba bwa Afrika.', cta1: 'Shakisha Ibihingwa', cta2: 'Iyandikishe nk\'Umuhinzi' },
      stats: { farmers: 'Abahinzi', districts: 'Uturere', countries: 'Ibihugu', orders: 'Ibicuruzwa' },
      categories: 'Shakisha uburyo', howItWorks: 'Uko Bikora', testimonials: 'Ibyo Abahinzi & Abaguzi Bavuga',
      ussd: { title: 'Nta Telefoni Nziza? Ntakibazo!', desc: 'Amagara *220# kugura cg kugurisha ibihingwa ukoresha terefoni yose.', cta: 'Menya Byinshi' },
      footer: { tagline: 'Guhuza abahinzi n\'abaguzi mu Burasirazuba bwa Afrika.', links: 'Amahuza', support: 'Ubufasha', contact: 'Aderesi' },
      browse: { title: 'Shakisha Ibihingwa', searchPlaceholder: 'Shakisha ibihingwa...', filterAll: 'Byose' },
      cart: { title: 'Igare', empty: 'Igare ryawe riri mo ubusa', checkout: 'Komeza Kwishyura', summary: 'Incamake' },
      about: { title: 'Ibihande bya ShambaNi', mission: 'Intego Yacu' },
      product: { quantity: 'Ingano', addToCart: 'Ongera mu Igare', farmer: 'Umuhinzi', related: 'Ibihingwa Bihuje' },
      farmerReg: { title: 'Iyandikishe nk\'Umuhinzi', step1: 'Amakuru Yawe', step2: 'Amakuru y\'Ikigunda', step3: 'Kwishyura', step4: 'Kugenzura' }
    },
    lg: {
      name: 'Luganda', flag: '\uD83C\uDDFA\uD83C\uDDEC',
      nav: { home: 'Ewaka', browse: 'Noonya', ussd: 'USSD', about: 'Ebifa', register: 'Okutunda', admin: 'Admin', cart: 'Enteekateeka' },
      hero: { badge: 'Okugatta Abalimi n\'Abaguzi', title: 'Ebibya mu Kiwewe', subtitle: 'okutuuka ku Meza yo', desc: 'Gula oba okutunda ebibye mu kiwewe okuva ku balimi mu East Africa yonna.', cta1: 'Noonya Ebiwewe', cta2: 'Wewandise ng\'Omulimi' },
      stats: { farmers: 'Abalimi', districts: 'Districts', countries: 'Ensi', orders: 'Ebitalidwa' },
      categories: 'Noonya mu Byawula', howItWorks: 'Engeri Gy\'Ekola', testimonials: 'Ekyogamba Abalimi & Abaguzi',
      ussd: { title: 'Tolina Smart Phone? Tewali Wabula!', desc: 'Dayila *220# okugula oba okutunda ebikolo mu terefoni yonna.', cta: 'Manya Ebisingawo' },
      footer: { tagline: 'Okugatta abalimi n\'abaguzi mu East Africa yonna.', links: 'Links', support: 'Obuyambi', contact: 'Endagiriro' },
      browse: { title: 'Noonya Ebibya mu Kiwewe', searchPlaceholder: 'Noonya ebikolo, abalimi...', filterAll: 'Byonna' },
      cart: { title: 'Enteekateeka', empty: 'Enteekateeka yo ejje', checkout: 'Genda Ku Cash', summary: 'Okubala' },
      about: { title: 'Ebifa ku ShambaNi', mission: 'Ekigendererwa Kyaffe' },
      product: { quantity: 'Omuwendo', addToCart: 'Gatta mu Nteekateeka', farmer: 'Omulimi', related: 'Ebirala' },
      farmerReg: { title: 'Wewandise ng\'Omulimi', step1: 'Ebikukwatako', step2: 'Ekikwegatta', step3: 'Ssente', step4: 'Kebera' }
    }
  },

  init() {
    const langBtn = document.querySelector('.lang-btn');
    const langDropdown = document.querySelector('.lang-dropdown');
    if (langBtn && langDropdown) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
      });
      document.addEventListener('click', () => langDropdown.classList.remove('show'));
      langDropdown.addEventListener('click', (e) => e.stopPropagation());

      // Mark active language
      langDropdown.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.current);
        btn.addEventListener('click', () => this.switch(btn.dataset.lang));
      });

      // Update button display
      const lang = this.data[this.current];
      if (lang) {
        const flagSpan = langBtn.querySelector('.flag-icon');
        const codeSpan = langBtn.querySelector('.lang-code');
        if (flagSpan) flagSpan.textContent = lang.flag;
        if (codeSpan) codeSpan.textContent = this.current.toUpperCase();
      }
    }
  },

  switch(langCode) {
    this.current = langCode;
    localStorage.setItem('shambani_lang', langCode);
    location.reload();
  },

  t(key, subkey) {
    const lang = this.data[this.current] || this.data.en;
    return lang[key]?.[subkey] || this.data.en[key]?.[subkey] || key;
  }
};

// ===== MOBILE MENU =====
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      menuBtn.innerHTML = mobileNav.classList.contains('open')
        ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

// ===== NAVBAR ACTIVE LINK =====
function setActiveNavLink() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    }
  });
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }
    });
  }

  // Fade in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.category-card, .step-card, .testimonial-card, .product-card, .coverage-card, .mission-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ===== PAYMENT METHOD SELECTION =====
function initPaymentMethods() {
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
      method.classList.add('selected');
      const radio = method.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

// ===== ACCORDION =====
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      // Close all in same parent
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'linear-gradient(135deg, #2E7D32, #4CAF50)' :
             type === 'error' ? 'linear-gradient(135deg, #c62828, #E53935)' :
             'linear-gradient(135deg, #F57C00, #FFB74D)';
  toast.style.cssText = `
    position: fixed; top: 90px; right: 20px; z-index: 10000;
    background: ${bg}; color: white; padding: 14px 22px; border-radius: 10px;
    font-weight: 600; font-size: 0.9rem; box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
  `;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  toast.innerHTML = `<i class="fas fa-${icon}" style="margin-right:8px"></i>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== CSS ANIMATIONS INJECT =====
function injectAnimations() {
  if (document.getElementById('shambani-animations')) return;
  const style = document.createElement('style');
  style.id = 'shambani-animations';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100px); opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  injectAnimations();
  Cart.updateUI();
  Languages.init();
  initMobileMenu();
  setActiveNavLink();
  initScrollEffects();
  initPaymentMethods();
  initAccordions();
});

// Expose globals
window.Cart = Cart;
window.Languages = Languages;
window.showToast = showToast;
