// ===========================
// TEXT-FIT — Ajusta el tamaño de fuente de .description--indented
// (modo texto plano, no projects-links-mode) para que quepa en una
// sola línea, con el MÍNIMO ajuste necesario.
//
// Estrategia: en vez de ir bajando de a poco (lo cual sobre-reduce),
// se mide el ancho real del texto al tamaño base (CSS) y se calcula
// directamente el factor de escala exacto: newSize = baseSize * (
// clientWidth / scrollWidth). Solo se aplica un pequeño ajuste fino
// adicional por si el escalado no es 100% lineal (letter-spacing,
// kerning), evitando así que el texto quede desproporcionadamente
// pequeño.
// ===========================

(function () {
  const MIN_FONT_SIZE = 10;   // px — piso mínimo, nunca baja de aquí
  const SAFETY_MARGIN = 0.985; // pequeño colchón anti-overflow por redondeo subpíxel
  const FINE_STEP = 0.25;      // px — paso de ajuste fino (solo corrige residuos)

  function getTargetElement() {
    const el = document.querySelector('.description--indented:not(.projects-links-mode)');
    if (!el || !el.textContent.trim()) return null;
    return el;
  }

  function fitDescriptionText() {
    const el = getTargetElement();
    if (!el) return;

    // 1) Volver al tamaño base definido por el CSS de este breakpoint
    el.style.fontSize = '';
    const baseFontSize = parseFloat(window.getComputedStyle(el).fontSize);
    el.style.fontSize = baseFontSize + 'px';

    const clientW = el.clientWidth;
    const scrollW = el.scrollWidth;

    // Si ya cabe, no tocar nada (ajuste mínimo = ningún ajuste)
    if (scrollW <= clientW || clientW <= 0) return;

    // 2) Calcular el factor de escala exacto en un solo paso
    const ratio = (clientW / scrollW) * SAFETY_MARGIN;
    let newSize = Math.max(MIN_FONT_SIZE, baseFontSize * ratio);
    el.style.fontSize = newSize + 'px';

    // 3) Ajuste fino: corrige el pequeño residuo si el escalado lineal
    //    no fue perfecto (letter-spacing no escala igual que el texto)
    let guard = 0;
    while (el.scrollWidth > el.clientWidth && newSize > MIN_FONT_SIZE && guard < 20) {
      newSize -= FINE_STEP;
      el.style.fontSize = newSize + 'px';
      guard++;
    }
  }

  let resizeTimeout;
  function scheduleFit() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(fitDescriptionText, 50);
  }

  window.addEventListener('resize', scheduleFit);
  window.addEventListener('load', () => setTimeout(fitDescriptionText, 100));
  document.addEventListener('DOMContentLoaded', () => setTimeout(fitDescriptionText, 50));

  // Re-fit tras cambiar de sección (esperar a que termine la transición)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#navbar a')) {
      setTimeout(fitDescriptionText, 450);
    }
  });

  // Re-medir cuando las fuentes terminen de cargar (font-display: swap
  // puede medir con la fuente de fallback si se llama demasiado pronto)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => fitDescriptionText());
  }

  window.fitDescriptionText = fitDescriptionText;
})();