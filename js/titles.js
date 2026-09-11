// ===========================
// TITLE CONFIGURATION - VERSIÓN CON i18n
// ===========================

const TITLE_CONFIG = {
  deviannt: {
    titleKey: 'title.deviannt',
    subtitleKey: 'subtitle.deviannt',
    showDescription: true,
    descriptionKey: 'desc.deviannt',
    indentedKey: 'indented.about.services'
  },
  projects: {
    titleKey: 'title.projects',
    showDescription: true,
    descriptionKey: ''
  },
  blog: {
    titleKey: 'title.blog',
    subtitleKey: 'subtitle.blog',
    showDescription: true,
    descriptionKey: 'desc.blog'
  },
  contact: {
    titleKey: 'title.contact',
    subtitleKey: 'subtitle.contact',
    showDescription: false,
    descriptionKey: ''
  }
};

// ===========================
// GESTOR DE TYPING
// ===========================
const typingManager = {
  currentTimeout: null,
  isAnimating: false,
  targetElement: null,
  fullText: '',
  speed: 72,
  
  stopCurrentAnimation() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.isAnimating = false;
  },
  
  setTextInstantly(element, text) {
    if (!element) return;
    element.textContent = text;
    this.isAnimating = false;
  },
  
  startTyping(element, text) {
    if (!element) return;
    this.stopCurrentAnimation();
    this.targetElement = element;
    this.fullText = text;
    element.textContent = '';
    this.isAnimating = true;
    this.typeNextCharacter(0);
  },
  
  typeNextCharacter(index) {
    if (!this.isAnimating || !this.targetElement) return;
    if (index >= this.fullText.length) {
      this.isAnimating = false;
      return;
    }
    this.targetElement.textContent += this.fullText.charAt(index);
    this.currentTimeout = setTimeout(() => {
      this.typeNextCharacter(index + 1);
    }, this.speed);
  }
};

// ===========================
// FUNCIONES DEL TITLE MANAGER
// ===========================

function getTitleConfig(section) {
  return TITLE_CONFIG[section] || TITLE_CONFIG.deviannt;
}

function updateTitle(section) {
  const config = getTitleConfig(section);
  const titleElement = $('.title-select span');
  const subtitleElement = $('.subtitle .typed-text');
  const descriptionElements = $$('.description');
  const indentedDescriptionEl = $('.description--indented');
  
  typingManager.stopCurrentAnimation();
  
  if (titleElement) {
    const titleText = i18n.getText(config.titleKey);
    titleElement.textContent = titleText;
    const parent = titleElement.parentElement;
    parent.classList.remove("animate");
    void parent.offsetWidth;
    parent.classList.add("animate");
  }
  
  if (subtitleElement) {
    let newSubtitle;
    if (section === "projects") {
      const projectData = window.projectSelector?.getCurrentProjectData?.();
      if (projectData && projectData.subtitle) {
        newSubtitle = projectData.subtitle;
      } else {
        newSubtitle = i18n.getText('subtitle.projects');
      }
    } else {
      newSubtitle = i18n.getText(config.subtitleKey);
    }
    
    if (section === "projects") {
      typingManager.setTextInstantly(subtitleElement, newSubtitle);
    } else {
      setTimeout(() => {
        typingManager.startTyping(subtitleElement, newSubtitle);
      }, 20);
    }
  }
  
  descriptionElements.forEach((el, index) => {
    if (config.showDescription) {
      el.style.display = 'block';
      if (index === 0) {
        if (section === "projects") {
          const projectData = window.projectSelector?.getCurrentProjectData?.();
          el.textContent = projectData ? projectData.description : i18n.getText('desc.projects');
        } else {
          el.innerHTML = i18n.getText(config.descriptionKey);
        }
      } else if (index === 1) {
        if (section === "blog") {
          el.style.display = 'none';
        } else if (section !== "contact") {
          el.style.display = 'block';
          // ─── AQUÍ ESTÁ EL CAMBIO ───
          if (section === "deviannt") {
            el.innerHTML = i18n.getText('indented.about.services');
          }
          // ─────────────────────────
        } else {
          el.style.display = 'none';
        }
      }
    } else {
      el.style.display = 'none';
    }
  });

  // Blog: construir layout de 2 columnas con feed
  if (section === "blog") {
    _ensureBlogTwoColLayout(false);
    if (window.blogFeed) {
      setTimeout(() => window.blogFeed.load(), 150);
    }
  }

  if (section !== "blog") {
    _teardownBlogTwoColLayout();
  }

  if (indentedDescriptionEl && section !== "blog" && section !== "contact") {
    if (section !== "projects") {
      indentedDescriptionEl.style.display = 'block';
      indentedDescriptionEl.style.paddingLeft = '';
      indentedDescriptionEl.style.textAlign = '';
      indentedDescriptionEl.style.marginLeft = '';
      indentedDescriptionEl.style.marginRight = '';
    }
  }
}

// ===========================
// BLOG 2-COLUMN LAYOUT
// ===========================

let _blogOriginalNodes = null;
let _blogTwoColEl = null;

