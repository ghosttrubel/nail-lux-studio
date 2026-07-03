// ==========================================================
// ELEMENTS
// ==========================================================

const cartButtons = document.querySelectorAll(".cart-btn");
const wishlistButtons = document.querySelectorAll(".wishlist-btn");

const cartIcon = document.querySelector(".cart-icon");
const wishlistToggle = document.getElementById("wishlist-toggle");

const cartSidebar = document.getElementById("cart-sidebar");
const wishlistSidebar = document.getElementById("wishlist-sidebar");
const cartOverlay = document.getElementById("cart-overlay");

const closeCartBtn = document.getElementById("close-cart");
const closeWishlistBtn = document.getElementById("close-wishlist");

const cartItemsEl = document.getElementById("cart-items");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const discountRow = document.getElementById("discount-row");
const cartDiscountEl = document.getElementById("cart-discount");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");

const promoInput = document.getElementById("promo-code");
const applyPromoBtn = document.getElementById("apply-promo");
const promoMessage = document.getElementById("promo-message");

const wishlistItemsEl = document.getElementById("wishlist-items");
const wishlistCountEl = document.getElementById("wishlist-count");

const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

const searchToggle = document.getElementById("search-toggle");
const searchInput = document.getElementById("search");

// ==========================================================
// STATE
// ==========================================================

let cart = [];       // { name, price, qty }
let wishlist = [];    // { name, price }
let appliedPromo = null; // { code, rate }

// Demo promo codes — client-side only. Move this to your backend
// once orders are processed server-side, so codes can't be read
// from the page source.
const PROMO_CODES = {
    NAILS10: 0.10,
    WELCOME15: 0.15
};

// ==========================================================
// PANEL (CART / WISHLIST SIDEBAR) CONTROLS
// ==========================================================

function closeAllPanels(){
    if(cartSidebar) cartSidebar.classList.remove("active");
    if(wishlistSidebar) wishlistSidebar.classList.remove("active");
    if(cartOverlay) cartOverlay.classList.remove("active");
}

function openCart(){
    closeAllPanels();
    if(!cartSidebar) return;
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
}

function openWishlist(){
    closeAllPanels();
    if(!wishlistSidebar) return;
    wishlistSidebar.classList.add("active");
    cartOverlay.classList.add("active");
}

if(cartIcon){
    cartIcon.addEventListener("click", () => {
        cartSidebar.classList.contains("active") ? closeAllPanels() : openCart();
    });
}

if(wishlistToggle){
    wishlistToggle.addEventListener("click", () => {
        wishlistSidebar.classList.contains("active") ? closeAllPanels() : openWishlist();
    });
}

if(closeCartBtn) closeCartBtn.addEventListener("click", closeAllPanels);
if(closeWishlistBtn) closeWishlistBtn.addEventListener("click", closeAllPanels);
if(cartOverlay) cartOverlay.addEventListener("click", closeAllPanels);

// ==========================================================
// CART: ADD / CHANGE QTY / REMOVE / RENDER
// ==========================================================

function addToCart(name, price){
    const existing = cart.find(item => item.name === name);

    if(existing){
        existing.qty++;
    }else{
        cart.push({ name, price, qty: 1 });
    }

    renderCart();
    updateInCartNotes();
}

function changeQty(name, delta){
    const item = cart.find(i => i.name === name);
    if(!item) return;

    item.qty += delta;

    if(item.qty <= 0){
        cart = cart.filter(i => i.name !== name);
    }

    renderCart();
    updateInCartNotes();
}

function removeFromCart(name){
    cart = cart.filter(i => i.name !== name);
    renderCart();
    updateInCartNotes();
}

function renderCart(){
    if(cart.length === 0){
        cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    }else{
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <p>${item.name}</p>
                    <strong>₦${item.price.toLocaleString()}</strong>
                </div>
                <div class="qty-stepper">
                    <button class="qty-btn" data-action="dec" data-name="${item.name}" aria-label="Decrease quantity of ${item.name}">&minus;</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-action="inc" data-name="${item.name}" aria-label="Increase quantity of ${item.name}">+</button>
                </div>
                <button class="remove-item" data-name="${item.name}" aria-label="Remove ${item.name} from cart">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join("");

        cartItemsEl.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                changeQty(btn.dataset.name, btn.dataset.action === "inc" ? 1 : -1);
            });
        });

        cartItemsEl.querySelectorAll(".remove-item").forEach(btn => {
            btn.addEventListener("click", () => removeFromCart(btn.dataset.name));
        });
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = appliedPromo ? subtotal * appliedPromo.rate : 0;
    const total = subtotal - discount;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    cartSubtotalEl.textContent = `₦${subtotal.toLocaleString()}`;

    if(discount > 0){
        discountRow.hidden = false;
        cartDiscountEl.textContent = `-₦${discount.toLocaleString()}`;
    }else{
        discountRow.hidden = true;
    }

    cartTotalEl.textContent = total.toLocaleString();
    cartCountEl.textContent = totalQty;
}

