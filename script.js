/* =============================================
   SANJEEV GROCERY SHOP — script.js
   Fully fixed & production-ready version
   ============================================= */

/* =============================================
   1. EMAILJS INITIALIZATION
   ============================================= */
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("QrMAP_4_PzVjydbq7");
  }
})();

/* =============================================
   2. PRODUCT DATA  (edit freely)
   ============================================= */
const products = [
  /* STAPLES */
  { id:1,  name:"Wheat Flour ( Atta )",      category:"staples",  emoji:"🌾", weight:"1 kg",    price:38, mrp:42, badge:"Popular"   },
  { id:2,  name:"Sugar ( Chinni )", category:"staples",  emoji:"🧁", weight:"1 kg",    price:52, mrp:60, badge:null        },
  { id:3,  name:"Tata salt",        category:"staples",  emoji:"🧂", weight:"1 kg",    price:30,  mrp:35,  badge:null        },
  { id:4,  name:"Gram flour (besan)",         category:"staples",  emoji:"🌾", weight:"1 pkt 250 g",    price:40,  mrp:45,  badge:null        },
  { id:5,  name:"Gram (chana)",       category:"staples",  emoji:"🌾", weight:"1 kg",     price:75, mrp:80, badge:"Organic"   },
  /* PULSES */
  { id:6, name:"Dal ( pulses )",   category:"pulses",   emoji:"🫘", weight:"1 kg",    price:80, mrp:85, badge:null        },
  { id:7, name:"Kabuli matar",      category:"pulses",   emoji:"⚪", weight:"1 kg",    price:80, mrp:85, badge:null        },
];

/* =============================================
   3. CART STATE  (persisted to localStorage)
   ============================================= */
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("sgs_cart")) || []; }
  catch { return []; }
}
function saveCart()        { localStorage.setItem("sgs_cart", JSON.stringify(cart)); }
function getProduct(id)    { return products.find(p => p.id === id); }
function getCartEntry(id)  { return cart.find(e => e.id === id); }
function cartItemCount()   { return cart.reduce((s, e) => s + e.qty, 0); }
function cartTotal()       { return cart.reduce((s, e) => { const p = getProduct(e.id); return s + (p ? p.price * e.qty : 0); }, 0); }

/* =============================================
   4. CART MUTATIONS
   ============================================= */
function addToCart(id, qty) {
  qty = qty || 1;
  const entry = getCartEntry(id);
  if (entry) { entry.qty += qty; }
  else        { cart.push({ id, qty }); }
  saveCart();
  updateCartBadges();
}

function removeFromCart(id) {
  cart = cart.filter(e => e.id !== id);
  saveCart();
  updateCartBadges();
  renderCartItems();
}

function changeCartQty(id, delta) {
  const entry = getCartEntry(id);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) { removeFromCart(id); return; }
  saveCart();
  updateCartBadges();
  renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartBadges();
  renderCartItems();
}

/* =============================================
   5. CART BADGE UPDATE
   ============================================= */
function updateCartBadges() {
  const count = cartItemCount();
  const total = cartTotal();

  /* nav badge */
  const navBadge = document.getElementById("cartCount");
  if (navBadge) {
    navBadge.textContent = count;
    navBadge.classList.toggle("show", count > 0);
  }

  /* floating badge */
  const floatBadge = document.getElementById("floatingCartCount");
  if (floatBadge) {
    floatBadge.textContent = count;
    floatBadge.classList.toggle("show", count > 0);
  }

  /* total label inside drawer */
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = "₹" + total.toFixed(2);
}

/* =============================================
   6. RENDER CART ITEMS
   ============================================= */
