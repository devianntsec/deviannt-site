// ===========================
// BLOG-FEED.JS - Feed de posts desde blog.deviannt.com
// Carga los últimos posts vía JSON y los renderiza en la sección blog
// Soporte para i18n: cambia la URL del feed según el idioma actual
// ===========================

const blogFeed = {
  BLOG_URL: 'https://blog.deviannt.com',
  BLOG_URL_ES: 'https://blog.deviannt.com/es',
  MAX_POSTS: 3,
  FETCH_TIMEOUT_MS: 6000,     // si el blog no responde, se muestra el fallback
  CACHE_TTL_MS: 10 * 60 * 1000, // cache en sessionStorage (evita pedir index.json en cada visita a la sección)
  isInitialized: false,
  isLoaded: false,
  _controller: null,

  init() {
    this.isInitialized = true;
    // Escuchar cambios de idioma para recargar el feed
    if (window.i18n) {
      window.i18n.onChange(() => {
        this.reset();
        this.load();
      });
    }
  },

  getFeedUrl() {
    const lang = window.i18n ? window.i18n.currentLang : 'en';
    const baseUrl = lang === 'es' ? this.BLOG_URL_ES : this.BLOG_URL;
    return `${baseUrl}/index.json`;
  },

  _cacheKey(url) { return 'blogfeed:' + url; },

  _readCache(url) {
    try {
      const raw = sessionStorage.getItem(this._cacheKey(url));
      if (!raw) return null;
      const { t, data } = JSON.parse(raw);
      return { fresh: Date.now() - t < this.CACHE_TTL_MS, data };
    } catch (e) { return null; }
  },

  _writeCache(url, data) {
    try { sessionStorage.setItem(this._cacheKey(url), JSON.stringify({ t: Date.now(), data })); }
    catch (e) { /* cuota llena o storage no disponible */ }
  },

  load() {
    if (this.isLoaded) return;

    const container = document.querySelector('.blog-feed-container');
    if (!container) return;

    const feedUrl = this.getFeedUrl();
    const cached = this._readCache(feedUrl);

    // Cache fresca: render inmediato, sin red.
    if (cached && cached.fresh) {
      this._render(container, this._parsePosts(cached.data));
      this.isLoaded = true;
      return;
    }

    this._showSkeleton(container);

    // Cancelar cualquier request anterior (cambio rápido de idioma/sección) y
    // poner un timeout para no dejar el skeleton colgado si el blog no responde.
    if (this._controller) this._controller.abort();
    const controller = new AbortController();
    this._controller = controller;
    const timer = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);

    fetch(feedUrl, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Feed no disponible');
        return res.json();
      })
      .then(data => {
        this._writeCache(feedUrl, data);
        this._render(container, this._parsePosts(data));
        this.isLoaded = true;
      })
      .catch((err) => {
        // Abort por reset()/cambio de idioma: no pintar nada, la nueva carga se encarga.
        if (err && err.name === 'AbortError' && this._controller !== controller) return;
        // Si la red falla pero hay cache (aunque vencida), es mejor que el fallback.
        if (cached && cached.data) {
          this._render(container, this._parsePosts(cached.data));
        } else {
          this._renderFallback(container);
        }
        this.isLoaded = true;
      })
      .finally(() => clearTimeout(timer));
  },

  reset() {
    if (this._controller) { this._controller.abort(); this._controller = null; }
    this.isLoaded = false;
    const container = document.querySelector('.blog-feed-container');
    if (container) container.innerHTML = '';
  },

  _parsePosts(data) {
    const items = Array.isArray(data) ? data : (data.items || []);
    const skip = ['404', 'Archives', 'About', 'Archivos', 'Acerca de'];
    return items
      .filter(item => item.title && !skip.includes(item.title) && item.categories !== null)
      .slice(0, this.MAX_POSTS)
      .map(item => ({
        title: item.title || 'Sin título',
        date: this._formatDate(item.date || item.date_published || item.date_modified || ''),
        url: item.permalink || item.url || this.BLOG_URL,
        excerpt: this._truncate(item.contents || item.summary || item.content_text || '', 140),
        tags: (item.tags || []).slice(0, 4),
        categories: (item.categories || []).slice(0, 2)
      }));
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr.slice(0, 10);
    }
  },

  _truncate(text, max) {
    const clean = text.replace(/<[^>]*>/g, '').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max).replace(/\s+\S*$/, '') + '...';
  },

  _escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  _safeUrl(url, fallback) {
    try {
      const parsed = new URL(url, fallback);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch (e) {
      // URL inválida -> usar fallback
    }
    return fallback;
  },

  _showSkeleton(container) {
    container.innerHTML = `
      <div class="blog-feed-skeleton">
        <div class="blog-skeleton-card">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
        </div>
        <div class="blog-skeleton-card">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
        </div>
        <div class="blog-skeleton-card">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
        </div>
      </div>
    `;
  },

  _render(container, posts) {
    if (!posts.length) {
      this._renderFallback(container);
      return;
    }

    const label = this._escapeHTML(i18n.getText('blog.feed.label'));
    const viewAll = this._escapeHTML(i18n.getText('blog.feed.viewall'));
    // Usar la URL del blog según el idioma para el enlace "ver todos"
    const blogUrl = window.i18n && window.i18n.currentLang === 'es' ? this.BLOG_URL_ES : this.BLOG_URL;

    const cardsHTML = posts.map((post, i) => {
      const rawCatLabel = post.categories.length
        ? post.categories.join(' · ')
        : (post.tags[0] ? post.tags[0] : 'Post');
      const catLabel = this._escapeHTML(rawCatLabel);
      const safeHref = this._safeUrl(post.url, blogUrl);
      const safeTitle = this._escapeHTML(post.title);
      const safeExcerpt = this._escapeHTML(post.excerpt);
      const safeTags = post.tags.map(t => this._escapeHTML(t));

      return `
        <a class="blog-post-card${i === 0 ? ' blog-post-card--featured' : ''}"
           href="${safeHref}"
           target="_blank"
           rel="noopener noreferrer">
          <div class="blog-card-header">
            <span class="blog-card-cat">${catLabel}</span>
            <span class="blog-card-date">${this._escapeHTML(post.date)}</span>
          </div>
          <div class="blog-card-title">${safeTitle}</div>
          ${safeExcerpt ? `<div class="blog-card-excerpt">${safeExcerpt}</div>` : ''}
          ${safeTags.length ? `
            <div class="blog-card-tags">
              ${safeTags.map(t => `<span class="blog-card-tag">${t}</span>`).join('')}
            </div>
          ` : ''}
          <div class="blog-card-arrow">→</div>
        </a>
      `;
    }).join('');

    const safeBlogUrl = this._safeUrl(blogUrl, this.BLOG_URL);

    container.innerHTML = `
      <div class="blog-feed-label">${label}</div>
      <div class="blog-posts-list">
        ${cardsHTML}
      </div>
      <div class="blog-feed-footer">
        <div class="blog-feed-divider"></div>
        <a class="blog-view-all"
           href="${safeBlogUrl}"
           target="_blank"
           rel="noopener noreferrer">
          ${viewAll}
        </a>
      </div>
    `;

    requestAnimationFrame(() => {
      container.querySelectorAll('.blog-post-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 80);
      });
    });
  },

  _renderFallback(container) {
    const label = this._escapeHTML(i18n.getText('blog.feed.label'));
    const fallbackText = this._escapeHTML(i18n.getText('blog.fallback.text'));
    const fallbackBtn = this._escapeHTML(i18n.getText('blog.fallback.btn'));
    const blogUrl = window.i18n && window.i18n.currentLang === 'es' ? this.BLOG_URL_ES : this.BLOG_URL;
    const safeBlogUrl = this._safeUrl(blogUrl, this.BLOG_URL);

    container.innerHTML = `
      <div class="blog-feed-fallback">
        <div class="blog-feed-label">${label}</div>
        <p class="blog-fallback-text">${fallbackText}</p>
        <a class="blog-fallback-btn"
           href="${safeBlogUrl}"
           target="_blank"
           rel="noopener noreferrer">
          ${fallbackBtn}
        </a>
      </div>
    `;
  }
};

window.blogFeed = blogFeed;