function updateInCartNotes(){
    document.querySelectorAll(".service-card").forEach(card => {
        const btn = card.querySelector(".cart-btn");
        const note = card.querySelector(".in-cart-note");
        if(!btn || !note) return;

        const item = cart.find(i => i.name === btn.dataset.name);
        note.textContent = item ? `In cart: \u00d7${item.qty}` : "";
    });
}

cartButtons.forEach(button => {
    button.addEventListener("click", () => {
        addToCart(button.dataset.name, Number(button.dataset.price));
        openCart();
    });
});

// ==========================================================
// PROMO CODE
// ==========================================================

if(applyPromoBtn){
    applyPromoBtn.addEventListener("click", () => {
        const code = promoInput.value.trim().toUpperCase();

        if(!code){
            promoMessage.textContent = "Enter a code to apply.";
            promoMessage.className = "promo-message error";
            return;
        }

        if(PROMO_CODES[code]){
            appliedPromo = { code, rate: PROMO_CODES[code] };
            promoMessage.textContent = `"${code}" applied \u2014 ${PROMO_CODES[code] * 100}% off.`;
            promoMessage.className = "promo-message success";
        }else{
            appliedPromo = null;
            promoMessage.textContent = "That code isn't valid.";
            promoMessage.className = "promo-message error";
        }

        renderCart();
    });
}

// ==========================================================
// WISHLIST
// ==========================================================

function setWishlistButtonState(name, active){
    const btn = document.querySelector(`.wishlist-btn[data-name="${CSS.escape(name)}"]`);
    if(!btn) return;

    const icon = btn.querySelector("i");
    btn.classList.toggle("active", active);
    icon.classList.toggle("fa-solid", active);
    icon.classList.toggle("fa-regular", !active);
}

wishlistButtons.forEach(button => {
    button.addEventListener("click", () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        const existingIndex = wishlist.findIndex(i => i.name === name);

        if(existingIndex > -1){
            wishlist.splice(existingIndex, 1);
            setWishlistButtonState(name, false);
        }else{
            wishlist.push({ name, price });
            setWishlistButtonState(name, true);
        }

        renderWishlist();
    });
});

function removeFromWishlist(name){
    wishlist = wishlist.filter(i => i.name !== name);
    setWishlistButtonState(name, false);
    renderWishlist();
}

function renderWishlist(){
    if(!wishlistItemsEl) return;

    if(wishlist.length === 0){
        wishlistItemsEl.innerHTML = `<p class="cart-empty">Your wishlist is empty.</p>`;
    }else{
        wishlistItemsEl.innerHTML = wishlist.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <p>${item.name}</p>
                    <strong>₦${item.price.toLocaleString()}</strong>
                </div>
                <div class="wishlist-actions">
                    <button class="move-to-cart" data-name="${item.name}" data-price="${item.price}" aria-label="Move ${item.name} to cart">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button class="remove-item" data-name="${item.name}" aria-label="Remove ${item.name} from wishlist">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join("");

        wishlistItemsEl.querySelectorAll(".move-to-cart").forEach(btn => {
            btn.addEventListener("click", () => {
                addToCart(btn.dataset.name, Number(btn.dataset.price));
                removeFromWishlist(btn.dataset.name);
                openCart();
            });
        });

        wishlistItemsEl.querySelectorAll(".remove-item").forEach(btn => {
            btn.addEventListener("click", () => removeFromWishlist(btn.dataset.name));
        });
    }

    if(wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
}

// ==========================================================
// SEARCH SERVICES
// ==========================================================

if(searchInput){
    const cards = document.querySelectorAll(".service-card");

    searchInput.addEventListener("keyup", () => {
        const value = searchInput.value.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            card.style.display = title.includes(value) ? "" : "none";
        });
    });
}

if(searchToggle && searchInput){
    searchToggle.addEventListener("click", () => {
        document.getElementById("services").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => searchInput.focus(), 500);
    });
}

// ==========================================================
// MOBILE NAV
// ==========================================================

if(navToggle && navMenu){
    navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("active");
        navToggle.classList.toggle("active");
        navToggle.setAttribute("aria-expanded", isOpen);
    });

    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            navToggle.classList.remove("active");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

// ==========================================================
// SCROLL REVEAL
// ==========================================================

const revealEls = document.querySelectorAll(".service-card, .feature-box, .testimonial, .member");

if(revealEls.length){
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
}

// ==========================================================
// HERO VIDEO — respect reduced motion, fall back to poster
// ==========================================================

const heroVideo = document.querySelector(".hero-video");