function renderCartItems() {
  const body = document.getElementById("cartBody");
  if (!body) return;

  /* update total every render */
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = "₹" + cartTotal().toFixed(2);

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some fresh organic products to get started!</p>
      </div>`;
    return;
  }

  body.innerHTML = cart.map(entry => {
    const p = getProduct(entry.id);
    if (!p) return "";
    const lineTotal = (p.price * entry.qty).toFixed(2);
    return `
      <div class="cart-item" data-id="${p.id}">
        <div class="cart-item-emoji">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">₹${p.price} / ${p.weight}</div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" data-action="dec" data-id="${p.id}" aria-label="Decrease">−</button>
            <span class="cart-qty-num">${entry.qty}</span>
            <button class="cart-qty-btn" data-action="inc" data-id="${p.id}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="cart-item-total">₹${lineTotal}</div>
        <button class="cart-remove" data-action="remove" data-id="${p.id}" aria-label="Remove">✕</button>
      </div>`;
  }).join("");
}

/* =============================================
   7. CART OPEN / CLOSE
   ============================================= */
function openCart() {
  const drawer  = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer)  drawer.classList.add("open");
  if (overlay) overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  renderCartItems();
  updateCartBadges();
}

function closeCart() {
  const drawer  = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer)  drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

/* =============================================
   8. PRODUCT CARD QUANTITY SELECTORS
   ============================================= */
const productQty = {};  /* { [id]: qty shown on card } */

function getProductQty(id) { return productQty[id] || 1; }

function changeProductQty(id, delta) {
  productQty[id] = Math.max(1, getProductQty(id) + delta);
  const el = document.getElementById("qty-" + id);
  if (el) el.textContent = productQty[id];
}

function handleAddToCart(id) {
  const qty = getProductQty(id);
  addToCart(id, qty);
  const btn = document.getElementById("addbtn-" + id);
  if (btn) {
    btn.textContent = "✓ Added!";
    btn.classList.add("added");
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = "🛒 Add to Cart";
      btn.classList.remove("added");
      btn.disabled = false;
    }, 1200);
  }
}

/* =============================================
   9. RENDER PRODUCTS
   ============================================= */
const categoryLabels = {
  staples:"Staples", dairy:"Dairy & Eggs", pulses:"Pulses",
  spices:"Spices",   fruits:"Fruits & Veg", organic:"Organic",
  personal:"Personal Care"
};

function renderProducts(category) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const list = category === "all"
    ? products
    : products.filter(p => p.category === category);

  grid.innerHTML = list.map((p, i) => `
    <div class="product-card reveal" style="animation-delay:${i * 0.05}s">
      <div class="product-img">
        <span>${p.emoji}</span>
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
      </div>
      <div class="product-body">
        <div class="product-category">${categoryLabels[p.category] || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-weight">${p.weight}</div>
        <div class="product-price">
          ₹${p.price}
          ${p.mrp ? `<span>₹${p.mrp}</span>` : ""}
        </div>
        <div class="product-controls">
          <button class="qty-btn" data-card-id="${p.id}" data-card-action="dec" aria-label="Decrease">−</button>
          <span class="qty-display" id="qty-${p.id}">${getProductQty(p.id)}</span>
          <button class="qty-btn" data-card-id="${p.id}" data-card-action="inc" aria-label="Increase">+</button>
        </div>
        <button class="add-cart-btn" id="addbtn-${p.id}" data-add-id="${p.id}">
          🛒 Add to Cart
        </button>
      </div>
    </div>`).join("");

  /* re-observe newly created cards */
  requestAnimationFrame(observeReveal);
}

/* =============================================
   10. CATEGORY FILTER BAR
   ============================================= */
function initFilterBar() {
  const bar = document.getElementById("filterBar");
  if (!bar) return;
  bar.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    bar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.category);
  });
}

/* =============================================
   11. DELEGATED CLICK HANDLERS
   (one listener on document handles all dynamic buttons)
   ============================================= */
function initDelegatedClicks() {

  /* product grid: qty +/− and add-to-cart */
  document.addEventListener("click", e => {
    /* qty buttons on product cards */
    const cardBtn = e.target.closest("[data-card-id]");
    if (cardBtn) {
      const id     = parseInt(cardBtn.dataset.cardId);
      const action = cardBtn.dataset.cardAction;
      if (action === "inc") changeProductQty(id, +1);
      if (action === "dec") changeProductQty(id, -1);
      return;
    }

    /* add-to-cart buttons */
    const addBtn = e.target.closest("[data-add-id]");
    if (addBtn) {
      handleAddToCart(parseInt(addBtn.dataset.addId));
      return;
    }

    /* cart drawer: inc / dec / remove */
    const cartQtyBtn = e.target.closest("[data-action][data-id]");
    if (cartQtyBtn) {
      const id     = parseInt(cartQtyBtn.dataset.id);
      const action = cartQtyBtn.dataset.action;
      if (action === "inc")    changeCartQty(id, +1);
      if (action === "dec")    changeCartQty(id, -1);
      if (action === "remove") removeFromCart(id);
    }
  });
}

/* =============================================
   12. CART DRAWER EVENT LISTENERS
   ============================================= */
function initCartListeners() {
  /* open */
  document.getElementById("cartBtn")      ?.addEventListener("click", openCart);
  document.getElementById("floatingCart") ?.addEventListener("click", openCart);

  /* close */
  document.getElementById("cartClose")    ?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")  ?.addEventListener("click", closeCart);

  /* escape key */
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

  /* clear cart */
  document.getElementById("clearCartBtn")?.addEventListener("click", () => {
    if (cart.length === 0) { showMsg("error","Cart is already empty!"); return; }
    if (confirm("Clear all items from your cart?")) clearCart();
  });

  /* place order via email */
  document.getElementById("sendEmailBtn")?.addEventListener("click", handleEmailOrder);

  /* place order via whatsapp */
  document.getElementById("sendWhatsAppBtn")?.addEventListener("click", handleWhatsAppOrder);
}

/* =============================================
   13. FORM VALIDATION
   ============================================= */
function validateForm() {
  const name  = document.getElementById("custName");
  const phone = document.getElementById("custPhone");
  let   err   = null;

  if (!name?.value.trim()) {
    err = "Please enter your full name.";
    name?.classList.add("error");
    name?.addEventListener("input", () => name.classList.remove("error"), { once:true });
  }

  if (!phone?.value.trim()) {
    if (!err) err = "Please enter your phone number.";
    phone?.classList.add("error");
    phone?.addEventListener("input", () => phone.classList.remove("error"), { once:true });
  }

  if (cart.length === 0) {
    err = err || "Your cart is empty. Please add items first.";
  }

  return err;   /* null = valid */
}

/* =============================================
   14. ORDER MESSAGE DISPLAY
   ============================================= */
function showMsg(type, text) {
  const el = document.getElementById("orderMessage");
  if (!el) return;
  el.className  = "order-message " + type;
  el.textContent = text;
  el.scrollIntoView({ behavior:"smooth", block:"nearest" });
  if (type === "success") {
    setTimeout(() => { el.className = "order-message"; el.textContent = ""; }, 6000);
  }
}

/* =============================================
   15. BUILD ORDER STRINGS
   ============================================= */
function buildOrderList() {
  return cart.map(e => {
    const p = getProduct(e.id);
    return p ? `• ${p.name} (${p.weight}) x${e.qty} = Rs.${(p.price * e.qty).toFixed(2)}` : "";
  }).filter(Boolean).join("\n");
}

function getNow() {
  return new Date().toLocaleString("en-IN", { dateStyle:"long", timeStyle:"short" });
}

/* =============================================
   16. EMAIL ORDER (EmailJS)
   ============================================= */
function handleEmailOrder() {
  const err = validateForm();
  if (err) { showMsg("error", err); return; }

  const name    = document.getElementById("custName").value.trim();
  const phone   = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim() || "Not provided";
  const notes   = document.getElementById("custNotes").value.trim()   || "None";
  const list    = buildOrderList();
  const total   = "Rs." + cartTotal().toFixed(2);
  const dt      = getNow();

  const params = {
    to_email:         "sanjeevkumaronly94@gmail.com",
    customer_name:    name,
    customer_phone:   phone,
    customer_address: address,
    order_notes:      notes,
    order_datetime:   dt,
    product_list:     list,
    grand_total:      total,
    order_summary:
      `Customer: ${name}\nPhone: ${phone}\nAddress: ${address}\nNotes: ${notes}\nDate: ${dt}\n\nItems:\n${list}\n\nTotal: ${total}`,
  };

  const btn = document.getElementById("sendEmailBtn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Sending…"; }

  if (typeof emailjs === "undefined") {
    showMsg("error", "❌ EmailJS not loaded. Please try WhatsApp instead.");
    if (btn) { btn.disabled = false; btn.textContent = "📧 Place Order via Email"; }
    return;
  }

  emailjs.send("service_t4y51zn", "template_so5hat9", params)
    .then(() => {
      showMsg("success", `✅ Order placed! We'll contact you on ${phone} shortly.`);
      clearCart();
      ["custName","custPhone","custAddress","custNotes"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    })
    .catch(err => {
      console.error("EmailJS error:", err);
      showMsg("error", "❌ Email failed. Please try WhatsApp or call us directly.");
    })
    .finally(() => {
      if (btn) { btn.disabled = false; btn.textContent = "📧 Place Order via Email"; }
    });
}

