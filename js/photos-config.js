// ==========================================================================
// PHOTOS-CONFIG.JS - Configuración de fotos del ig-post
//
// Es necesario ajustar las coordenadas del face bounding box según dónde esté el sujeto.
//
// COORDENADAS DEL FACE BOUNDING BOX:
//   top, left   → posición en % respecto al ig-post__image-wrapper
//   width, height → tamaño en % del wrapper
//
// Ejemplo real futuro:
//   { src: '/assets/images/photo1.jpg', label: 'Annais Molina', box: { top: '15%', left: '40%', width: '35%', height: '38%' } }
// ==========================================================================

const PHOTO_CONFIG = [
  {
    id: 'photo_02',
    src: '/assets/images/instagram-post-image2.png',
    label: 'Annais Molina',
    // --- Sujeto desplazado a la derecha ---
    box: {
      top:    '20%',
      left:   '46%',
      width:  '32%',
      height: '36%'
    }
  },
  {
    id: 'photo_03',
    src: '/assets/images/instagram-post-image3.png',
    label: 'Annais Molina',
    // --- Sujeto más centrado y grande (plano medio) ---
    box: {
      top:    '8%',
      left:   '8%',
      width:  '32%',
      height: '40%'
    }
  },
  {
    id: 'photo_05',
    src: '/assets/images/instagram-post-image5.png',
    label: 'Annais Molina',
    // --- Sujeto arriba a la izquierda ---
    box: {
      top:    '20%',
      left:   '60%',
      width:  '30%',
      height: '30%'
    }
  }
];

// ==========================================================================
// PHOTO MANAGER - Lógica de selección y aplicación
// ==========================================================================

const photoManager = {
  currentPhoto: null,

  /**
   * Selecciona una foto aleatoria de PHOTO_CONFIG y la aplica al ig-post.
   * Llamado una vez al cargar la página.
   */
  init() {
    const photo = this._pickRandom();
    this.currentPhoto = photo;
    this._applyPhoto(photo);
  },

  _pickRandom() {
    const index = Math.floor(Math.random() * PHOTO_CONFIG.length);
    return PHOTO_CONFIG[index];
  },

  /**
   * Aplica el color/imagen y reposiciona el face bounding box.
   */
  _applyPhoto(photo) {
    this._applyBackground(photo);
    this._applyBoundingBox(photo);
  },

  /**
   * Aplica el fondo al .ig-post__image.
   * Cuando haya fotos reales:
   *   imageEl.style.backgroundImage = `url('${photo.src}')`;
   *   imageEl.style.backgroundColor = '';
   */
  _applyBackground(photo) {
    const imageEl = document.querySelector('.ig-post__image');
    if (!imageEl) return;

    if (photo.src) {
      // Foto real
      imageEl.style.backgroundImage = `url('${photo.src}')`;
      imageEl.style.backgroundColor = '';
    } else if (photo.color) {
      // Color de prueba
      imageEl.style.backgroundImage = 'none';
      imageEl.style.backgroundColor = photo.color;
    }
  },

  /**
   * Reposiciona y redimensiona el .face-bounding-box según las coordenadas
   * configuradas para esta foto.
   */
  _applyBoundingBox(photo) {
    const box = document.querySelector('.face-bounding-box');
    if (!box || !photo.box) return;

    const { top, left, width, height } = photo.box;
    if (top    !== undefined) box.style.top    = top;
    if (left   !== undefined) box.style.left   = left;
    if (width  !== undefined) box.style.width  = width;
    if (height !== undefined) box.style.height = height;

    // Actualizar el label si está definido
    const label = box.querySelector('.face-bounding-box__label');
    if (label && photo.label) label.textContent = photo.label;
  },

  /**
   * Útil para depuración: fuerza una foto concreta por id.
   * Uso: photoManager.applyById('photo_03')
   */
  applyById(id) {
    const photo = PHOTO_CONFIG.find(p => p.id === id);
    if (!photo) { console.warn(`[photoManager] ID no encontrado: ${id}`); return; }
    this.currentPhoto = photo;
    this._applyPhoto(photo);
  },

  /**
   * Útil para depuración: cicla por todas las fotos cada 2s.
   * Uso: photoManager.debugCycle()
   */
  debugCycle(interval = 2000) {
    let i = 0;
    return setInterval(() => {
      this._applyPhoto(PHOTO_CONFIG[i % PHOTO_CONFIG.length]);
      i++;
    }, interval);
  }
};

window.PHOTO_CONFIG  = PHOTO_CONFIG;
window.photoManager  = photoManager;