if(heroVideo){
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if(prefersReducedMotion){
        heroVideo.pause();
        heroVideo.setAttribute("hidden", "");
    }

    // If the video file hasn't been added yet (or fails to load),
    // hide the <video> element so the poster/background image shows instead.
    heroVideo.addEventListener("error", () => heroVideo.setAttribute("hidden", ""));
}

// ==========================================================
// ACCOUNTS (Log In / Sign Up)
// ==========================================================
// TEMPORARY: accounts are stored in this browser only (localStorage),
// as a stand-in until Nail Lux Studio has a real backend/database.
// To connect a real backend later, replace the four Auth methods
// below with fetch() calls to your API (e.g. POST /api/auth/register,
// POST /api/auth/login) — everything else that calls Auth.register(),
// Auth.login(), Auth.logout() and Auth.getCurrentUser() keeps working
// unchanged.

const AUTH_USERS_KEY = "nlx_users";
const AUTH_SESSION_KEY = "nlx_session";

const Auth = {
    getUsers(){
        return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || "[]");
    },

    saveUsers(users){
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    },

    register(name, email, password){
        const users = this.getUsers();

        if(users.find(u => u.email.toLowerCase() === email.toLowerCase())){
            return { success: false, message: "An account with this email already exists." };
        }

        // NOTE: storing plain-text passwords in localStorage is only
        // acceptable for this front-end prototype. Never do this once
        // a real backend exists — hash and store passwords server-side.
        users.push({ name, email, password });
        this.saveUsers(users);
        this.login(email, password);

        return { success: true };
    },

    login(email, password){
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if(!user){
            return { success: false, message: "Incorrect email or password." };
        }

        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
        return { success: true };
    },

    logout(){
        localStorage.removeItem(AUTH_SESSION_KEY);
    },

    getCurrentUser(){
        return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    }
};

const accountToggle = document.getElementById("account-toggle");
const accountPanel = document.getElementById("account-panel");
const authModal = document.getElementById("auth-modal");
const authModalClose = document.getElementById("auth-modal-close");
const tabButtons = document.querySelectorAll(".tab-btn");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");

function renderAccountPanel(){
    if(!accountPanel) return;

    const user = Auth.getCurrentUser();

    if(user){
        accountPanel.innerHTML = `
            <p class="account-greeting">Signed in as<br><strong>${user.name}</strong></p>
            <button class="btn-text" id="logout-btn" type="button">Log Out</button>
        `;
        document.getElementById("logout-btn").addEventListener("click", () => {
            Auth.logout();
            renderAccountPanel();
            accountPanel.classList.remove("open");
        });
    }else{
        accountPanel.innerHTML = `
            <button class="btn-text" id="open-login" type="button">Log In</button>
            <button class="btn-text" id="open-signup" type="button">Sign Up</button>
        `;
        document.getElementById("open-login").addEventListener("click", () => openAuthModal("login"));
        document.getElementById("open-signup").addEventListener("click", () => openAuthModal("signup"));
    }
}

function switchAuthTab(tab){
    tabButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    if(loginForm) loginForm.classList.toggle("hidden", tab !== "login");
    if(signupForm) signupForm.classList.toggle("hidden", tab !== "signup");
}

function openAuthModal(tab){
    if(accountPanel) accountPanel.classList.remove("open");
    if(authModal) authModal.classList.add("active");
    switchAuthTab(tab);
}

function closeAuthModal(){
    if(!authModal) return;
    authModal.classList.remove("active");
    if(loginError) loginError.textContent = "";
    if(signupError) signupError.textContent = "";
}

if(accountToggle){
    accountToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = accountPanel.classList.toggle("open");
        accountToggle.setAttribute("aria-expanded", isOpen);
    });
}

document.addEventListener("click", (e) => {
    if(accountPanel && !e.target.closest(".account-wrapper")){
        accountPanel.classList.remove("open");
    }
});

tabButtons.forEach(btn => btn.addEventListener("click", () => switchAuthTab(btn.dataset.tab)));
if(authModalClose) authModalClose.addEventListener("click", closeAuthModal);
if(authModal){
    authModal.addEventListener("click", (e) => {
        if(e.target === authModal) closeAuthModal();
    });
}

if(loginForm){
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const result = Auth.login(email, password);

        if(result.success){
            loginForm.reset();
            closeAuthModal();
            renderAccountPanel();
        }else{
            loginError.textContent = result.message;
        }
    });
}

if(signupForm){
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const result = Auth.register(name, email, password);

        if(result.success){
            signupForm.reset();
            closeAuthModal();
            renderAccountPanel();
        }else{
            signupError.textContent = result.message;
        }
    });
}

renderAccountPanel();

// ==========================================================
// BOOKING FORM (booking.html only)
// ==========================================================

const bookingForm = document.getElementById("booking-form");

if(bookingForm){
    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if(!bookingForm.checkValidity()){
            bookingForm.reportValidity();
            return;
        }

        bookingForm.reset();
        document.getElementById("booking-success").classList.add("show");
    });
}