/* =============================================
   17. WHATSAPP ORDER
   ============================================= */
function handleWhatsAppOrder() {
  const err = validateForm();
  if (err) { showMsg("error", err); return; }

  const name    = document.getElementById("custName").value.trim();
  const phone   = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim() || "Not provided";
  const notes   = document.getElementById("custNotes").value.trim()   || "None";
  const total   = "Rs." + cartTotal().toFixed(2);

  const msg = [
    "🌿 *New Order - Sanjeev Grocery Shop*",
    "─────────────────────────",
    `👤 *Customer:* ${name}`,
    `📞 *Phone:* ${phone}`,
    `🏠 *Address:* ${address}`,
    `📝 *Notes:* ${notes}`,
    `🕐 *Date & Time:* ${getNow()}`,
    "─────────────────────────",
    "🛒 *Order Items:*",
    ...cart.map(e => {
      const p = getProduct(e.id);
      return p ? `  ${p.emoji} ${p.name} (${p.weight}) x${e.qty} = Rs.${(p.price*e.qty).toFixed(2)}` : "";
    }),
    "─────────────────────────",
    `💰 *Grand Total: ${total}*`,
    "─────────────────────────",
    "Thank you for your order! 🙏",
  ].join("\n");

  window.open("https://wa.me/917043873494?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
}

/* =============================================
   18. NAVBAR — scroll shadow + active links
   ============================================= */
function initNavbar() {
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 40);
    highlightNavLink();
  });

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks?.classList.toggle("open");
  });

  navLinks?.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      hamburger?.classList.remove("active");
      navLinks?.classList.remove("open");
    });
  });
}

