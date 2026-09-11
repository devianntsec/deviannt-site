class ConnectionLine {
  constructor() {
    this.path = document.getElementById('connection-path');
    this.faceBox = document.querySelector('.face-bounding-box');
    this.socialWrapper = document.querySelector('.social-wrapper');
    this.navbar = document.getElementById('navbar');
    
    this.isAnimating = false;
    this.animationFrameId = null;
    this.currentSection = 'deviannt';
    this.hasAnimated = false;
    this.animationTimeout = null;
    
    this.CONFIG = {
      REVEAL_DELAY: 20,
      ANIMATION_DURATION: 1200,
      GAP_FIX: 1.5, // Ajuste para eliminar el gap visual
    };
    
    this.init();
  }

  init() {
    this._setupInitialState();
    this._updateCurrentSection();
    setTimeout(() => this._checkElementsAndStart(), 200);
    this._setupObservers();
  }

  _setupInitialState() {
    if (!this.path) return;
    Object.assign(this.path.style, {
      opacity: '0',
      transition: 'none',
      strokeDasharray: '0 1000',
      strokeDashoffset: '0'
    });
    this.path.classList.remove('visible', 'animating');
  }

  _updateCurrentSection() {
    const activeLink = this.navbar?.querySelector('a.active');
    this.currentSection = activeLink?.dataset.title || 'deviannt';
  }

  _setupObservers() {
    if (this.navbar) {
      const observer = new MutationObserver(() => {
        const oldSection = this.currentSection;
        this._updateCurrentSection();
        if (this.currentSection === 'deviannt' && oldSection !== 'deviannt') {
          this.update(true);
          // OPTIMIZACIÓN: el loop de _startContinuousTracking() se detiene
          // a sí mismo en cuanto currentSection deja de ser 'deviannt' (ver
          // más abajo), así que al volver hay que reanudarlo explícitamente.
          this._startContinuousTracking();
        }
      });
      observer.observe(this.navbar, { attributes: true, attributeFilter: ["class"], subtree: true });
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('#navbar a')) setTimeout(() => this._updateCurrentSection(), 10);
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.update(true);
        if (this.currentSection === 'deviannt' && this.hasAnimated) this.resetAnimation();
      }, 100);
    });
  }

  _checkElementsAndStart() {
    if (!this.faceBox || !this.socialWrapper || !this.path) {
      setTimeout(() => {
        this.faceBox = document.querySelector('.face-bounding-box');
        this.socialWrapper = document.querySelector('.social-wrapper');
        this._checkElementsAndStart();
      }, 200);
      return;
    }
    
    this.update(true);
    if (this.currentSection === 'deviannt') setTimeout(() => this.resetAnimation(), 300);
    this._startContinuousTracking();
  }

  _startContinuousTracking() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    const updateLoop = () => {
      if (this.currentSection !== 'deviannt') {
        this.animationFrameId = null;
        return;
      }
      if (!this.isAnimating) this.update();
      this.animationFrameId = requestAnimationFrame(updateLoop);
    };
    this.animationFrameId = requestAnimationFrame(updateLoop);
  }

  _getCoordinates() {
    if (!this.faceBox || !this.socialWrapper) return null;
    const faceRect = this.faceBox.getBoundingClientRect();
    const wrapperRect = this.socialWrapper.getBoundingClientRect();
    
    // Punto de inicio: esquina inferior derecha del face bounding box
    let start = { x: faceRect.right, y: faceRect.bottom };
    // Punto de fin: esquina superior izquierda del social wrapper
    let end = { x: wrapperRect.left, y: wrapperRect.top };
    
    // Calcular vector dirección (de start a end)
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    
    if (length > 0) {
      // Desplazar el punto de inicio hacia atrás (hacia el interior del face box)
      // para eliminar el gap visual debido al stroke-linecap redondo
      const unitX = dx / length;
      const unitY = dy / length;
      start = {
        x: start.x - unitX * this.CONFIG.GAP_FIX,
        y: start.y - unitY * this.CONFIG.GAP_FIX
      };
      // Opcional: también desplazar el punto final hacia el interior del social wrapper
      // para evitar que sobresalga (opcional, por si acaso)
      end = {
        x: end.x + unitX * this.CONFIG.GAP_FIX,
        y: end.y + unitY * this.CONFIG.GAP_FIX
      };
    }
    
    return { start, end };
  }

  update() {
    if (this.currentSection !== 'deviannt' || !this.path) return;
    const coords = this._getCoordinates();
    if (!coords) return;
    
    this.path.setAttribute('x1', coords.start.x);
    this.path.setAttribute('y1', coords.start.y);
    this.path.setAttribute('x2', coords.end.x);
    this.path.setAttribute('y2', coords.end.y);
    
    if (!this.isAnimating && this.hasAnimated) {
      this.path.style.opacity = '1';
      this.path.classList.add('visible');
    }
  }

  hideImmediately() {
    if (!this.path) return;
    clearTimeout(this.animationTimeout);
    Object.assign(this.path.style, {
      transition: 'none',
      opacity: '0',
      strokeDasharray: '0 1000',
      strokeDashoffset: '0'
    });
    this.path.classList.remove('visible', 'animating');
    this.isAnimating = false;
    this.hasAnimated = false;
    void this.path.offsetHeight;
  }

  resetAnimation() {
    if (this.currentSection !== 'deviannt' || !this.path) return;

    clearTimeout(this.animationTimeout);
    this.hideImmediately();
    this.update();

    this.animationTimeout = setTimeout(() => {
      if (this.currentSection !== 'deviannt') return;

      const coords = this._getCoordinates();
      if (!coords) return;

      const dx = coords.end.x - coords.start.x;
      const dy = coords.end.y - coords.start.y;
      const totalLength = Math.hypot(dx, dy);

      if (totalLength < 10) {
        this.animationTimeout = setTimeout(() => this.resetAnimation(), 50);
        return;
      }

      Object.assign(this.path.style, {
        transition: 'none',
        strokeDasharray: `${totalLength}`,
        strokeDashoffset: totalLength,
        opacity: '1'
      });
      this.path.classList.add('animating');
      void this.path.offsetHeight;

      requestAnimationFrame(() => {
        this.path.style.transition = `stroke-dashoffset ${this.CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.77, 0, 0.175, 1)`;
        this.path.style.strokeDashoffset = '0';
        this.isAnimating = true;

        setTimeout(() => {
          if (!this.path) return;
          Object.assign(this.path.style, {
            transition: 'none',
            strokeDasharray: 'none',
            strokeDashoffset: '0'
          });
          this.path.classList.remove('animating');
          this.path.classList.add('visible');
          this.isAnimating = false;
          this.hasAnimated = true;
        }, this.CONFIG.ANIMATION_DURATION);
      });
    }, this.CONFIG.REVEAL_DELAY);
  }

  destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    clearTimeout(this.animationTimeout);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { window.connectionLine = new ConnectionLine(); }, 50);
  window.addEventListener('load', () => {
    if (window.connectionLine) {
      setTimeout(() => {
        window.connectionLine.update(true);
        if (window.connectionLine.currentSection === 'deviannt') window.connectionLine.resetAnimation();
      }, 200);
    }
  });
});