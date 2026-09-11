// ===========================
// CAPTCHA INTERACTIVO
// soporte de teclado (accesibilidad) en selectCell
// ===========================

const captcha = {
  init() {
    this.initCaptcha();
    this.initHint();
  },

  // ============================================================
  // HINT DE PRIMERA VISITA
  // ============================================================
  initHint() {
    const hint = $("#captcha-hint");
    if (!hint) return;

    const STORAGE_KEY = "deviannt_captcha_hint_seen";
    if (localStorage.getItem(STORAGE_KEY)) return;

    const dismiss = () => {
      hint.classList.remove("visible");
      localStorage.setItem(STORAGE_KEY, "1");
    };

    // Pequeño delay para que no compita con la animación de entrada del card
    const showTimer = setTimeout(() => hint.classList.add("visible"), 600);

    // Se retira tras la interaccion del usuario con el captcha, en su defecto, timeout de 6s
    container?.addEventListener("click", dismiss, { once: true });
    container?.addEventListener("keydown", dismiss, { once: true });

    setTimeout(dismiss, 6000);

    // Si el usuario navega fuera de la sección antes de que aparezca, no
    // hace falta mostrarlo igual.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(showTimer);
    }, { once: true });
  },

  initCaptcha() {
    const captchaCells = $$(".captcha-cell");
    const captchaIcons = $$(".captcha-footer-icons img");
    const verifyButton = $(".captcha-verify");
    if (!captchaCells.length || !verifyButton) return;
    
    const selectCell = (cell) => {
      captchaCells.forEach(c => { 
        c.classList.remove("selected"); 
        c.style.transform = c.style.boxShadow = "";
        c.setAttribute('aria-pressed', 'false');
        const svg = c.querySelector('.captcha-cell-svg');
        if (svg) svg.style.transform = "";
      });
      
      cell.classList.add("selected");
      cell.setAttribute('aria-pressed', 'true');
      cell.style.transform = "scale(0.88)";
      cell.style.boxShadow = "0 8px 18px rgba(0,0,0,0.25)";
      
      const selectedSvg = cell.querySelector('.captcha-cell-svg');
      const selectedText = cell.querySelector('.captcha-cell-text');
      if (selectedSvg) selectedSvg.style.transform = "scale(1.1)";
      if (selectedText) selectedText.style.transform = "translateY(-2px)";
    };
    
    captchaCells.forEach(cell => {
      cell.onclick = () => selectCell(cell);

      // Accesibilidad: permitir seleccionar con teclado (Enter / Espacio).
      // tabindex/role/aria-pressed reales se asignan en main.js al crear
      // el contenido de cada celda; aquí solo añadimos el comportamiento.
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          selectCell(cell);
        }
      });
    });

    if (captchaCells.length > 0) selectCell(captchaCells[0]);
    
    captchaIcons.forEach(icon => {
      icon.style.transform = '';
      icon.style.transition = 'transform 0.2s ease, filter 0.2s ease';
      icon.style.filter = 'grayscale(100%) brightness(0.7)';
      
      icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'translateY(-6px)';
        icon.style.filter = 'grayscale(100%) brightness(0.5)';
      });
      
      icon.addEventListener('mouseleave', () => {
        icon.style.transform = '';
        icon.style.filter = 'grayscale(100%) brightness(0.7)';
        void icon.offsetHeight;
      });
      
      icon.addEventListener('mousedown', (e) => {
        e.preventDefault();
        icon.style.transform = 'translateY(-3px) scale(0.9)';
      });
      
      icon.addEventListener('mouseup', (e) => {
        e.preventDefault();
        icon.style.transform = 'translateY(-6px)';
      });
      
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        icon.style.transform = 'translateY(-6px) scale(0.85)';
        setTimeout(() => { icon.style.transform = 'translateY(-6px)'; }, 100);
        setTimeout(() => {
          icon.style.transform = icon.matches(':hover') ? 'translateY(-6px)' : '';
        }, 200);
      });
      
      icon.addEventListener('blur', () => {
        icon.style.transform = '';
        icon.style.filter = 'grayscale(100%) brightness(0.7)';
      });
      
      icon.addEventListener('mouseout', () => {
        icon.style.transform = '';
        icon.style.filter = 'grayscale(100%) brightness(0.7)';
      });
    });
    
    // Botón verify
    verifyButton.onmouseenter = () => { 
      verifyButton.style.transform = "translateY(-2px) scale(1.02)"; 
      verifyButton.style.boxShadow = "0 6px 12px rgba(70,142,229,0.3)"; 
    };
    verifyButton.onmouseleave = () => { 
      verifyButton.style.transform = verifyButton.style.boxShadow = ""; 
    };
    verifyButton.onmousedown = () => { 
      verifyButton.style.transform = "translateY(0px) scale(0.98)"; 
      verifyButton.style.backgroundColor = "#3a7bc8"; 
    };
    verifyButton.onmouseup = () => { 
      verifyButton.style.transform = "translateY(-2px) scale(1.02)"; 
      verifyButton.style.backgroundColor = "#468EE5"; 
    };
    verifyButton.onclick = e => {
      e.preventDefault();
      const selectedCell = $(".captcha-cell.selected");
      if (!selectedCell) { 
        verifyButton.style.animation = "shake 0.5s"; 
        setTimeout(() => verifyButton.style.animation = "", 500); 
        return; 
      }
      verifyButton.style.transform = "translateY(0px) scale(0.95)";
      verifyButton.style.backgroundColor = "#2d6bb0";
      setTimeout(() => { 
        verifyButton.style.transform = "translateY(-2px) scale(1.05)"; 
        verifyButton.style.backgroundColor = "#468EE5"; 
      }, 150);
    };
  }
};

window.captcha = captcha;