function highlightNavLink() {
  const sections = ["home","products","about","contact"];
  let current = "home";
  sections.forEach(id => {
    const s = document.getElementById(id);
    if (s && s.getBoundingClientRect().top <= 120) current = id;
  });
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}

/* =============================================
   19. SMOOTH SCROLL
   ============================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navH, behavior:"smooth" });
    });
  });
}

/* =============================================
   20. SCROLL REVEAL
   ============================================= */
let revealObserver;

function observeReveal() {
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); revealObserver.unobserve(en.target); } });
      }, { threshold:0.1, rootMargin:"0px 0px -40px 0px" });
    }
    revealObserver.observe(el);
  });
}

function tagRevealElements() {
  [".about-grid > *", ".contact-grid > *", ".footer-grid > *", ".section-header"].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add("reveal"));
  });
}

/* =============================================
   21. DOMContentLoaded — BOOT
   ============================================= */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initSmoothScroll();
  initFilterBar();
  initCartListeners();      /* ← was missing before; fixes cart open/close */
  initDelegatedClicks();    /* ← handles all dynamic card & cart buttons */
  tagRevealElements();
  renderProducts("all");
  updateCartBadges();
  observeReveal();

  console.log("%c🌿 Sanjeev Grocery Shop ready!", "color:#2d8a47;font-weight:bold;font-size:14px;");
});
