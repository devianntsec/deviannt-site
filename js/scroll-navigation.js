// ===========================
// SCROLL NAVIGATION - VERSIÓN MODIFICADA
// Deshabilitado completamente en móviles (< 768px)
// Solo funciona en escritorio/tablet
// ===========================

const scrollNavigation = {
  CONFIG: {
    SCROLL_DELAY: 600,
    SCROLL_THRESHOLD: 30,
    WHEEL_THRESHOLD: 10,
    TOUCH_THRESHOLD: 30,
    MOBILE_BREAKPOINT: 768 // Punto de corte para móvil
  },

  init() {
    this.setupScrollNavigation();
  },
  
  // Verificar si estamos en móvil
  isMobile() {
    return window.innerWidth <= this.CONFIG.MOBILE_BREAKPOINT;
  },
  
  setupScrollNavigation() {
    const navLinks = $$('.navbar a');
    if (navLinks.length === 0) return;
    
    let isScrolling = false;
    let scrollTimeout = null;
    let scrollAccumulator = 0;
    let currentIndex = 0;
    
    // Encontrar índice actual
    navLinks.forEach((link, index) => {
      if (link.classList.contains('active')) currentIndex = index;
    });
    
    const changeToSection = (index) => {
      if (index < 0 || index >= navLinks.length) return;
      navLinks[index]?.click();
      currentIndex = index;
      scrollAccumulator = 0;
    };
    
    // ===========================
    // HANDLER PARA WHEEL (RUEDA DEL RATÓN)
    // ===========================
    const handleWheel = (e) => {
      // ✅ DESHABILITADO COMPLETAMENTE EN MÓVIL
      if (this.isMobile()) return;
      
      e.preventDefault();
      if (isScrolling) return;
      
      scrollAccumulator += Math.abs(e.deltaY);
      
      if (scrollAccumulator >= this.CONFIG.SCROLL_THRESHOLD) {
        const direction = e.deltaY > 0 ? 1 : -1;
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < navLinks.length) {
          isScrolling = true;
          changeToSection(newIndex);
          
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
            scrollAccumulator = 0;
          }, this.CONFIG.SCROLL_DELAY);
        } else {
          scrollAccumulator = 0;
        }
      }
    };
    
    // ===========================
    // HANDLER SIMPLE PARA WHEEL
    // ===========================
    const handleWheelSimple = (e) => {
      // DESHABILITADO COMPLETAMENTE EN MÓVIL
      if (this.isMobile()) return;
      
      e.preventDefault();
      if (isScrolling) return;
      
      if (Math.abs(e.deltaY) > this.CONFIG.WHEEL_THRESHOLD) {
        const direction = e.deltaY > 0 ? 1 : -1;
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < navLinks.length) {
          isScrolling = true;
          changeToSection(newIndex);
          
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
          }, this.CONFIG.SCROLL_DELAY);
        }
      }
    };
    
    // ===========================
    // HANDLER PARA TECLADO
    // ===========================
    const handleKeydown = (e) => {
      // DESHABILITADO EN MÓVIL (los móviles no tienen teclado físico)
      if (this.isMobile()) return;
      
      let newIndex = -1;
      
      // Flechas y Page Up/Down
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        newIndex = currentIndex + 1;
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        newIndex = currentIndex - 1;
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = navLinks.length - 1;
      } else if (e.code === 'Space') {
        e.preventDefault();
        newIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
      }
      
      if (newIndex >= 0 && newIndex < navLinks.length) {
        changeToSection(newIndex);
      }
    };
    
    // ===========================
    // HANDLER PARA TOUCH (MÓVIL/TABLET)
    // ===========================
    let touchStartY = 0;
    let touchStartX = 0;
    let touchMoved = false;
    
    const handleTouchStart = (e) => {
      // Guardar posición inicial del toque
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchMoved = false;
    };
    
    const handleTouchMove = (e) => {
      // EN MÓVIL: permitir scroll normal sin prevención
      if (this.isMobile()) {
        // No hacer nada, dejar que el navegador maneje el scroll
        return;
      }
      
      // EN ESCRITORIO: prevenir scroll para navegación
      if (!touchStartY) return;
      
      // Detectar si es movimiento más vertical que horizontal
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
      
      if (deltaY > deltaX && deltaY > 10) {
        e.preventDefault(); // Solo prevenir si es claramente vertical
        touchMoved = true;
      }
    };
    
    const handleTouchEnd = (e) => {
      // COMPLETAMENTE DESHABILITADO EN MÓVIL
      if (this.isMobile()) {
        touchStartY = 0;
        return;
      }
      
      // SOLO ESCRITORIO: procesar navegación por swipe
      if (!touchStartY || isScrolling || !touchMoved) {
        touchStartY = 0;
        return;
      }
      
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      
      if (Math.abs(deltaY) > this.CONFIG.TOUCH_THRESHOLD) {
        const direction = deltaY > 0 ? 1 : -1;
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < navLinks.length) {
          isScrolling = true;
          changeToSection(newIndex);
          
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
          }, this.CONFIG.SCROLL_DELAY);
        }
      }
      touchStartY = 0;
      touchMoved = false;
    };
    
    // ===========================
    // PERMITIR SCROLL INTERNO
    // ===========================
    const allowInternalScroll = (e) => {
      e.stopPropagation();
    };
    
    // ===========================
    // REGISTRAR EVENT LISTENERS
    // ===========================
    const setupEventListeners = () => {
      // Limpiar listeners existentes si los hay (por si acaso)
      window.removeEventListener('wheel', handleWheelSimple);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      // Registrar listeners
      window.addEventListener('wheel', handleWheelSimple.bind(this), { passive: false });
      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('touchstart', handleTouchStart.bind(this), { passive: true });
      window.addEventListener('touchmove', handleTouchMove.bind(this), { passive: false });
      window.addEventListener('touchend', handleTouchEnd.bind(this), { passive: true });
    };
    
    // Configurar listeners iniciales
    setupEventListeners();
    
    // ===========================
    // DETECTAR CAMBIOS DE TAMAÑO
    // ===========================
    window.addEventListener('resize', () => {});
    
    // ===========================
    // ELEMENTOS CON SCROLL INTERNO PERMITIDO
    // ===========================
    const scrollableElements = $$('.captcha-grid, .ig-post, .captcha-card, .projects-captcha, .captcha-cell');
    scrollableElements.forEach(element => {
      element.addEventListener('wheel', allowInternalScroll, { passive: false });
      element.addEventListener('touchmove', allowInternalScroll, { passive: false });
    });
    
    // ===========================
    // MENSAJE DE INICIALIZACIÓN
    // ===========================
    
    // Si estamos en móvil, mostrar mensaje claro
    if (this.isMobile()) {
    }
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  scrollNavigation.init();
});

// Exponer globalmente
window.scrollNavigation = scrollNavigation;