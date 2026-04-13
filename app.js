/**
 * ==========================================================================
 * OMNICART V6 | GEMINI UI EDITION ENGINE
 * ==========================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, linkWithPopup, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCEFw7Jjv46VOTnATq2YBzOveZU6Rgnhrs",
  authDomain: "portfolio-storage-aa3f8.firebaseapp.com",
  projectId: "portfolio-storage-aa3f8",
  storageBucket: "portfolio-storage-aa3f8.firebasestorage.app",
  messagingSenderId: "305024787860",
  appId: "1:305024787860:web:9ef4ef028db582c43b1b81",
  measurementId: "G-NXTQ0DLWRP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ==========================================
// 2. ENVIRONMENT & STATE
// ==========================================
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentOrigin = window.location.origin;
const currentPath = window.location.pathname.includes('index.html') ? window.location.pathname.split('index.html')[0] + 'index.html' : '';
const DOMAIN_URL = isLocal ? `${currentOrigin}${currentPath}` : 'https://omni-cart.org';

const API_URL = isLocal ? 'http://localhost:3000/api' : 'https://omnicart-backend-jrh4.onrender.com/api'; 

const state = { 
    user: null, 
    pfp: '', 
    carts: [], 
    activeCartIdx: null, 
    viewingSharedCart: null, 
    authMode: 'login', 
    selectedIcon: 'bag', 
    resetActionCode: null,
    contextTargetId: null,
    originalRenameValue: '',
    currentSort: 'default' 
};

// 18 Standardized OmniCart Icons
const ICONS = {
    bag: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>`,
    shirt: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a8.96 8.96 0 0 1-4 1 8.96 8.96 0 0 1-4-1L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>`,
    phone: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><path d="M12 18h.01"></path><path d="M9 2h6v2H9z"></path></svg>`,
    couch: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/></svg>`,
    backpack: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"></path><path d="M8 10h8"></path></svg>`,
    toy: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
    laptop: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>`,
    tv: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`,
    camera: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    book: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>`,
    fitness: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h8"></path><rect x="4" y="6" width="4" height="12" rx="1"></rect><rect x="16" y="6" width="4" height="12" rx="1"></rect><path d="M2 9h2v6H2z"></path><path d="M20 9h2v6h-2z"></path></svg>`,
    paw: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-2.5 0-4.5-1.5-4.5-4 0-1.5 1-2.5 2-4s2-2.5 2.5-2.5 1.5 1 2.5 2.5 2 2.5 2 4c0 2.5-2 4-4.5 4z"></path><circle cx="6" cy="11" r="2"></circle><circle cx="10" cy="5" r="2"></circle><circle cx="14" cy="5" r="2"></circle><circle cx="18" cy="11" r="2"></circle></svg>`,
    box: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    monitor: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    home: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    car: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.8l-1.4 2.5C1.5 10.6 1 11.3 1 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
    music: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    gear: `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};

async function fetchWithAuth(url, options = {}) {
    if (auth.currentUser) { const token = await auth.currentUser.getIdToken(); options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` }; }
    return fetch(url, options);
}

function generateId() { return Math.random().toString(36).substring(2, 12).padStart(10, '0'); }

function extractStoreName(urlStr) {
    try {
        let hostname = new URL(urlStr).hostname;
        hostname = hostname.replace(/^www\./, '');
        hostname = hostname.replace(/\.(com|org|net|co|io|us|uk|store|shop|info).*$/, '');
        return hostname.split('.')[0] || 'generic';
    } catch(e) {
        return 'generic';
    }
}

function updatePageMeta(title, iconKey = 'bag') {
    document.title = title;
    const titleEl = document.getElementById('dynamic-title');
    if (titleEl) titleEl.innerText = title;
    
    // We use the OmniCart SVG structure for the favicon universally to match the brand
    const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l3-4h8l3 4"></path><path d="M5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z"></path><path d="M8 12a4 4 0 0 0 8 0"></path><style>path{stroke:#0f172a;}@media(prefers-color-scheme:dark){path{stroke:#ffffff;}}</style></svg>`;
    const base64 = btoa(brandSvg);
    const favicon = document.getElementById('dynamic-favicon');
    if (favicon) favicon.href = `data:image/svg+xml;base64,${base64}`;
}

// SCROLLSPY LOGIC
let scrollSpyObserver = null;
function initScrollSpy() {
    if (scrollSpyObserver) scrollSpyObserver.disconnect();
    
    const sections = document.querySelectorAll('.scrollspy-section');
    const navLinks = document.querySelectorAll('.legal-nav a');

    if (!sections.length || !navLinks.length) return;

    scrollSpyObserver = new IntersectionObserver((entries) => {
        let activeId = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeId = entry.target.id;
            }
        });
        
        if (activeId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeId}`) {
                    link.classList.add('active');
                }
            });
        }
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

    sections.forEach(sec => scrollSpyObserver.observe(sec));
}

// ==========================================
// 3. ROUTER ENGINE
// ==========================================
window.navigateTo = function(path) {
    let basePath = window.location.pathname.includes('index.html') ? window.location.pathname.split('index.html')[0] + 'index.html' : '';
    if (basePath.endsWith('index.html') && path === '/') path = ''; 
    window.history.pushState({}, '', basePath + path);
    renderRoute();
};

window.addEventListener('popstate', renderRoute);

async function renderRoute() {
    closeContextMenu(); 
    let path = window.location.pathname;
    if (path.includes('index.html')) path = path.split('index.html')[1] || '/';
    if (path === '') path = '/';

    const params = new URLSearchParams(window.location.search);

    if (params.get('action') === 'reset' && params.has('token')) {
        state.resetActionCode = params.get('token');
        updatePageMeta('OmniCart - Password Recovery');
        switchView('reset'); closeModal('modal-auth');
        window.history.replaceState({}, document.title, window.location.pathname); return; 
    }

    if (params.has('signup') || params.has('register')) { openAuthModal('register'); window.history.replaceState({}, document.title, window.location.pathname); } 
    else if (params.has('login') || params.has('signin')) { openAuthModal('login'); window.history.replaceState({}, document.title, window.location.pathname); }

    if (path === '/help') {
        updatePageMeta('OmniCart - Help Center');
        switchView('faq');
        setTimeout(() => {
            const hash = window.location.hash;
            if(hash) { const el = document.querySelector(hash); if(el) el.scrollIntoView({ behavior: 'smooth' }); }
        }, 100);
        return;
    }
    
    if (path === '/terms' || path === '/privacy') {
        updatePageMeta(path === '/terms' ? 'OmniCart - Terms & Conditions' : 'OmniCart - Privacy Policy');
        switchView(path === '/terms' ? 'terms' : 'privacy');
        setTimeout(initScrollSpy, 300); // Initialize ScrollSpy
        return;
    }

    if (path === '/workspaces/search') {
        if (!auth.currentUser && state.user === null) { switchView('landing'); return; }
        updatePageMeta('OmniCart - Workspaces');
        state.activeCartIdx = null; state.viewingSharedCart = null;
        switchView('search'); renderSidebarCarts();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) { searchInput.value = ''; handleSearch(''); searchInput.focus(); }
        return;
    }

    if (path.startsWith('/workspaces')) {
        const parts = path.split('/').filter(Boolean);
        const targetId = parts[1];

        if (targetId) {
            const idx = state.carts.findIndex(c => c.id === targetId || c.id == targetId);
            if (idx !== -1) {
                const prevIdx = state.activeCartIdx;
                state.activeCartIdx = idx; state.viewingSharedCart = null;
                switchView('workspace'); renderSidebarCarts(); renderMainWorkspace(prevIdx !== idx);
            } else {
                try {
                    const res = await fetch(`${API_URL}/shared-cart/${targetId}`);
                    const data = await res.json();
                    if (res.ok && data.success) {
                        state.activeCartIdx = null; state.viewingSharedCart = data.cart;
                        switchView('workspace'); renderSidebarCarts(); renderMainWorkspace();
                    } else throw new Error(data.error || "Workspace not found");
                } catch (e) {
                    showToast(e.message, 'error'); navigateTo(auth.currentUser ? '/workspaces' : '/');
                }
            }
        } else {
            if (!auth.currentUser && state.user === null) { switchView('landing'); return; }
            updatePageMeta('OmniCart - Workspaces');
            state.activeCartIdx = null; state.viewingSharedCart = null;
            switchView('workspace'); renderSidebarCarts(); renderMainWorkspace();
        }
    } else {
        if (!document.getElementById('view-reset').classList.contains('active-view')) {
            updatePageMeta('OmniCart - Universal Shopping Cart');
            switchView('landing');
        }
    }
}

// ==========================================
// 4. INITIALIZATION & EVENT BINDINGS
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    initThemeEngine(); initEventBindings(); initIconSelector(); renderRoute(); fetchPlatformStats();
    
    onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const res = await fetchWithAuth(`${API_URL}/auth/sync`, { method: 'POST' });
                const data = await res.json();
                state.user = data.user.username; state.pfp = data.user.pfp;
                closeModal('modal-auth'); 
                checkLinkedAccounts(firebaseUser); 
                
                const cartRes = await fetchWithAuth(`${API_URL}/carts`);
                state.carts = await cartRes.json();
                renderHeaderProfile();
                
                let currentPath = window.location.pathname.includes('index.html') ? window.location.pathname.split('index.html')[1] || '/' : window.location.pathname;
                if (currentPath === '/') navigateTo('/workspaces'); else renderRoute();
            } catch (err) { console.error("Backend sync failed:", err); }
        } else { handleLogoutState(); }
    });
});

function initThemeEngine() {
    const savedTheme = localStorage.getItem('omnicart_theme') || 'light'; document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next); localStorage.setItem('omnicart_theme', next);
    });
}

function initEventBindings() {
    document.querySelectorAll('.nav-link-internal').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = e.currentTarget.getAttribute('data-route');
            if(route) navigateTo(route);
        });
    });

    document.getElementById('btn-nav-login')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btn-nav-register')?.addEventListener('click', () => openAuthModal('register'));
    document.getElementById('nav-logo')?.addEventListener('click', () => navigateTo(state.user ? '/workspaces' : '/'));
    document.getElementById('sidebar-toggle-btn')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-backdrop')?.addEventListener('click', toggleSidebar);
    document.getElementById('nav-user-profile')?.addEventListener('click', openSettingsModal);
    
    document.querySelectorAll('[data-set-target]').forEach(tab => tab.addEventListener('click', (e) => switchSettingsTab(e.target.getAttribute('data-set-target'))));
    document.getElementById('btn-save-profile')?.addEventListener('click', saveProfileSettings);
    document.getElementById('btn-link-google')?.addEventListener('click', linkGoogleAccount);
    
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', (e) => closeModal(e.currentTarget.getAttribute('data-close'))));
    document.querySelectorAll('[data-auth-target]').forEach(tab => tab.addEventListener('click', (e) => switchAuthMode(e.target.getAttribute('data-auth-target'))));
    document.getElementById('btn-submit-login')?.addEventListener('click', () => handleEmailAuth(true));
    document.getElementById('btn-submit-register')?.addEventListener('click', () => handleEmailAuth(false));
    document.getElementById('btn-google-auth')?.addEventListener('click', handleGoogleAuth);
    document.getElementById('btn-logout')?.addEventListener('click', handleAppLogout);
    
    document.getElementById('btn-do-recover')?.addEventListener('click', sendRecoveryEmail);
    document.getElementById('btn-submit-new-password')?.addEventListener('click', handlePasswordReset);

    // TOS Checkbox
    document.getElementById('reg-tos-check')?.addEventListener('change', (e) => {
        const btn = document.getElementById('btn-submit-register');
        if (btn) {
            btn.disabled = !e.target.checked;
            btn.style.opacity = e.target.checked ? '1' : '0.5';
            btn.style.cursor = e.target.checked ? 'pointer' : 'not-allowed';
        }
    });

    document.getElementById('btn-search-workspaces')?.addEventListener('click', () => navigateTo('/workspaces/search'));
    document.getElementById('btn-new-workspace')?.addEventListener('click', () => { openModal('modal-new-workspace'); document.getElementById('new-workspace-name')?.focus(); });
    document.getElementById('btn-confirm-new-workspace')?.addEventListener('click', createWorkspace);
    document.getElementById('new-workspace-name')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') createWorkspace(); });
    
    document.getElementById('btn-fetch-link')?.addEventListener('click', scrapeProductLink);
    document.getElementById('link-fetch-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') scrapeProductLink(); });
    document.getElementById('btn-open-custom')?.addEventListener('click', openCustomItemModal);
    document.getElementById('btn-save-custom-item')?.addEventListener('click', saveCustomItem);
    document.getElementById('btn-save-partial-item')?.addEventListener('click', savePartialItem);
    
    // Rotating Dropdowns Logic
    document.getElementById('btn-checkout-trigger')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('checkout-menu-list');
        const arrow = document.getElementById('checkout-dropdown-arrow');
        const isOpen = menu.style.display === 'flex';
        
        closeAllDropdowns();

        if (!isOpen && menu.innerHTML.trim() !== '') {
            menu.style.display = 'flex';
            if(arrow) arrow.classList.add('rotate-180');
        }
    });

    document.getElementById('btn-sort-trigger')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('sort-menu-list');
        const arrow = document.getElementById('sort-dropdown-arrow');
        const isOpen = menu.style.display === 'flex';
        
        closeAllDropdowns();

        if (!isOpen) {
            menu.style.display = 'flex';
            if(arrow) arrow.classList.add('rotate-180');
        }
    });

    // Custom Sort Selections
    document.querySelectorAll('#sort-menu-list .checkout-menu-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.currentSort = e.currentTarget.getAttribute('data-sort');
            document.getElementById('sort-active-text').innerText = e.currentTarget.innerText;
            renderMainWorkspace();
        });
    });

    // Global Click Listener to close dropdowns
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.cart-batch-actions')) {
            closeAllDropdowns();
        }
    });

    document.getElementById('btn-learn-popups')?.addEventListener('click', () => {
        closeModal('modal-popup-blocked');
        window.location.hash = 'popups';
        navigateTo('/help');
    });

    document.getElementById('btn-header-share')?.addEventListener('click', () => openShareModal(state.activeCartIdx !== null ? state.carts[state.activeCartIdx].id : null));
    document.getElementById('btn-header-more')?.addEventListener('click', (e) => {
        if (state.activeCartIdx !== null) openContextMenu(e, state.carts[state.activeCartIdx].id, true);
    });

    let searchTimer;
    document.getElementById('global-search-input')?.addEventListener('input', (e) => {
        document.getElementById('search-loading-bar').style.display = 'block';
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => handleSearch(e.target.value), 600);
    });

    document.addEventListener('click', closeContextMenu);
    document.getElementById('gemini-context-menu')?.addEventListener('click', (e) => e.stopPropagation());
    
    document.getElementById('ctx-share')?.addEventListener('click', () => { const id = state.contextTargetId; closeContextMenu(); openShareModal(id); });
    document.getElementById('ctx-pin')?.addEventListener('click', () => { const id = state.contextTargetId; closeContextMenu(); togglePinStatus(id); });
    document.getElementById('ctx-rename')?.addEventListener('click', () => { const id = state.contextTargetId; closeContextMenu(); openRenameModal(id); });
    document.getElementById('ctx-delete')?.addEventListener('click', () => { closeContextMenu(); openModal('modal-delete-confirm'); });
    document.getElementById('btn-confirm-delete')?.addEventListener('click', executeDeleteWorkspace);

    document.getElementById('btn-confirm-rename')?.addEventListener('click', executeRename);
    document.getElementById('rename-workspace-input')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') executeRename(); });
    
    document.getElementById('rename-workspace-input')?.addEventListener('input', (e) => {
        const btn = document.getElementById('btn-confirm-rename');
        const val = e.target.value.trim();
        btn.disabled = (val === state.originalRenameValue || val === '');
    });

    document.getElementById('share-toggle-checkbox')?.addEventListener('change', toggleWorkspacePrivacy);
    document.getElementById('btn-copy-link')?.addEventListener('click', copyShareLink);
}

function closeAllDropdowns() {
    document.querySelectorAll('.checkout-menu').forEach(m => m.style.display = 'none');
    document.querySelectorAll('.transition-transform').forEach(a => a.classList.remove('rotate-180'));
}

function formatStatNumber(num) {
    if (num < 5) return "1+";
    if (num < 100) return (Math.floor(num / 5) * 5).toLocaleString() + "+";
    if (num < 250) return (Math.floor(num / 50) * 50).toLocaleString() + "+";
    if (num < 1000) return (Math.floor(num / 250) * 250).toLocaleString() + "+";
    if (num < 2000) return (Math.floor(num / 500) * 500).toLocaleString() + "+";
    if (num < 10000) return (Math.floor(num / 1000) * 1000).toLocaleString() + "+";
    return (Math.floor(num / 10000) * 10000).toLocaleString() + "+";
}

async function fetchPlatformStats() {
    try {
        const res = await fetch(`${API_URL}/stats`);
        const data = await res.json();
        const dailyEl = document.getElementById('stat-daily-users');
        const totalEl = document.getElementById('stat-total-workspaces');
        
        if(dailyEl) dailyEl.innerText = formatStatNumber(data.dailyActive || 1);
        if(totalEl) totalEl.innerText = formatStatNumber(data.totalCarts || 5);
    } catch(e) { }
}

// ==========================================
// 5. FIREBASE AUTHENTICATION & RECOVERY LOGIC
// ==========================================
async function handleEmailAuth(isLogin) {
    const email = document.getElementById(isLogin ? 'login-email' : 'reg-email').value.trim();
    const pass = document.getElementById(isLogin ? 'login-password' : 'reg-password').value;
    const btn = document.getElementById(isLogin ? 'btn-submit-login' : 'btn-submit-register');
    
    if (!email || !pass) return showToast('Please enter credentials.', 'error');
    if(btn) { btn.disabled = true; btn.innerText = 'Processing...'; }
    
    try {
        if (isLogin) { 
            await signInWithEmailAndPassword(auth, email, pass); 
            showToast('Logged in.', 'success'); 
        } else { 
            await createUserWithEmailAndPassword(auth, email, pass); 
            showToast('Account created!', 'success'); 
        }
    } catch (error) { 
        let errorMsg = 'Authentication failed. Please try again.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') errorMsg = 'Invalid email or password. Please try again.';
        else if (error.code === 'auth/email-already-in-use') errorMsg = 'Email already in use. Try logging in, or click "Continue with Google".';
        else if (error.code === 'auth/weak-password') errorMsg = 'Password is too weak. Please use at least 6 characters.';
        showToast(errorMsg, 'error'); 
        if(btn) { btn.disabled = false; btn.innerText = isLogin ? 'Log In Securely' : 'Create Account'; } 
    }
}

async function handleGoogleAuth() {
    try { await signInWithPopup(auth, googleProvider); showToast('Google auth successful!', 'success'); } 
    catch (error) { showToast('Google authentication failed.', 'error'); }
}

async function sendRecoveryEmail() {
    const email = document.getElementById('recover-email').value.trim();
    if(!email) return showToast('Please enter an email address.', 'error');
    
    const btn = document.getElementById('btn-do-recover');
    btn.disabled = true; btn.innerText = 'Sending...';
    try {
        const res = await fetch(`${API_URL}/auth/send-reset-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, domainUrl: DOMAIN_URL })
        });
        if (res.ok) { showToast('Recovery link sent!', 'success'); switchAuthMode('login'); } 
        else throw new Error();
    } catch (error) { showToast('Failed to send recovery email.', 'error'); } 
    finally { btn.disabled = false; btn.innerText = 'Send Recovery Link'; }
}

async function handlePasswordReset() {
    const p1 = document.getElementById('new-reset-password').value;
    const p2 = document.getElementById('confirm-reset-password').value;
    if (!p1 || p1 !== p2) return showToast('Passwords do not match.', 'error');
    
    const btn = document.getElementById('btn-submit-new-password');
    btn.disabled = true; btn.innerText = 'Updating...';
    try {
        await confirmPasswordReset(auth, state.resetActionCode, p1);
        showToast('Password updated successfully! Please log in.', 'success');
        navigateTo('/'); setTimeout(() => openAuthModal('login'), 300);
    } catch(e) { showToast('Error updating password. Link may be expired.', 'error'); } 
    finally { btn.disabled = false; btn.innerText = 'Update Password'; }
}

async function linkGoogleAccount() {
    try {
        await linkWithPopup(auth.currentUser, googleProvider);
        showToast('Google account linked successfully!', 'success');
        checkLinkedAccounts(auth.currentUser);
    } catch (error) { showToast(error.message, 'error'); }
}

function checkLinkedAccounts(firebaseUser) {
    if (!firebaseUser) return;
    const btn = document.getElementById('btn-link-google');
    if (!btn) return;
    const isLinked = firebaseUser.providerData.some(p => p.providerId === 'google.com');
    if (isLinked) {
        btn.classList.add('btn-google-linked');
        btn.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg-small" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Account Linked</span>`;
        btn.disabled = true;
    }
}

function handleLogoutState() { state.user = null; state.pfp = ''; state.carts = []; if (state.viewingSharedCart === null) { state.activeCartIdx = null; navigateTo('/'); } else { renderHeaderProfile(); switchView('workspace'); } }
async function handleAppLogout() { try { await signOut(auth); closeModal('modal-settings'); showToast('Logged out.', 'success'); } catch (error) { showToast('Logout failed.', 'error'); } }

// ==========================================
// 6. WORKSPACE DATA & RENDERERS
// ==========================================
async function pushWorkspacesToServer() { try { await fetchWithAuth(`${API_URL}/carts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carts: state.carts }) }); } catch (e) {} }

async function createWorkspace() {
    const nameInp = document.getElementById('new-workspace-name'); 
    const name = nameInp ? nameInp.value.trim() : '';
    if (!name) return showToast('Please enter a workspace name.', 'error');
    
    const btn = document.getElementById('btn-confirm-new-workspace');
    const originalContent = btn.innerHTML;
    btn.innerHTML = `Creating...`;
    btn.disabled = true;

    try {
        const newId = generateId(); 
        const timestamp = Date.now();
        state.carts.push({ id: newId, name, icon: state.selectedIcon, items: [], isPublic: false, createdAt: timestamp, lastModified: timestamp, isPinned: false });
        
        if(nameInp) nameInp.value = '';
        closeModal('modal-new-workspace');
        
        await pushWorkspacesToServer(); 
        navigateTo(`/workspaces/${newId}`); 
        showToast('Workspace created.', 'success'); 
        if (window.innerWidth <= 768) toggleSidebar(); 
    } catch (e) { showToast('Creation failed.', 'error'); } 
    finally { btn.innerHTML = originalContent; btn.disabled = false; }
}

window.selectWorkspace = function(idx) {
    const cart = state.carts[idx]; if (cart) navigateTo(`/workspaces/${cart.id}`); if (window.innerWidth <= 768) toggleSidebar();
};

window.openContextMenu = function(e, cartId, isHeader = false) {
    e.preventDefault(); e.stopPropagation();
    state.contextTargetId = cartId;
    const menu = document.getElementById('gemini-context-menu');
    
    const cart = state.carts.find(c => c.id === cartId);
    if(cart) {
        document.getElementById('ctx-pin').innerHTML = cart.isPinned 
            ? `<svg viewBox="0 0 24 24" class="icon-svg-small" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Unpin`
            : `<svg viewBox="0 0 24 24" class="icon-svg-small" fill="none" stroke="currentColor"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> Pin`;
    }

    const shareBtn = document.getElementById('ctx-share');
    if (shareBtn) shareBtn.style.display = isHeader ? 'none' : 'flex';

    menu.style.display = 'flex';
    
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.left + window.scrollX;
    if (left + 220 > window.innerWidth) left = window.innerWidth - 240;
    
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
}

function closeContextMenu() {
    const menu = document.getElementById('gemini-context-menu');
    if (menu) menu.style.display = 'none';
}

async function togglePinStatus(id) {
    const cart = state.carts.find(c => c.id === id);
    if (!cart) return;
    cart.isPinned = !cart.isPinned;
    await pushWorkspacesToServer();
    renderSidebarCarts();
    showToast(cart.isPinned ? 'Pinned to top.' : 'Unpinned.', 'success');
}

async function executeDeleteWorkspace() {
    const id = state.contextTargetId;
    if (!id) return;
    const idx = state.carts.findIndex(c => c.id === id);
    if (idx === -1) return;
    
    const btn = document.getElementById('btn-confirm-delete');
    btn.disabled = true; btn.innerText = 'Deleting...';
    
    try {
        state.carts.splice(idx, 1); 
        await pushWorkspacesToServer(); 
        
        if (state.activeCartIdx === idx) { navigateTo('/workspaces'); } 
        else { if (state.activeCartIdx > idx) state.activeCartIdx--; renderSidebarCarts(); }
        
        closeModal('modal-delete-confirm');
        showToast('Workspace deleted.', 'success');
    } finally { btn.disabled = false; btn.innerText = 'Delete'; }
}

function openRenameModal(id) {
    const cart = state.carts.find(c => c.id === id);
    if (!cart) return;
    state.contextTargetId = id; 
    state.originalRenameValue = cart.name;
    
    const input = document.getElementById('rename-workspace-input');
    input.value = cart.name;
    
    const btn = document.getElementById('btn-confirm-rename');
    btn.disabled = true; 
    
    const sourceGrid = document.getElementById('new-workspace-icon-grid');
    const targetGrid = document.getElementById('rename-workspace-icon-grid');
    if(sourceGrid && targetGrid) {
        targetGrid.innerHTML = sourceGrid.innerHTML;
        targetGrid.querySelectorAll('.icon-grid-item').forEach(b => {
            b.classList.remove('active');
            if (b.getAttribute('data-icon') === cart.icon) b.classList.add('active');
            b.addEventListener('click', (e) => {
                targetGrid.querySelectorAll('.icon-grid-item').forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                btn.disabled = false;
            });
        });
    }

    openModal('modal-rename');
    setTimeout(() => input.focus(), 100);
}

async function executeRename() {
    const newName = document.getElementById('rename-workspace-input').value.trim();
    
    const targetGrid = document.getElementById('rename-workspace-icon-grid');
    let selectedIcon = state.selectedIcon; 
    if(targetGrid) {
        const activeBtn = targetGrid.querySelector('.icon-grid-item.active');
        if(activeBtn) selectedIcon = activeBtn.getAttribute('data-icon');
    }
    
    if (!newName) return;
    
    const cart = state.carts.find(c => c.id === state.contextTargetId);
    if (cart) {
        cart.name = newName; cart.icon = selectedIcon;
        await pushWorkspacesToServer();
        renderSidebarCarts();
        if (state.activeCartIdx !== null && state.carts[state.activeCartIdx].id === state.contextTargetId) {
            document.getElementById('workspace-display-title').innerText = newName;
            updatePageMeta(`${newName} - OmniCart`, selectedIcon);
        }
    }
    closeModal('modal-rename');
}

function openShareModal(targetId) {
    if (!targetId) return;
    const cart = state.carts.find(c => c.id === targetId);
    if (!cart) return;
    state.contextTargetId = targetId;
    
    document.getElementById('share-toggle-checkbox').checked = cart.isPublic;
    const linkContainer = document.getElementById('share-link-container');
    const linkInput = document.getElementById('share-link-input');
    
    linkInput.value = `${DOMAIN_URL}/workspaces/${cart.id}`;
    linkContainer.style.opacity = cart.isPublic ? '1' : '0.4';
    linkContainer.style.pointerEvents = cart.isPublic ? 'auto' : 'none';
    
    openModal('modal-share');
}

async function toggleWorkspacePrivacy(e) {
    const cart = state.carts.find(c => c.id === state.contextTargetId);
    if (!cart) return;
    const isNowPublic = e.target.checked;
    cart.isPublic = isNowPublic;
    await pushWorkspacesToServer();
    
    const linkContainer = document.getElementById('share-link-container');
    linkContainer.style.opacity = isNowPublic ? '1' : '0.4';
    linkContainer.style.pointerEvents = isNowPublic ? 'auto' : 'none';
}

function copyShareLink() {
    const linkInput = document.getElementById('share-link-input');
    linkInput.select(); navigator.clipboard.writeText(linkInput.value);
    const btn = document.getElementById('btn-copy-link');
    btn.innerText = 'Copied!'; setTimeout(() => btn.innerText = 'Copy', 2000);
}

// --- ADVANCED SEARCH ENGINE ---
function handleSearch(query) {
    const q = query.toLowerCase();
    const resultsContainer = document.getElementById('search-results-container');
    const metaText = document.getElementById('search-results-meta');
    const idleState = document.getElementById('search-idle-state');
    const recentContainer = document.getElementById('search-recent-container');
    
    document.getElementById('search-loading-bar').style.display = 'none';
    resultsContainer.innerHTML = '';

    const buildStoreBadges = (cart) => {
        const storeCounts = {};
        cart.items.forEach(item => {
            if (!item.url || item.url === '#') return;
            const s = extractStoreName(item.url);
            storeCounts[s] = (storeCounts[s] || 0) + 1;
        });

        const sortedStores = Object.entries(storeCounts).sort((a,b) => b[1] - a[1]).slice(0, 3);
        if (sortedStores.length === 0) return '';
        
        return `<div style="display:flex; gap:8px; margin-top:8px;">` +
            sortedStores.map(([store, count]) => `
                <div style="display:flex; align-items:center; gap:4px; font-size:0.75rem; background:var(--sidebar-bg); padding:3px 8px; border-radius:12px;">
                    <img src="https://www.google.com/s2/favicons?domain=${store}.com&sz=16" style="width:12px;height:12px; border-radius:2px;" onerror="this.style.display='none'">
                    <span style="color:var(--text-muted); font-weight:600;">${count}</span>
                </div>
            `).join('') + `</div>`;
    };

    if (!q) { 
        metaText.style.display = 'none';
        idleState.style.display = 'block';
        recentContainer.innerHTML = '';
        
        const recentCarts = [...state.carts].sort((a,b) => (b.lastModified || b.createdAt || 0) - (a.lastModified || a.createdAt || 0)).slice(0, 15);
        
        if (recentCarts.length === 0) {
            recentContainer.innerHTML = '<div class="search-meta-text" style="margin-top:0;">No workspaces yet.</div>';
            return;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">';
        recentCarts.forEach(c => {
            const idx = state.carts.findIndex(sc => sc.id === c.id);
            html += `
                <div class="product-card" style="cursor:pointer; align-items:flex-start;" onclick="selectWorkspace(${idx})">
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px;" class="truncate-text">${c.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${c.items.length} items</div>
                        ${buildStoreBadges(c)}
                    </div>
                </div>`;
        });
        html += '</div>';
        recentContainer.innerHTML = html;
        return; 
    }

    idleState.style.display = 'none';
    metaText.style.display = 'block';

    const matched = state.carts.filter(c => c.name.toLowerCase().includes(q));
    metaText.innerText = `${matched.length} result${matched.length === 1 ? '' : 's'} for "${query}"`;

    if (matched.length === 0) return;

    const groups = { "Pinned": [], "Recently Modified": [], "Older": [] };
    
    matched.forEach(cart => {
        if (cart.isPinned) groups["Pinned"].push(cart);
        else if (cart.lastModified && (Date.now() - cart.lastModified < 86400000)) groups["Recently Modified"].push(cart);
        else groups["Older"].push(cart);
    });

    for (const [groupName, carts] of Object.entries(groups)) {
        if (carts.length === 0) continue;
        
        let html = `<div style="margin-bottom: 24px;">
                        <h3 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 600;">${groupName}</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">`;
        
        carts.sort((a,b) => (b.lastModified || b.createdAt || 0) - (a.lastModified || a.createdAt || 0)).forEach(c => {
            const idx = state.carts.findIndex(sc => sc.id === c.id);
            html += `
                <div class="product-card" style="cursor:pointer; align-items:flex-start;" onclick="selectWorkspace(${idx})">
                    <div style="display: flex; flex-direction: column; width: 100%;">
                        <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px;" class="truncate-text">${c.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${c.items.length} items</div>
                        ${buildStoreBadges(c)}
                    </div>
                </div>`;
        });
        html += `</div></div>`;
        resultsContainer.innerHTML += html;
    }
}

// --- PRODUCT MANAGEMENT ---
async function scrapeProductLink() {
    if (state.activeCartIdx === null) return;
    const linkInp = document.getElementById('link-fetch-input'); 
    const url = linkInp ? linkInp.value.trim() : '';
    
    if (!url) return showToast('Invalid URL.', 'error');
    const btn = document.getElementById('btn-fetch-link'); 
    if(btn) { btn.disabled = true; btn.innerText = 'Extracting...'; }
    
    try {
        const res = await fetchWithAuth(`${API_URL}/scrape`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ url }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error();

        const safeSite = extractStoreName(data.url);

        if (data.isPartial) {
            document.getElementById('partial-item-title').value = data.title !== 'Unknown Product' ? data.title : '';
            document.getElementById('partial-item-price').value = data.price !== '0.00' ? data.price : '';
            document.getElementById('partial-item-img').value = !data.img.includes('ui-avatars') ? data.img : '';
            document.getElementById('partial-item-url').value = data.url;
            document.getElementById('partial-item-site').value = safeSite;
            
            openModal('modal-partial-item');
            if(linkInp) linkInp.value = '';
            return; 
        }

        state.carts[state.activeCartIdx].items.push({ id: Date.now(), title: data.title, price: data.price, img: data.img, site: safeSite, url: data.url, bought: false });
        state.carts[state.activeCartIdx].lastModified = Date.now();
        if(linkInp) linkInp.value = ''; 
        await pushWorkspacesToServer(); 
        renderSidebarCarts(); 
        renderMainWorkspace(); 
        showToast('Link parsed.', 'success');
        
    } catch (e) { 
        showToast('Extraction failed.', 'error'); 
    } finally { 
        if(btn) { btn.disabled = false; btn.innerText = 'Fetch Link'; } 
    }
}

async function savePartialItem() {
    if (state.activeCartIdx === null) return;
    
    const title = document.getElementById('partial-item-title').value.trim() || 'Unknown Product';
    const price = document.getElementById('partial-item-price').value.trim() || '0.00';
    const rawImg = document.getElementById('partial-item-img').value.trim();
    const url = document.getElementById('partial-item-url').value;
    const site = document.getElementById('partial-item-site').value;
    
    const img = rawImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(title.substring(0,2))}&background=random`;

    const btn = document.getElementById('btn-save-partial-item');
    btn.disabled = true; btn.innerText = 'Saving...';

    try {
        state.carts[state.activeCartIdx].items.push({ id: Date.now(), title, price, img, site, url, bought: false });
        state.carts[state.activeCartIdx].lastModified = Date.now();
        
        closeModal('modal-partial-item');
        await pushWorkspacesToServer(); 
        renderSidebarCarts(); 
        renderMainWorkspace(); 
        showToast('Item manually added.', 'success');
    } catch (e) { showToast('Failed to save item.', 'error'); } 
    finally { btn.disabled = false; btn.innerText = 'Add to Workspace'; }
}

function openCustomItemModal() { openModal('modal-custom-item'); }

async function saveCustomItem() { 
    if (state.activeCartIdx === null) return;
    
    const title = document.getElementById('cust-item-title').value.trim() || 'Custom Item';
    const price = document.getElementById('cust-item-price').value.trim() || '0.00';
    const url = document.getElementById('cust-item-url').value.trim() || '#';
    let site = 'custom';
    if (url !== '#') site = extractStoreName(url);
    
    const img = `https://ui-avatars.com/api/?name=${encodeURIComponent(title.substring(0,2))}&background=random`;

    state.carts[state.activeCartIdx].items.push({ id: Date.now(), title, price, img, site, url, bought: false });
    state.carts[state.activeCartIdx].lastModified = Date.now();
    
    document.getElementById('cust-item-title').value = '';
    document.getElementById('cust-item-price').value = '';
    document.getElementById('cust-item-url').value = '';
    
    closeModal('modal-custom-item');
    await pushWorkspacesToServer(); 
    renderSidebarCarts(); 
    renderMainWorkspace(); 
    showToast('Custom item injected.', 'success');
}

window.toggleItemState = async function(idx) { 
    state.carts[state.activeCartIdx].items[idx].bought = !state.carts[state.activeCartIdx].items[idx].bought; 
    state.carts[state.activeCartIdx].lastModified = Date.now();
    await pushWorkspacesToServer(); renderSidebarCarts(); renderMainWorkspace(); 
};

window.removeItem = async function(idx) { 
    state.carts[state.activeCartIdx].items.splice(idx, 1); 
    state.carts[state.activeCartIdx].lastModified = Date.now();
    await pushWorkspacesToServer(); renderSidebarCarts(); renderMainWorkspace(); 
};

window.executeBatchCheckout = function(targetSite) {
    if (state.activeCartIdx === null) return;
    const menu = document.getElementById('checkout-menu-list');
    if(menu) menu.style.display = 'none';

    const cart = state.carts[state.activeCartIdx];
    
    const itemsToOpen = cart.items.filter(item => {
        if (item.bought || !item.url || item.url === '#') return false;
        if (targetSite !== 'all' && extractStoreName(item.url) !== targetSite) return false;
        return true;
    });

    if (itemsToOpen.length === 0) return;
    
    let popupBlocked = false;
    let blockedItems = [];
    
    itemsToOpen.forEach(item => {
        if (popupBlocked) {
            blockedItems.push(item);
        } else {
            const newTab = window.open(item.url, '_blank');
            if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                popupBlocked = true;
                blockedItems.push(item);
            }
        }
    });
    
    if (popupBlocked) {
        const linkContainer = document.getElementById('blocked-links-container');
        linkContainer.innerHTML = '';
        blockedItems.forEach(item => {
            linkContainer.innerHTML += `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>`;
        });
        openModal('modal-popup-blocked');
    } else {
        showToast(`Opening ${itemsToOpen.length} item(s) in new tabs.`, 'success');
    }
}

// ==========================================
// 7. RENDERERS & UI
// ==========================================
function renderHeaderProfile() {
    const pfpEl = document.getElementById('header-pfp');
    if(pfpEl) pfpEl.src = state.pfp || 'https://ui-avatars.com/api/?name=U&background=0f172a&color=fff&size=150';
}

function renderSidebarCarts() {
    const pinnedContainer = document.getElementById('sidebar-pinned-list'); 
    const unpinnedContainer = document.getElementById('sidebar-carts-list'); 
    const pinnedSection = document.getElementById('pinned-section');
    
    if(!pinnedContainer || !unpinnedContainer) return; 
    
    pinnedContainer.innerHTML = '';
    unpinnedContainer.innerHTML = '';
    
    const sortedCarts = [...state.carts].sort((a, b) => (b.lastModified || b.createdAt || 0) - (a.lastModified || a.createdAt || 0));
    let hasPinned = false;

    sortedCarts.forEach((cart) => {
        const originalIdx = state.carts.findIndex(c => c.id === cart.id);
        const isActive = state.activeCartIdx === originalIdx ? 'active-cart' : ''; 
        const iconSVG = ICONS[cart.icon] || ICONS['bag'];
        
        const html = `
            <div class="cart-nav-item ${isActive}" onclick="selectWorkspace(${originalIdx})">
                <div class="cart-icon-wrapper">
                    ${iconSVG}
                    <span class="truncate-text sidebar-text">${cart.name}</span>
                </div>
                <button class="btn-icon-small cart-context-trigger" onclick="openContextMenu(event, '${cart.id}')">
                    <svg viewBox="0 0 24 24" class="icon-svg-small" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
            </div>`;

        if (cart.isPinned) { hasPinned = true; pinnedContainer.innerHTML += html; } 
        else { unpinnedContainer.innerHTML += html; }
    });

    if (pinnedSection) pinnedSection.style.display = hasPinned ? 'block' : 'none';
}

function renderMainWorkspace(shouldFade = false) {
    const emptyState = document.getElementById('workspace-empty-state'); 
    const activeState = document.getElementById('workspace-active-state');
    if(!emptyState || !activeState) return;
    
    const isOwner = state.viewingSharedCart === null;
    const cart = isOwner ? state.carts[state.activeCartIdx] : state.viewingSharedCart;

    if (!cart) { 
        emptyState.style.display = 'flex'; activeState.style.display = 'none'; 
        document.getElementById('header-authenticated-actions').style.display = 'none';
        return; 
    }
    
    emptyState.style.display = 'none'; activeState.style.display = 'block'; 
    updatePageMeta(`${cart.name} - OmniCart`, cart.icon);
    
    document.getElementById('header-authenticated-actions').style.display = 'flex';
    document.getElementById('btn-header-share').style.display = isOwner ? 'flex' : 'none';
    document.getElementById('btn-header-more').style.display = isOwner ? 'flex' : 'none';

    document.getElementById('workspace-display-title').innerText = cart.name;
    document.getElementById('read-only-badge').style.display = isOwner ? 'none' : 'inline-block';
    document.getElementById('cart-add-panel').style.display = isOwner ? 'flex' : 'none';
    
    const listContainer = document.getElementById('product-list-container'); if(!listContainer) return; listContainer.innerHTML = '';
    
    const sortWrapper = document.getElementById('sort-dropdown-wrapper');
    if (sortWrapper) sortWrapper.style.display = cart.items.length > 0 ? 'block' : 'none';

    let runningTotal = 0;
    
    // Build Dynamic Checkout Dropdown
    const checkoutMenu = document.getElementById('checkout-menu-list');
    const btnCheckoutTrigger = document.getElementById('btn-checkout-trigger');
    
    if (checkoutMenu && btnCheckoutTrigger) {
        const unboughtItems = cart.items.filter(item => !item.bought && item.url && item.url !== '#');
        if (unboughtItems.length === 0) {
            btnCheckoutTrigger.style.display = 'none';
        } else {
            btnCheckoutTrigger.style.display = 'inline-flex';
            
            const storeCounts = {};
            unboughtItems.forEach(item => {
                const s = extractStoreName(item.url);
                storeCounts[s] = (storeCounts[s] || 0) + 1;
            });
            
            const sortedStores = Object.keys(storeCounts).sort((a,b) => storeCounts[b] - storeCounts[a]);
            
            let dropdownHtml = `
                <button class="checkout-menu-item" onclick="executeBatchCheckout('all')">
                    <div class="c-menu-left">
                        <svg viewBox="0 0 24 24" style="width:14px;height:14px;color:var(--text-main);" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <span class="c-menu-name">All Stores</span>
                    </div>
                    <span class="c-menu-count">${unboughtItems.length}</span>
                </button>
            `;
            
            sortedStores.forEach(storeName => {
                dropdownHtml += `
                    <button class="checkout-menu-item store-${storeName}" onclick="executeBatchCheckout('${storeName}')">
                        <div class="c-menu-left">
                            <img src="https://www.google.com/s2/favicons?domain=${storeName}.com&sz=32" class="p-store-logo" onerror="this.style.display='none'">
                            <span class="c-menu-name">${storeName}</span>
                        </div>
                        <span class="c-menu-count">${storeCounts[storeName]}</span>
                    </button>
                `;
            });
            checkoutMenu.innerHTML = dropdownHtml;
        }
    }

    const iconLink = `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
    const iconX = `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    const iconCheck = `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    let displayItems = [...cart.items].map((item, originalIdx) => ({ ...item, originalIdx }));
    
    if (state.currentSort === 'price-asc') displayItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    else if (state.currentSort === 'price-desc') displayItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    else if (state.currentSort === 'store') displayItems.sort((a, b) => a.site.localeCompare(b.site));

    // FIX: HTML Sanitizer to prevent DOM quote breaking!
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    displayItems.forEach((item) => {
        if (!item.bought) runningTotal += parseFloat(item.price || 0);
        
        const boughtClass = item.bought ? 'is-bought' : ''; 
        const safeSite = item.site ? item.site.toLowerCase().replace(/[^a-z0-9]/g, '') : 'generic';
        
        const markBoughtBtn = isOwner ? `<button class="btn-text" onclick="toggleItemState(${item.originalIdx})">${item.bought ? 'Undo' : iconCheck}</button>` : '';
        const deleteBtn = isOwner ? `<button class="btn-text text-danger" onclick="removeItem(${item.originalIdx})">${iconX}</button>` : '';

        // Properly escape all attributes to prevent layout blowout
        const safeTitle = escapeHTML(item.title);
        const safeImg = escapeHTML(item.img);
        const safeUrl = escapeHTML(item.url);
        const safePrice = parseFloat(item.price || 0).toFixed(2);

        listContainer.innerHTML += `
            <div class="product-card ${boughtClass} store-${safeSite}">
                <div class="p-img-wrapper"><img src="${safeImg}" class="p-img" loading="lazy" onerror="this.src='https://ui-avatars.com/api/?name=Image&background=f0f4f9&color=4b5563'"></div>
                <div class="p-details">
                    <div class="p-store-info">
                        <img src="https://www.google.com/s2/favicons?domain=${item.site}.com&sz=32" class="p-store-logo" onerror="this.style.display='none'">
                        <div class="p-site">${item.site}</div>
                    </div>
                    <div class="p-title-container"><div class="p-title selectable" title="${safeTitle}">${safeTitle}</div></div>
                    <div class="p-price selectable">$${safePrice}</div>
                </div>
                <div class="p-actions-stack">
                    <button class="btn-secondary" data-url="${safeUrl}" onclick="window.open(this.getAttribute('data-url'))">${iconLink}</button>
                    ${markBoughtBtn}
                    ${deleteBtn}
                </div>
            </div>`;
    });
    
    const totalPrice = document.getElementById('cart-total-price'); 
    if(totalPrice) totalPrice.innerText = `$${runningTotal.toFixed(2)}`;

    // Fade Transition Engine
    if (shouldFade) {
        const loader = document.getElementById('workspace-transition-loader');
        const fadeContainer = document.getElementById('workspace-fade-container');
        if (loader && fadeContainer) {
            loader.style.display = 'block';
            fadeContainer.style.opacity = '0';
            fadeContainer.classList.remove('workspace-fade-enter');
            
            // Force reflow and fade back in
            setTimeout(() => {
                loader.style.display = 'none';
                fadeContainer.classList.add('workspace-fade-enter');
            }, 300);
        }
    }
}

// --- UTILITIES ---
function toggleSidebar() {
    const sidebar = document.getElementById('workspace-sidebar'); 
    const backdrop = document.getElementById('sidebar-backdrop');
    if (window.innerWidth > 768) sidebar?.classList.toggle('collapsed'); 
    else { sidebar?.classList.toggle('mobile-open'); if(backdrop && sidebar) backdrop.classList.toggle('active-backdrop', sidebar.classList.contains('mobile-open')); }
}

function initIconSelector() {
    document.querySelectorAll('.icon-grid-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parentGrid = e.currentTarget.closest('.icon-selection-grid');
            parentGrid.querySelectorAll('.icon-grid-item').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            if (parentGrid.id === 'new-workspace-icon-grid') state.selectedIcon = e.currentTarget.getAttribute('data-icon');
        });
    });
}

function openSettingsModal() { 
    const usernameInput = document.getElementById('set-username');
    const pfpInput = document.getElementById('set-pfp-url');
    if(usernameInput) usernameInput.value = state.user || '';
    if(pfpInput) pfpInput.value = state.pfp || '';
    openModal('modal-settings'); switchSettingsTab('profile'); 
}

async function saveProfileSettings() {
    const btn = document.getElementById('btn-save-profile');
    const newUsername = document.getElementById('set-username').value.trim();
    const newPfp = document.getElementById('set-pfp-url').value.trim();
    
    btn.innerText = 'Saving...'; btn.disabled = true;
    try {
        state.user = newUsername || state.user; state.pfp = newPfp || state.pfp;
        renderHeaderProfile(); showToast('Profile updated.', 'success'); closeModal('modal-settings');
    } catch (e) { showToast('Failed to update profile.', 'error'); } 
    finally { btn.innerText = 'Save Profile'; btn.disabled = false; }
}

function switchSettingsTab(tabName) {
    const track = document.getElementById('settings-slider-track'); 
    document.querySelectorAll('#modal-settings .tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-set-target') === tabName));
    if(track) { if(tabName === 'profile') track.style.transform = 'translateX(0)'; else if (tabName === 'security') track.style.transform = 'translateX(-50%)'; }
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view')); 
    const target = document.getElementById(`view-${viewName}`); 
    if(target) target.classList.add('active-view');
    
    const loggedIn = !!auth.currentUser; 
    const navButtons = document.getElementById('nav-auth-buttons'); 
    const headerProfile = document.getElementById('header-authenticated-actions'); 
    const sidebar = document.getElementById('workspace-sidebar');
    const ctaBtn = document.getElementById('btn-hero-cta');
    
    if(navButtons) navButtons.style.display = (loggedIn || viewName === 'reset') ? 'none' : 'flex'; 
    if(headerProfile) {
        headerProfile.style.display = loggedIn ? 'flex' : 'none';
        if (viewName !== 'workspace') { document.getElementById('btn-header-share').style.display = 'none'; document.getElementById('btn-header-more').style.display = 'none'; }
    }

    if (sidebar) {
        if (viewName === 'landing' || viewName === 'faq' || viewName === 'terms' || viewName === 'privacy' || viewName === 'reset') sidebar.classList.add('force-hidden');
        else sidebar.classList.remove('force-hidden');
    }

    if (ctaBtn) {
        if (loggedIn) {
            ctaBtn.innerHTML = `Continue to Workspaces <svg viewBox="0 0 24 24" class="icon-svg-small" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
            ctaBtn.onclick = () => navigateTo('/workspaces');
        } else {
            ctaBtn.innerHTML = `Start Building Free <svg viewBox="0 0 24 24" class="icon-svg-small" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
            ctaBtn.onclick = () => openAuthModal('register');
        }
    }
}

function openAuthModal(mode) { openModal('modal-auth'); switchAuthMode(mode); }
function openModal(modalId) { document.getElementById(modalId)?.classList.add('active-modal'); }
function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('active-modal'); }

function switchAuthMode(mode) {
    state.authMode = mode; 
    const track = document.getElementById('auth-slider-track'); 
    const title = document.getElementById('auth-modal-title'); 
    const tabs = document.querySelector('.modal-tabs');
    const divider = document.getElementById('auth-divider-line');
    
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-auth-target') === mode));
    
    if (mode === 'recover') {
        tabs.style.display = 'none'; if(divider) divider.style.display = 'none'; document.getElementById('btn-google-auth').style.display = 'none';
    } else {
        tabs.style.display = 'flex'; if(divider) divider.style.display = 'flex'; document.getElementById('btn-google-auth').style.display = 'flex'; 
    }
    
    if(track) { 
        if(mode === 'login') { track.style.transform = 'translateX(0)'; if(title) title.innerText = 'Welcome Back'; } 
        else if(mode === 'register') { track.style.transform = 'translateX(-33.3333%)'; if(title) title.innerText = 'Create Account'; } 
        else if(mode === 'recover') { track.style.transform = 'translateX(-66.6666%)'; if(title) title.innerText = 'Recover Account'; } 
    }
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container'); if (!container) return; 
    const toast = document.createElement('div'); toast.className = `toast toast-${type}`;
    let icon = `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    if(type === 'success') icon = `<svg viewBox="0 0 24 24" class="icon-svg" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    toast.innerHTML = `<div class="toast-icon">${icon}</div> <div>${msg}</div>`; container.appendChild(toast); setTimeout(() => toast.remove(), 4000);
}
