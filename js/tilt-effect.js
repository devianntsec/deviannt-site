// ===========================
// TILT EFFECT - VERSIÓN CON PAUSA SUAVE EN SCROLL
// + PAUSA POR VISIBILIDAD DE PESTAÑA Y VIEWPORT (optimización batería/CPU)
// ===========================

const tiltEffect = {
  intervals: {
    igPost: null,
    captcha: null
  },
  angles: {
    igPost: 0,
    captcha: 2  // El +2 que tenías antes
  },
  isScrolling: false,
  scrollTimeout: null,

  // ===========================
  // OPTIMIZACIÓN: estado de visibilidad global (pestaña) y por-elemento
  // (viewport). Los loops de animación consultan estos flags en cada
  // iteración; si cualquiera es false, se salta el trabajo de cálculo/
  // pintado pero el loop sigue vivo (para reanudar sin reinicializar).
  // ===========================
  isPageVisible: true,
  elementsVisible: {
    igPost: true,
    captcha: true
  },
  observers: [],

  prefersReducedMotion: false,

  init() {
    const isMobile = window.innerWidth <= 1024;
    this.prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Limpiar intervals anteriores
    this.clearIntervals();
    this._teardownObservers();

    this.isPageVisible = !document.hidden;
    this._setupVisibilityListener();
    this._setupIntersectionObservers();

    if (this.prefersReducedMotion) {
      if (!isMobile) {
        // Se mantiene el tilt que responde al mouse (gesto activo del
        // usuario, no autoplay) pero sin el idle loop que rota solo.
        this.startDesktopTilt($(".ig-post"), 'igPost', { autoRotate: false });
        this.startDesktopTilt($(".captcha-card"), 'captcha', { autoRotate: false });
      }
      // En mobile no hay hover posible, así que queda estático sin más.
      return;
    }

    if (isMobile) {
      this.startMobileAnimation();
      this.setupScrollListener();
    } else {
      this.startDesktopTilt($(".ig-post"), 'igPost');
      this.startDesktopTilt($(".captcha-card"), 'captcha');
    }

    this.setupResizeListener();
  },

  // ===========================
  // Pausa global cuando la pestaña no está visible
  // ===========================
  _setupVisibilityListener() {
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
    }
    this._visibilityHandler = () => {
      this.isPageVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', this._visibilityHandler);
  },

  // ===========================
  // Pausa por elemento cuando sale del viewport (p.ej. el usuario está
  // en la sección "projects" y el ig-post está oculto/fuera de pantalla)
  // ===========================
  _setupIntersectionObservers() {
    const igPost = $('.ig-post');
    const captcha = $('.captcha-card');

    if (igPost) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.elementsVisible.igPost = entry.isIntersecting;
        });
      }, { threshold: 0.01 });
      obs.observe(igPost);
      this.observers.push(obs);
    }

    if (captcha) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.elementsVisible.captcha = entry.isIntersecting;
        });
      }, { threshold: 0.01 });
      obs.observe(captcha);
      this.observers.push(obs);
    }
  },

  _teardownObservers() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  },

  clearIntervals() {
    if (this.intervals.igPost) {
      clearInterval(this.intervals.igPost);
      this.intervals.igPost = null;
    }
    if (this.intervals.captcha) {
      clearInterval(this.intervals.captcha);
      this.intervals.captcha = null;
    }
  },

  startMobileAnimation() {
    const igPost = $('.ig-post');
    const captcha = $('.captcha-card');
    
    if (!igPost || !captcha) {
      return;
    }
    
    // Resetear ángulos si es necesario
    this.angles.igPost = 0;
    this.angles.captcha = 2;
    
    // Guardar referencia a this para usar en los callbacks
    const self = this;
    
    // ANIMACIÓN PARA IG POST
    this.intervals.igPost = setInterval(() => {
      // OPTIMIZACIÓN: pausa si la pestaña no está visible o el elemento
      // está fuera del viewport — no se calcula ni se pinta nada.
      if (!self.isPageVisible || !self.elementsVisible.igPost) return;

      // Si está scrolleando, solo actualizar el ángulo pero no aplicar transform
      if (self.isScrolling) {
        self.angles.igPost += 0.03;
        return;
      }
      
      const px = 0.5 + 0.4 * Math.cos(self.angles.igPost);
      const py = 0.5 + 0.4 * Math.sin(self.angles.igPost);
      const tiltX = 10 - px * 20;
      const tiltY = py * 20 - 10;
      
      igPost.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale(1.07)`;
      
      self.angles.igPost += 0.03;
    }, 40);

    // ANIMACIÓN PARA CAPTCHA
    this.intervals.captcha = setInterval(() => {
      if (!self.isPageVisible || !self.elementsVisible.captcha) return;

      // Si está scrolleando, solo actualizar el ángulo pero no aplicar transform
      if (self.isScrolling) {
        self.angles.captcha += 0.03;
        return;
      }
      
      const px = 0.5 + 0.4 * Math.cos(self.angles.captcha);
      const py = 0.5 + 0.4 * Math.sin(self.angles.captcha);
      const tiltX = 10 - px * 20;
      const tiltY = py * 20 - 10;
      
      captcha.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale(1.07)`;
      
      self.angles.captcha += 0.03;
    }, 40);
  },

  setupScrollListener() {
    const self = this;
    
    window.addEventListener('scroll', () => {
      // Si no estaba scrolleando, marcamos inicio
      if (!self.isScrolling) {
        self.isScrolling = true;
      }
      
      // Limpiar timeout anterior
      if (self.scrollTimeout) {
        clearTimeout(self.scrollTimeout);
      }
      
      // Programar fin del scroll
      self.scrollTimeout = setTimeout(() => {
        self.isScrolling = false;
      }, 100);
      
    }, { passive: true });
  },

  startDesktopTilt(element, elementKey, options = {}) {
    if (!element) return;
    const enableAutoRotate = options.autoRotate !== false;
    
    const CONFIG = {
      MAX_TILT: 20,
      PERSPECTIVE: 1000,
      SCALE: 1.07,
      SPEED: 300,
      AUTO_ROTATE_RADIUS: 0.4,
      AUTO_ROTATE_SPEED: 0.005
    };
    
    let angle = 0;
    let isHover = false;
    let animationFrame;
    const self = this;
    
    element.style.transformStyle = "preserve-3d";
    
    const addTransition = () => {
      element.classList.add("tilt-transition");
      clearTimeout(element._tt);
      element._tt = setTimeout(() => {
        element.classList.remove("tilt-transition");
      }, CONFIG.SPEED);
    };
    
    const notifyConnectionLine = () => {
      if (window.connectionLine && element.classList.contains('ig-post')) {
        setTimeout(() => window.connectionLine.update(true), 10);
      }
    };
    
    const updateTransform = (px, py) => {
      const tiltX = CONFIG.MAX_TILT / 2 - px * CONFIG.MAX_TILT;
      const tiltY = py * CONFIG.MAX_TILT - CONFIG.MAX_TILT / 2;
      element.style.transform = `perspective(${CONFIG.PERSPECTIVE}px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale(${CONFIG.SCALE})`;
      notifyConnectionLine();
    };
    
    function autoRotate() {
      // OPTIMIZACIÓN: si la pestaña no está visible o el elemento está
      // fuera del viewport, seguimos pidiendo el próximo frame (para no
      // tener que reinicializar el loop) pero sin calcular ni pintar.
      const elVisible = elementKey ? self.elementsVisible[elementKey] : true;
      if (!self.isPageVisible || !elVisible) {
        animationFrame = requestAnimationFrame(autoRotate);
        return;
      }

      if (!isHover) {
        const px = 0.5 + CONFIG.AUTO_ROTATE_RADIUS * Math.cos(angle);
        const py = 0.5 + CONFIG.AUTO_ROTATE_RADIUS * Math.sin(angle);
        updateTransform(px, py);
        angle += CONFIG.AUTO_ROTATE_SPEED;
      }
      animationFrame = requestAnimationFrame(autoRotate);
    }
    if (enableAutoRotate) autoRotate();
    
    element.addEventListener("mouseenter", () => { 
      isHover = true; 
      addTransition();
      // OPTIMIZACIÓN: will-change solo durante la interacción activa,
      // no permanente (ver css/components.css .will-animate)
      element.classList.add('will-animate');
    });
    
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      addTransition();
      updateTransform(px, py);
    });
    
    element.addEventListener("mouseleave", () => { 
      isHover = false; 
      addTransition();
      notifyConnectionLine();
      setTimeout(() => element.classList.remove('will-animate'), CONFIG.SPEED);
    });
  },

  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        
        // Limpiar transforms
        if ($(".ig-post")) $(".ig-post").style.transform = '';
        if ($(".captcha-card")) $(".captcha-card").style.transform = '';
        this.clearIntervals();
        this._teardownObservers();
        
        // Reiniciar
        this.init();
      }, 250);
    });
  }
};

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tiltEffect.init());
} else {
  tiltEffect.init();
}

window.tiltEffect = tiltEffect;