// ==========================================================================
// CORE.JS — utils.js + toast.js + hamburger.js
// ==========================================================================

// ─── utils.js ───
// ===========================
// UTILIDADES GENERALES
// ===========================

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

// ===========================
// TYPING EFFECT SUBTITLE
// NOTA: El typing ahora es gestionado por titles.js.
// Esta función se mantiene por compatibilidad pero no se usa.
// ===========================
function initTypingEffect() {
  const phrase = "Offensive Security Engineer";
  const typedText = $(".subtitle .typed-text");
  if (!typedText) return;
  
  let charIndex = 0;
  function type() {
    typedText.textContent = phrase.substring(0, charIndex);
    if (charIndex < phrase.length) {
      charIndex++;
      setTimeout(type, 80);
    }
  }
  type();
}

// ===========================
// DEBOUNCE
// ===========================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===========================
// THROTTLE
// ===========================
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

window.utils = {
  $, $$, initTypingEffect, debounce, throttle
};

// ─── toast.js ───
// ==========================================================================
// TOAST.JS - Sistema de notificaciones tipo toast/bubble
// ==========================================================================

const Toast = {
  toastElement: null,
  timeoutId: null,
  isVisible: false,

  init() {
    // Crear elemento toast si no existe
    if (!this.toastElement) {
      this.toastElement = document.createElement('div');
      this.toastElement.className = 'toast-notification';
      this.toastElement.setAttribute('role', 'alert');
      this.toastElement.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.toastElement);
    }
  },

  /**
   * Muestra un mensaje toast
   * @param {string} message - Mensaje a mostrar
   * @param {number} duration - Duración en ms (por defecto 4000)
   */
  show(message, duration = 2500) {
    this.init();
    
    // Si ya hay un toast visible, lo ocultamos primero
    if (this.isVisible) {
      this.hide();
      // Pequeña pausa antes de mostrar el nuevo
      setTimeout(() => {
        this._showMessage(message, duration);
      }, 150);
    } else {
      this._showMessage(message, duration);
    }
  },

  _showMessage(message, duration) {
    if (!this.toastElement) return;

    // Limpiar timeout anterior
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Actualizar mensaje
    this.toastElement.textContent = message;
    
    // Mostrar con animación
    setTimeout(() => {
      this.toastElement.classList.add('visible');
      this.isVisible = true;
    }, 10);

    // Programar ocultamiento
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, duration);
  },

  hide() {
    if (!this.toastElement || !this.isVisible) return;

    this.toastElement.classList.remove('visible');
    this.isVisible = false;

    // Limpiar timeout si existe
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  },

  destroy() {
    if (this.toastElement && this.toastElement.parentNode) {
      this.toastElement.parentNode.removeChild(this.toastElement);
    }
    this.toastElement = null;
    this.isVisible = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.toast = Toast;
  });
} else {
  window.toast = Toast;
}

// ─── hamburger.js ───
// ==========================================================================
// HAMBURGER.JS - Deshabilitado
// La navbar mobile ahora usa layout horizontal compacto igual que desktop.
// Este archivo se mantiene para no romper referencias en main.js.
// ==========================================================================

const hamburgerMenu = {
  isInitialized: false,
  hamburger: null,
  navbar: null,
  isMobile: false,

  init() {
    // No-op: navbar móvil es horizontal, no necesita hamburguesa
  },
  openMenu() {},
  closeMenu() {},
  toggleMenu() {},
  checkScreenSize() {},
  setupEventListeners() {},
  destroy() {
    this.isInitialized = false;
  }
};

window.hamburgerMenu = hamburgerMenu;