function _ensureBlogTwoColLayout(repositionCard = true) {
  const inner = $('.content-stack-inner');
  if (!inner) return;

  if (_blogTwoColEl && inner.contains(_blogTwoColEl)) {
    _blogTwoColEl.style.display = 'flex';
    const feedContainer = _blogTwoColEl.querySelector('.blog-feed-container');
    if (feedContainer) feedContainer.style.display = 'block';
    if (repositionCard) _repositionSocialCard();
    return;
  }

  _blogOriginalNodes = Array.from(inner.childNodes).map(n => ({
    node: n,
    nextSibling: n.nextSibling
  }));

  const titleEl      = inner.querySelector('.title-select');
  const subtitleEl   = inner.querySelector('.subtitle');
  const descEl       = inner.querySelector('.description:not(.description--indented)');
  const indentedEl   = inner.querySelector('.description--indented');

  const twoCol = document.createElement('div');
  twoCol.className = 'blog-two-col';
  _blogTwoColEl = twoCol;

  const leftCol = document.createElement('div');
  leftCol.className = 'blog-left-col';

  if (titleEl)    leftCol.appendChild(titleEl);
  if (subtitleEl) leftCol.appendChild(subtitleEl);
  if (descEl)     leftCol.appendChild(descEl);
  if (indentedEl) { indentedEl.style.display = 'none'; leftCol.appendChild(indentedEl); }

  // Live indicator
  const liveIndicator = document.createElement('div');
  liveIndicator.className = 'blog-live-indicator';
  liveIndicator.innerHTML = i18n.getText('blog.live.indicator');
  leftCol.appendChild(liveIndicator);

  // CTA button
  const ctaBtn = document.createElement('a');
  ctaBtn.className = 'blog-cta-btn';
  ctaBtn.href = 'https://blog.deviannt.com';
  ctaBtn.target = '_blank';
  ctaBtn.rel = 'noopener noreferrer';
  ctaBtn.innerHTML = i18n.getText('blog.cta');
  leftCol.appendChild(ctaBtn);

  // Anchor para el social card
  const socialAnchor = document.createElement('div');
  socialAnchor.className = 'blog-social-anchor';
  socialAnchor.id = 'blog-social-anchor';
  leftCol.appendChild(socialAnchor);

  const rightCol = document.createElement('div');
  rightCol.className = 'blog-right-col';

  const feedContainer = document.createElement('div');
  feedContainer.className = 'blog-feed-container';
  rightCol.appendChild(feedContainer);

  twoCol.appendChild(leftCol);
  twoCol.appendChild(rightCol);

  inner.innerHTML = '';
  inner.appendChild(twoCol);

  if (repositionCard) _repositionSocialCard();
}

function _teardownBlogTwoColLayout() {
  if (!_blogTwoColEl) return;
  const inner = $('.content-stack-inner');
  if (!inner) return;

  const titleEl    = _blogTwoColEl.querySelector('.title-select');
  const subtitleEl = _blogTwoColEl.querySelector('.subtitle');
  const descEl     = _blogTwoColEl.querySelector('.description:not(.description--indented)');
  const indentedEl = _blogTwoColEl.querySelector('.description--indented');

  _restoreSocialCard();

  inner.innerHTML = '';

  if (titleEl)    inner.appendChild(titleEl);
  if (subtitleEl) inner.appendChild(subtitleEl);
  if (descEl)     inner.appendChild(descEl);
  if (indentedEl) {
    indentedEl.style.display = '';
    inner.appendChild(indentedEl);
  }

  _blogTwoColEl = null;
  _blogOriginalNodes = null;

  if (window.blogFeed) window.blogFeed.reset();
}

function _repositionSocialCard() {
  const anchor = document.getElementById('blog-social-anchor');
  const socialWrapper = document.querySelector('.social-wrapper');
  if (!anchor || !socialWrapper) return;
  if (window.innerWidth <= 768) return;

  if (!socialWrapper._blogOriginalParent) {
    socialWrapper._blogOriginalParent = socialWrapper.parentNode;
    socialWrapper._blogOriginalNextSibling = socialWrapper.nextSibling;
  }

  anchor.appendChild(socialWrapper);
  socialWrapper.style.position = 'absolute';
  socialWrapper.style.bottom = '0';
  socialWrapper.style.left = '0';
  socialWrapper.style.top = '';
  socialWrapper.style.right = '';
  socialWrapper.style.width = '250px';
  socialWrapper.style.height = '80px';
  socialWrapper.style.opacity = '1';
  socialWrapper.style.pointerEvents = 'auto';
  socialWrapper.style.animation = 'float-natural 6s ease-in-out infinite';
}

function _restoreSocialCard() {
  const socialWrapper = document.querySelector('.social-wrapper');
  if (!socialWrapper || !socialWrapper._blogOriginalParent) return;

  const parent = socialWrapper._blogOriginalParent;
  const next   = socialWrapper._blogOriginalNextSibling;

  if (next && next.parentNode === parent) {
    parent.insertBefore(socialWrapper, next);
  } else {
    parent.appendChild(socialWrapper);
  }

  delete socialWrapper._blogOriginalParent;
  delete socialWrapper._blogOriginalNextSibling;
}

function stopTypingAnimation() {
  typingManager.stopCurrentAnimation();
}

// ===========================
// INICIALIZACIÓN
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  window.titleManager = {
    getConfig: getTitleConfig,
    update: updateTitle,
    config: TITLE_CONFIG,
    stopTyping: stopTypingAnimation,
    _ensureBlogTwoColLayout: _ensureBlogTwoColLayout,
    _repositionSocialCard: _repositionSocialCard,
    _restoreSocialCard: _restoreSocialCard,
    _teardownBlogTwoColLayout: _teardownBlogTwoColLayout
  };
  
  if (window.i18n) {
    window.i18n.onChange(() => {
      const activeLink = $('.navbar a.active');
      const section = activeLink ? activeLink.dataset.title : 'deviannt';
      updateTitle(section);
      if (section === 'projects' && window.projectSelector) {
        window.projectSelector.forceUpdate();
      }
      if (section === 'blog' && window.blogFeed) {
        window.blogFeed.reset();
        setTimeout(() => window.blogFeed.load(), 100);
      }
    });
  }

  const activeLink = $('.navbar a.active');
  updateTitle(activeLink ? activeLink.dataset.title : 'deviannt');
});