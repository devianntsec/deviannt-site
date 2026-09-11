// ===========================
// NAVIGATION & SECTIONS - VERSIÓN CORREGIDA (BLOG → ABOUT CON ANIMACIONES)
// FIX: alignItems unificado a "flex-start" en todas las secciones para que
// el título quede siempre en la misma coordenada Y (ver css/main.css,
// variables --title-top / --title-top-mobile / --nav-height).
// El cálculo de targetTop de más abajo mide el subtítulo EN VIVO, así que si no reseteamos el scroll
// antes, la card expandida crece hacia un punto Y incorrecto. En el
// resto de secciones layoutRight.scrollTop ya es 0, así que resetear
// siempre es inofensivo.
// A11Y: aria-current="page" se sincroniza con la clase "active" del
// link de navegación (añadido/quitado en el mismo punto donde se
// gestiona .active), para que lectores de pantalla anuncien la
// sección actual. Ver bloque links.forEach() más abajo.
// ===========================

const navigation = {
  isAnimating: false,
  lastSection: 'deviannt',
  animationTimeout: null,

  init() {
    this.setupNavigation();
  },

  CONFIG: {
    ANIMATION_DURATION: 400,
    BLOG_ANIMATION_DURATION: 600,
    POSITIONS: {
      deviannt: { left: '-55px', bottom: '32px', class: 'position-about' },
      projects: { left: 'calc(65%)', bottom: '32px', class: 'position-projects' },
    }
  },

  setupNavigation() {
    const navbar = $("#navbar");
    const selector = $("#selector");
    const links = $$("a", navbar);
    const layoutRight = $(".layout-right");
    const originalSocialWrapper = $(".social-wrapper");

    if (!navbar || !selector || !links.length) return;

    const isMobile = () => window.innerWidth <= 768;

    const moveSelector = (target) => {
      const navRect = navbar.getBoundingClientRect();
      const linkRect = target.getBoundingClientRect();
      selector.style.width = `${linkRect.width}px`;
      selector.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
    };

    const applyPosition = (targetSection, animate = false) => {
      if (!originalSocialWrapper) return;
      if (targetSection === "blog") return;

      originalSocialWrapper.classList.remove('position-about', 'position-projects', 'position-blog');

      if (animate) {
        originalSocialWrapper.classList.remove('no-transition');
      } else {
        originalSocialWrapper.classList.add('no-transition');
      }

      originalSocialWrapper.style.left = '';
      originalSocialWrapper.style.top = '';
      originalSocialWrapper.style.right = '';
      originalSocialWrapper.style.bottom = '';
      originalSocialWrapper.style.position = 'absolute';
      originalSocialWrapper.style.width = '250px';
      originalSocialWrapper.style.height = '80px';

      if (targetSection === "deviannt") {
        originalSocialWrapper.classList.add('position-about');
        originalSocialWrapper.style.left = '-55px';
        originalSocialWrapper.style.bottom = '32px';
      } else if (targetSection === "projects") {
        originalSocialWrapper.classList.add('position-projects');
        originalSocialWrapper.style.left = 'calc(65%)';
        originalSocialWrapper.style.bottom = '32px';
      }

      originalSocialWrapper.style.animation = 'float-natural 6s ease-in-out infinite';
      originalSocialWrapper.style.opacity = '1';
      originalSocialWrapper.style.pointerEvents = 'auto';

      if (animate) {
        setTimeout(() => {
          originalSocialWrapper.classList.remove('no-transition');
        }, 1000);
      }
    };

    const applyBlogContentStack = () => {
      const contentStack = $(".content-stack");
      if (!contentStack) return;
      if (isMobile()) return;
      contentStack.style.position = "relative";
      contentStack.style.top = "";
      contentStack.style.left = "";
      contentStack.style.transform = "";
      contentStack.style.margin = "0";
      contentStack.style.width = "100%";
      contentStack.style.alignItems = "flex-start";
      const inner = contentStack.querySelector('.content-stack-inner');
      if (inner) {
        inner.style.alignItems = "flex-start";
        inner.style.textAlign = "left";
      }
    };

    // ===========================
    // BLOQUE DE SERVICIOS (reutilizable para móvil)
    // ===========================
    const createContactServicesBlock = () => {
      const div = document.createElement('div');
      div.className = 'contact-services-mobile';
      div.innerHTML = `
        <div class="contact-services">
          <a href="mailto:me@deviannt.com?subject=Charla%20%2F%20Capacitaci%C3%B3n" class="contact-service-item" id="service-talks">
            <span class="contact-service-item__name" data-i18n="service.talks.name">${i18n.getText('service.talks.name')}</span>
            <span class="contact-service-item__desc" data-i18n="service.talks.desc">${i18n.getText('service.talks.desc')}</span>
          </a>
          <a href="https://www.linkedin.com/in/annais-molina-fuentes/" target="_blank" rel="noopener noreferrer" class="contact-service-item" id="service-consulting">
            <span class="contact-service-item__name" data-i18n="service.consulting.name">${i18n.getText('service.consulting.name')}</span>
            <span class="contact-service-item__desc" data-i18n="service.consulting.desc">${i18n.getText('service.consulting.desc')}</span>
          </a>
        </div>
      `;
      return div;
    };

    // ===========================
    // CARD DE CONTACTO (con opción de incluir servicios)
    // ===========================
    const createContactExpandedCard = (includeServices = true) => {
      const el = document.createElement('div');
      el.className = 'social-wrapper contact-expanded-instance';
      el.id = 'contact-expanded-card';

      let servicesHTML = '';
      if (includeServices) {
        servicesHTML = `
          <div class="contact-services">
            <a href="mailto:me@deviannt.com?subject=Charla%20%2F%20Capacitaci%C3%B3n" class="contact-service-item" id="service-talks">
              <span class="contact-service-item__name" data-i18n="service.talks.name">${i18n.getText('service.talks.name')}</span>
              <span class="contact-service-item__desc" data-i18n="service.talks.desc">${i18n.getText('service.talks.desc')}</span>
            </a>
            <a href="https://www.linkedin.com/in/annais-molina-fuentes/" target="_blank" rel="noopener noreferrer" class="contact-service-item" id="service-consulting">
              <span class="contact-service-item__name" data-i18n="service.consulting.name">${i18n.getText('service.consulting.name')}</span>
              <span class="contact-service-item__desc" data-i18n="service.consulting.desc">${i18n.getText('service.consulting.desc')}</span>
            </a>
          </div>
        `;
      }

      el.innerHTML = `
        <div class="social-card">
          <div class="social-card__inner">
            <div class="social-card__label">social media</div>
            <div class="social-card__content">
              ${servicesHTML}
              <div class="contact-grid-expanded">
                <div class="contact-row-expanded">
                  <a href="https://www.linkedin.com/in/annais-molina-fuentes/" target="_blank" rel="noopener noreferrer" class="contact-icon-item-expanded">
                    <div class="contact-icon-wrapper-expanded"><img src="assets/icons/linkedin-circle.svg" alt="LinkedIn" class="contact-icon-svg-expanded"></div>
                    <span class="contact-icon-text-expanded">LinkedIn</span>
                  </a>
                  <a href="https://github.com/devianntsec" target="_blank" rel="noopener noreferrer" class="contact-icon-item-expanded">
                    <div class="contact-icon-wrapper-expanded"><img src="assets/icons/github-circle.svg" alt="GitHub" class="contact-icon-svg-expanded"></div>
                    <span class="contact-icon-text-expanded">GitHub</span>
                  </a>
                  <a href="https://t.me/devianntsec" target="_blank" rel="noopener noreferrer" class="contact-icon-item-expanded">
                    <div class="contact-icon-wrapper-expanded"><img src="assets/icons/telegram-circle.svg" alt="Telegram" class="contact-icon-svg-expanded"></div>
                    <span class="contact-icon-text-expanded">Telegram</span>
                  </a>
                </div>
                <div class="contact-row-expanded">
                  <a href="#" class="contact-icon-item-expanded email-copy-trigger" data-email="me@deviannt.com">
                    <div class="contact-icon-wrapper-expanded"><img src="assets/icons/envelope-circle.svg" alt="Email" class="contact-icon-svg-expanded"></div>
                    <span class="contact-icon-text-expanded">Email</span>
                  </a>
                  <a href="https://instagram.com/devianntsec" target="_blank" rel="noopener noreferrer" class="contact-icon-item-expanded">
                    <div class="contact-icon-wrapper-expanded"><img src="assets/icons/instagram-circle.svg" alt="Instagram" class="contact-icon-svg-expanded"></div>
                    <span class="contact-icon-text-expanded">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Evento para copiar email
      setTimeout(() => {
        const emailTrigger = el.querySelector('.email-copy-trigger');
        if (emailTrigger) {
          emailTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailTrigger.dataset.email;
            navigator.clipboard.writeText(email).then(() => {
              if (window.toast) window.toast.show(`${email} copiado al portapapeles!`);
            }).catch(() => {
              const textarea = document.createElement('textarea');
              textarea.value = email;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              if (window.toast) window.toast.show(`${email} copiado al portapapeles`);
            });
          });
        }
      }, 100);
      return el;
    };

    const createNormalSocialCard = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'social-wrapper position-blog';
      wrapper.style.cssText = 'position:absolute; bottom:0; left:0; width:250px; height:80px; animation:float-natural 6s ease-in-out infinite;';
      wrapper.innerHTML = `
        <div class="social-card">
          <div class="social-card__inner">
            <div class="social-card__label">social media</div>
            <div class="social-card__content">
              <a href="https://www.linkedin.com/in/annais-molina-fuentes/" target="_blank" rel="noopener noreferrer">
                <img src="assets/icons/linkedin-circle.svg" alt="LinkedIn" class="social-icon">
              </a>
              <a href="https://github.com/devianntsec" target="_blank" rel="noopener noreferrer">
                <img src="assets/icons/github-circle.svg" alt="GitHub" class="social-icon">
              </a>
              <span class="social-card__handle">@devianntsec</span>
            </div>
          </div>
        </div>
      `;
      return wrapper;
    };

    const hideAllElementsImmediately = () => {
      const igPost = $(".ig-post");
      const captcha = $(".projects-captcha");
      const faceBox = $(".face-bounding-box");
      if (igPost) igPost.style.display = 'none';
      if (captcha) captcha.style.display = 'none';
      if (faceBox) faceBox.style.opacity = '0';
    };

    const restoreElementsInstantly = (targetSection) => {
      const igPost = $(".ig-post");
      const captcha = $(".projects-captcha");
      const captchaCard = $(".captcha-card");
      const faceBox = $(".face-bounding-box");
      const contentStack = $(".content-stack");
      const layoutRight = $('.layout-right');

      layoutRight.classList.remove("is-projects", "is-contact", "is-blog");

      if (targetSection === "deviannt") {
        layoutRight.style.width = "45%";
        layoutRight.style.height = "calc(100vh - var(--nav-height))";
        layoutRight.style.position = "relative";
        layoutRight.style.left = "auto";
        layoutRight.style.top = "auto";
        layoutRight.style.display = "flex";
        layoutRight.style.justifyContent = "center";
        layoutRight.style.alignItems = "flex-start";
        layoutRight.style.pointerEvents = "auto";
        layoutRight.style.zIndex = "30";
        layoutRight.style.overflow = "";
      } else if (targetSection === "projects") {
        layoutRight.classList.add("is-projects");
        layoutRight.style.width = "45%";
        layoutRight.style.height = "calc(100vh - var(--nav-height))";
        layoutRight.style.position = "relative";
        layoutRight.style.left = "auto";
        layoutRight.style.top = "auto";
        layoutRight.style.display = "flex";
        layoutRight.style.justifyContent = "flex-start";
        layoutRight.style.alignItems = "flex-start";
        layoutRight.style.pointerEvents = "auto";
        layoutRight.style.zIndex = "30";
        layoutRight.style.overflow = "";
      } else if (targetSection === "blog") {
        layoutRight.classList.add("is-blog");
        if (isMobile()) {
          layoutRight.style.position = "";
          layoutRight.style.top = "";
          layoutRight.style.left = "";
          layoutRight.style.width = "";
          layoutRight.style.height = "";
          layoutRight.style.display = "";
          layoutRight.style.justifyContent = "";
          layoutRight.style.alignItems = "";
          layoutRight.style.zIndex = "";
          layoutRight.style.pointerEvents = "";
          layoutRight.style.overflow = "";
        } else {
          layoutRight.style.position = "relative";
          layoutRight.style.top = "";
          layoutRight.style.left = "";
          layoutRight.style.width = "100%";
          layoutRight.style.height = "calc(100vh - var(--nav-height))";
          layoutRight.style.display = "flex";
          layoutRight.style.justifyContent = "flex-start";
          layoutRight.style.alignItems = "flex-start";
          layoutRight.style.zIndex = "30";
          layoutRight.style.pointerEvents = "auto";
          layoutRight.style.overflowY = "auto";
        }
      }

      if (contentStack) {
        const contentStackInner = contentStack.querySelector('.content-stack-inner');

        if (targetSection === "deviannt") {
          contentStack.style.position = "";
          contentStack.style.top = "";
          contentStack.style.left = "";
          contentStack.style.transform = "";
          contentStack.style.alignItems = "center";
          if (contentStackInner) {
            contentStackInner.style.alignItems = "center";
            contentStackInner.style.textAlign = "center";
            const titleSelect = contentStackInner.querySelector('.title-select');
            if (titleSelect) {
              titleSelect.style.justifyContent = "center";
              titleSelect.style.marginLeft = "auto";
              titleSelect.style.marginRight = "auto";
            }
          }
        } else if (targetSection === "projects") {
          contentStack.style.position = "";
          contentStack.style.top = "";
          contentStack.style.left = "";
          contentStack.style.transform = "translateX(-150px)";
          contentStack.style.alignItems = "flex-start";
          if (contentStackInner) {
            contentStackInner.style.alignItems = "flex-start";
            contentStackInner.style.textAlign = "left";
            const titleSelect = contentStackInner.querySelector('.title-select');
            if (titleSelect) {
              titleSelect.style.justifyContent = "flex-start";
              titleSelect.style.marginLeft = "0";
            }
          }
        } else if (targetSection === "blog") {
          if (!isMobile()) {
            applyBlogContentStack();
          }
        }
      }

      if (igPost) {
        igPost.style.display = targetSection === 'deviannt' ? 'block' : 'none';
        if (targetSection === 'deviannt') {
          igPost.style.transition = 'none';
          igPost.style.transform = 'translateX(-100px)';
          igPost.classList.remove("ig-animate-in");
          igPost.classList.remove("ig-pre-animate");
        }
      }
      if (captcha) {
        captcha.style.display = targetSection === 'projects' ? 'flex' : 'none';
        if (targetSection === 'projects' && captchaCard) {
          captchaCard.style.transition = 'none';
          captchaCard.style.transform = 'translateX(100px)';
          captchaCard.classList.remove("captcha-animate-in");
          void captchaCard.offsetHeight;
          captchaCard.style.transition = 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
          captchaCard.classList.add("captcha-animate-in");
        }
      }
      if (faceBox) faceBox.style.opacity = targetSection === 'deviannt' ? '1' : '0';

      if (window.titleManager) window.titleManager.update(targetSection);
    };

    // ===========================
    // CONTACTO MÓVIL
    // ===========================
    const animateToContactMobile = () => {
      // --- LIMPIEZA PREVIA SI VIENE DE BLOG ---
      if (window.titleManager?._teardownBlogTwoColLayout) {
        window.titleManager._teardownBlogTwoColLayout();
      }
      if (originalSocialWrapper) {
        originalSocialWrapper.style.display = '';
        originalSocialWrapper.classList.remove('position-blog');
        originalSocialWrapper.style.animation = '';
        originalSocialWrapper.style.transform = '';
      }

      hideAllElementsImmediately();

      layoutRight.classList.remove("is-projects", "is-blog");
      layoutRight.classList.add("is-contact");

      layoutRight.style.position = "relative";
      layoutRight.style.top = "auto";
      layoutRight.style.left = "auto";
      layoutRight.style.width = "100%";
      layoutRight.style.height = "auto";
      layoutRight.style.display = "flex";
      layoutRight.style.flexDirection = "column";
      layoutRight.style.justifyContent = "flex-start";
      layoutRight.style.alignItems = "center";
      layoutRight.style.zIndex = "100";
      layoutRight.style.pointerEvents = "auto";
      layoutRight.style.minHeight = "100vh";

      if (originalSocialWrapper) originalSocialWrapper.style.display = 'none';

      const contentStackInner = $(".content-stack-inner");
      if (contentStackInner) {
        // Eliminar card previa y bloque de servicios móvil previo
        const prevCard = contentStackInner.querySelector('#contact-expanded-card');
        if (prevCard) prevCard.remove();
        const prevServices = contentStackInner.querySelector('.contact-services-mobile');
        if (prevServices) prevServices.remove();

        // Crear card SIN servicios (includeServices = false) para móvil
        const contactCard = createContactExpandedCard(false);
        contactCard.id = 'contact-expanded-card';
        contactCard.classList.remove('social-wrapper');
        contactCard.classList.add('contact-expanded-mobile');

        // Crear bloque de servicios móvil
        const servicesBlock = createContactServicesBlock();

        // Insertar servicios antes de la card (arriba)
        contentStackInner.appendChild(servicesBlock);
        contentStackInner.appendChild(contactCard);

        // Animaciones de entrada
        contactCard.style.opacity = '0';
        contactCard.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          contactCard.style.transition = 'opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)';
          contactCard.style.opacity = '1';
          contactCard.style.transform = 'translateY(0)';
        });

        contactCard.querySelectorAll('.contact-icon-item-expanded').forEach((item, index) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(12px)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 100 + index * 60);
        });

        // Animar también el bloque de servicios (entrada suave)
        servicesBlock.style.opacity = '0';
        servicesBlock.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
          servicesBlock.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          servicesBlock.style.opacity = '1';
          servicesBlock.style.transform = 'translateY(0)';
        });
      }

      this.lastSection = 'contact';
    };

    const animateFromContactMobile = (targetSection) => {
      const contactCard = $('#contact-expanded-card') || $(".contact-expanded-mobile");
      if (contactCard) contactCard.remove();
      // Eliminar bloque de servicios móvil
      const servicesBlock = document.querySelector('.contact-services-mobile');
      if (servicesBlock) servicesBlock.remove();

      if (originalSocialWrapper) originalSocialWrapper.style.display = '';

      restoreElementsInstantly(targetSection);

      const layout = document.querySelector('.layout');
      if (layout) {
        layout.setAttribute('data-section', targetSection);
        layout.classList.remove('projects-active', 'blog-active', 'contact-active');
        if (targetSection === 'projects') layout.classList.add('projects-active');
        else if (targetSection === 'blog') layout.classList.add('blog-active');
      }

      this.lastSection = targetSection;
    };

    // ---------------------------------------------------------------------
    // GROW → CONTACTO (helper compartido para desktop)
    // ---------------------------------------------------------------------
    const _growSocialIntoContact = (sourceElement, { hideSource, cleanupSource } = {}) => {
      if (!sourceElement || this.isAnimating) return;

      this.isAnimating = true;
      if (window.connectionLine) window.connectionLine.hideImmediately();

      if (layoutRight) layoutRight.scrollTop = 0;

      const startRect = sourceElement.getBoundingClientRect();
      hideAllElementsImmediately();

      const subtitle = $(".subtitle");
      const targetTop = subtitle ? subtitle.getBoundingClientRect().bottom + 80 : (window.innerHeight / 2) - 90;
      const targetWidth = 680, targetHeight = 320;
      const targetLeft = (window.innerWidth / 2) - (targetWidth / 2);

      const animElement = document.createElement('div');
      animElement.className = 'social-card-animating growing';
      Object.assign(animElement.style, {
        left: startRect.left + 'px', top: startRect.top + 'px',
        width: startRect.width + 'px', height: startRect.height + 'px'
      });
      ['left', 'top', 'width', 'height'].forEach(prop => {
        animElement.style.setProperty(`--start-${prop}`, startRect[prop] + 'px');
        animElement.style.setProperty(`--end-${prop}`, targetLeft + 'px');
      });
      animElement.style.setProperty('--end-top', targetTop + 'px');
      animElement.style.setProperty('--end-width', targetWidth + 'px');
      animElement.style.setProperty('--end-height', targetHeight + 'px');

      const clonedCard = sourceElement.querySelector('.social-card').cloneNode(true);
      // Ocultar servicios en el clon (por si acaso)
      const services = clonedCard.querySelector('.contact-services');
      if (services) services.style.display = 'none';
      animElement.appendChild(clonedCard);

      if (hideSource) hideSource(sourceElement);
      document.body.appendChild(animElement);

      // Crear card DE DESKTOP con servicios incluidos (includeServices = true)
      const contactCard = createContactExpandedCard(true);
      Object.assign(contactCard.style, {
        left: targetLeft + 'px', top: targetTop + 'px',
        width: targetWidth + 'px', height: targetHeight + 'px',
        opacity: '0', pointerEvents: 'none', zIndex: '19999', transition: 'none'
      });
      contactCard.querySelectorAll('.contact-icon-item-expanded').forEach(item => item.style.opacity = '0');
      document.body.appendChild(contactCard);

      layoutRight.classList.remove("is-projects", "is-blog");
      layoutRight.classList.add("is-contact");
      layoutRight.style.position = "fixed";
      layoutRight.style.top = "0";
      layoutRight.style.left = "0";
      layoutRight.style.width = "100vw";
      layoutRight.style.height = "100vh";
      layoutRight.style.display = "block";
      layoutRight.style.zIndex = "100";
      layoutRight.style.pointerEvents = "none";

      animElement.style.animation = `social-card-grow ${this.CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`;
      const content = animElement.querySelector('.social-card__content');
      if (content) content.style.opacity = '0';

      setTimeout(() => {
        contactCard.style.opacity = '1';
        contactCard.style.pointerEvents = 'auto';
        contactCard.querySelectorAll('.contact-icon-item-expanded').forEach((item, index) => {
          item.style.animation = `contact-icon-appear 0.2s ease ${0.02 + index * 0.01}s forwards`;
        });
        animElement.remove();
        if (cleanupSource) cleanupSource(sourceElement);
        this.isAnimating = false;
      }, this.CONFIG.ANIMATION_DURATION);

      contactCard.setAttribute('data-active', 'true');
      this.lastSection = 'contact';
    };

    // ===========================
    // CONTACTO DESKTOP (desde deviannt / projects)
    // ===========================
    const animateToContact = () => {
      _growSocialIntoContact(originalSocialWrapper, {
        hideSource: (el) => {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
      });
    };

    // ===========================
    // CONTACTO DESKTOP (desde blog)
    // ===========================
    const animateToContactFromBlog = () => {
      const blogSocial = document.querySelector('.blog-social-anchor .social-wrapper');
      _growSocialIntoContact(blogSocial, {
        hideSource: (el) => {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
        },
        cleanupSource: (el) => {
          if (el && el.parentNode) el.remove();
        }
      });
    };

    const animateFromContact = (targetSection) => {
      const contactCard = $('#contact-expanded-card');
      if (!contactCard || !originalSocialWrapper || this.isAnimating) return;

      this.isAnimating = true;
      const startRect = contactCard.getBoundingClientRect();

      restoreElementsInstantly(targetSection);
      applyPosition(targetSection, false);

      if (targetSection === 'deviannt' && !isMobile()) {
        const igPost = $(".ig-post");
        if (igPost) {
          igPost.style.transition = '';
          igPost.style.transform = '';
          requestAnimationFrame(() => {
            igPost.style.display = 'block';
            igPost.classList.remove('ig-pre-animate', 'ig-animate-in');
            void igPost.offsetHeight;
            igPost.classList.add('ig-pre-animate');
            void igPost.offsetHeight;
            igPost.classList.remove('ig-pre-animate');
            igPost.classList.add('ig-animate-in');
          });
        }
      }

      originalSocialWrapper.style.opacity = '0';
      originalSocialWrapper.style.pointerEvents = 'none';

      void originalSocialWrapper.offsetHeight;
      const endRect = originalSocialWrapper.getBoundingClientRect();

      const animElement = document.createElement('div');
      animElement.className = 'social-card-animating shrinking expanded-style';
      Object.assign(animElement.style, {
        left: startRect.left + 'px', top: startRect.top + 'px',
        width: startRect.width + 'px', height: startRect.height + 'px'
      });
      ['left', 'top', 'width', 'height'].forEach(prop => {
        animElement.style.setProperty(`--start-${prop}`, startRect[prop] + 'px');
        animElement.style.setProperty(`--end-${prop}`, endRect[prop] + 'px');
      });

      const clonedCard = contactCard.querySelector('.social-card').cloneNode(true);
      // Ocultar servicios en el clon
      const services = clonedCard.querySelector('.contact-services');
      if (services) services.style.display = 'none';
      animElement.appendChild(clonedCard);

      originalSocialWrapper.style.opacity = '0';
      originalSocialWrapper.style.pointerEvents = 'none';
      contactCard.style.opacity = '0';
      contactCard.style.pointerEvents = 'none';
      document.body.appendChild(animElement);

      animElement.querySelectorAll('.contact-icon-item-expanded, .contact-grid-expanded').forEach(el => el.style.opacity = '0');
      animElement.style.animation = `social-card-shrink ${this.CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`;

      setTimeout(() => {
        animElement.remove();
        contactCard.remove();
        originalSocialWrapper.style.opacity = '1';
        originalSocialWrapper.style.pointerEvents = 'auto';

        const content = originalSocialWrapper.querySelector('.social-card__content');
        if (content) {
          content.style.opacity = '0';
          content.style.transform = 'translateX(20px)';
          content.style.transition = 'none';
          void content.offsetWidth;
          content.style.transition = 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
          content.style.opacity = '1';
          content.style.transform = 'translateX(0)';

          const linksEl = content.querySelectorAll('a');
          linksEl.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'translateX(-15px)';
            link.style.transition = 'none';
            void link.offsetWidth;
            link.style.transition = 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
            link.style.opacity = '1';
            link.style.transform = 'translateX(0)';
            link.style.transitionDelay = `${0.05 + index * 0.05}s`;
          });

          const handle = content.querySelector('.social-card__handle');
          if (handle) {
            handle.style.opacity = '0';
            handle.style.transform = 'translateX(-15px)';
            handle.style.transition = 'none';
            void handle.offsetWidth;
            handle.style.transition = 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
            handle.style.opacity = '1';
            handle.style.transform = 'translateX(0)';
            handle.style.transitionDelay = `${0.05 + linksEl.length * 0.05}s`;
          }
        }

        if (targetSection === 'deviannt' && window.connectionLine) {
          setTimeout(() => window.connectionLine.resetAnimation(), 50);
        }
        this.isAnimating = false;
      }, this.CONFIG.ANIMATION_DURATION);

      this.lastSection = targetSection;
    };

    // ===========================
    // BLOG — helpers de animación
    // ===========================

    const _animateClone = (clone, startR, endR, duration, onDone) => {
      const startTime = performance.now();
      const dLeft   = endR.left   - startR.left;
      const dTop    = endR.top    - startR.top;
      const dWidth  = endR.width  - startR.width;
      const dHeight = endR.height - startR.height;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const e = ease(t);
        clone.style.left   = (startR.left   + dLeft   * e) + 'px';
        clone.style.top    = (startR.top    + dTop    * e) + 'px';
        clone.style.width  = (startR.width  + dWidth  * e) + 'px';
        clone.style.height = (startR.height + dHeight * e) + 'px';
        if (t < 1) requestAnimationFrame(tick);
        else onDone();
      };
      requestAnimationFrame(tick);
    };

    const _makeClone = (sourceElement, rect, isContactExpanded = false) => {
      let cloneContainer = document.createElement('div');
      cloneContainer.style.cssText = [
        'position:fixed',
        `left:${rect.left}px`,
        `top:${rect.top}px`,
        `width:${rect.width}px`,
        `height:${rect.height}px`,
        'z-index:20000',
        'pointer-events:none',
        'background:var(--bg-card)',
        'border:none',
        'box-sizing:border-box',
        'overflow:visible !important',
        'box-shadow:0 0 30px rgba(59,130,246,0.2)',
        'margin:0','padding:0','transform:none','transition:none','animation:none'
      ].join(';');

      let cardClone;
      if (isContactExpanded) {
        const wrapper = document.createElement('div');
        wrapper.className = 'contact-expanded-instance';
        wrapper.style.cssText = 'all:initial; display:block; width:100%; height:100%;';
        cardClone = sourceElement.querySelector('.social-card').cloneNode(true);
        // Ocultar servicios en el clon (si existen)
        const services = cardClone.querySelector('.contact-services');
        if (services) services.style.display = 'none';
        wrapper.appendChild(cardClone);
        cloneContainer.appendChild(wrapper);
      } else {
        cardClone = sourceElement.querySelector('.social-card').cloneNode(true);
        cloneContainer.appendChild(cardClone);
      }

      const allElements = cloneContainer.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('overflow', 'visible', 'important');
        el.style.setProperty('clip-path', 'none', 'important');
        el.style.setProperty('-webkit-clip-path', 'none', 'important');
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('animation', 'none', 'important');
      });

      const label = cloneContainer.querySelector('.social-card__label');
      if (label) {
        label.style.setProperty('position', 'absolute', 'important');
        label.style.setProperty('top', '-32px', 'important');
        label.style.setProperty('right', '-4px', 'important');
        label.style.setProperty('z-index', '20001', 'important');
        label.style.setProperty('background-color', 'var(--primary-color)', 'important');
        label.style.setProperty('color', '#fff', 'important');
        label.style.setProperty('padding', '4px 12px', 'important');
        label.style.setProperty('box-shadow', '0 2px 8px rgba(59,130,246,0.4)', 'important');
      }

      document.body.appendChild(cloneContainer);
      return cloneContainer;
    };

    // ===========================
    // animateToBlog (versión desktop con animación de texto instantánea)
    // ===========================
    const animateToBlog = () => {
      if (!originalSocialWrapper || this.isAnimating) return;
      this.isAnimating = true;

      if (isMobile()) {
        if (window.titleManager?._teardownBlogTwoColLayout) {
          window.titleManager._teardownBlogTwoColLayout();
        }
        restoreElementsInstantly('blog');
        if (window.titleManager?._ensureBlogTwoColLayout) {
          window.titleManager._ensureBlogTwoColLayout(true);
        }
        this.isAnimating = false;
        this.lastSection = 'blog';
        return;
      }

      // --- Versión desktop (con clon) ---
      const layoutEl = document.querySelector('.layout');
      const hadBlogActive = layoutEl.classList.contains('blog-active');
      layoutEl.classList.remove('blog-active', 'projects-active', 'contact-active');
      const layoutLeft = document.querySelector('.layout-left');
      if (layoutLeft) layoutLeft.style.display = '';
      void layoutEl.offsetHeight;

      const layoutRightEl = document.querySelector('.layout-right');
      const originalTransform = layoutRightEl.style.transform;
      const originalWillChange = layoutRightEl.style.willChange;
      layoutRightEl.style.transform = 'none';
      layoutRightEl.style.willChange = 'auto';
      void layoutRightEl.offsetHeight;

      originalSocialWrapper.style.animation = 'none';
      originalSocialWrapper.style.transform = 'none';
      void originalSocialWrapper.offsetHeight;
      const startRect = originalSocialWrapper.getBoundingClientRect();

      layoutRightEl.style.transform = originalTransform;
      layoutRightEl.style.willChange = originalWillChange;
      if (hadBlogActive) layoutEl.classList.add('blog-active');
      else layoutEl.classList.remove('blog-active', 'projects-active', 'contact-active');

      const clone = _makeClone(originalSocialWrapper, startRect, false);

      originalSocialWrapper.style.setProperty('opacity', '0', 'important');
      originalSocialWrapper.style.setProperty('visibility', 'hidden', 'important');
      originalSocialWrapper.style.pointerEvents = 'none';
      originalSocialWrapper.style.animation = 'none';
      originalSocialWrapper.style.transform = 'none';
      void originalSocialWrapper.offsetHeight;

      const igPost = $(".ig-post");
      const captcha = $(".projects-captcha");
      if (igPost) igPost.style.display = 'none';
      if (captcha) captcha.style.display = 'none';

      layoutEl.classList.add('blog-active');
      layoutEl.setAttribute('data-section', 'blog');
      layoutRight.classList.remove("is-projects", "is-contact");
      layoutRight.classList.add("is-blog");
      if (layoutLeft) layoutLeft.style.display = '';

      if (!isMobile()) {
        Object.assign(layoutRight.style, {
          position: "relative", width: "100%", height: "calc(100vh - var(--nav-height))",
          display: "flex", justifyContent: "flex-start", alignItems: "flex-start",
          zIndex: "30", pointerEvents: "auto", overflowY: "auto"
        });
        applyBlogContentStack();
      }

      if (window.titleManager) window.titleManager.update('blog');

      const fromSection = this.lastSection;

      if (fromSection === 'deviannt' && !isMobile()) {
        requestAnimationFrame(() => {
          const textElements = document.querySelectorAll('.blog-left-col .title-select, .blog-left-col .subtitle, .blog-left-col .description, .blog-left-col .blog-cta-btn, .blog-left-col .blog-live-indicator');
          if (textElements.length) {
            textElements.forEach(el => {
              el.style.transition = 'none';
              el.style.opacity = '0';
              el.style.transform = 'translateX(-40px)';
            });
            void document.body.offsetHeight;
            textElements.forEach(el => {
              el.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
              el.style.opacity = '';
              el.style.transform = '';
            });
          }
        });
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const anchorEl = document.getElementById('blog-social-anchor');
          if (!anchorEl) {
            clone.remove();
            this.isAnimating = false;
            this.lastSection = 'blog';
            return;
          }

          const anchorRect = anchorEl.getBoundingClientRect();
          let endRect = {
            left: anchorRect.left,
            top: anchorRect.bottom - 80,
            width: 250,
            height: 80
          };

          if (endRect.left < 0) {
            endRect.left = 48;
          }

          const newBlogSocial = createNormalSocialCard();
          anchorEl.appendChild(newBlogSocial);
          newBlogSocial.style.opacity = '0';
          newBlogSocial.style.visibility = 'hidden';

          _animateClone(clone, startRect, endRect, this.CONFIG.BLOG_ANIMATION_DURATION, () => {
            clone.remove();
            newBlogSocial.style.opacity = '1';
            newBlogSocial.style.visibility = 'visible';
            this.isAnimating = false;
            this.lastSection = 'blog';
          });
        });
      });
    };

    // ===========================
    // animateToBlogFromContact (contact → blog) – también simplificado en móvil
    // ===========================
    const animateToBlogFromContact = () => {
      const contactCard = $('#contact-expanded-card');
      if (!contactCard || this.isAnimating) return;

      if (isMobile()) {
        this.isAnimating = true;
        if (window.titleManager?._teardownBlogTwoColLayout) {
          window.titleManager._teardownBlogTwoColLayout();
        }
        if (originalSocialWrapper) {
          originalSocialWrapper.style.display = '';
          originalSocialWrapper.classList.remove('position-blog');
        }
        restoreElementsInstantly('blog');
        if (window.titleManager?._ensureBlogTwoColLayout) {
          window.titleManager._ensureBlogTwoColLayout(true);
        }
        contactCard.remove();
        // Eliminar bloque de servicios móvil si existe
        const servicesBlock = document.querySelector('.contact-services-mobile');
        if (servicesBlock) servicesBlock.remove();
        this.isAnimating = false;
        this.lastSection = 'blog';
        return;
      }

      this.isAnimating = true;
      contactCard.style.opacity = '0';
      contactCard.style.pointerEvents = 'none';
      const startRect = contactCard.getBoundingClientRect();

      if (originalSocialWrapper) {
        originalSocialWrapper.style.setProperty('opacity', '0', 'important');
        originalSocialWrapper.style.setProperty('visibility', 'hidden', 'important');
        originalSocialWrapper.style.pointerEvents = 'none';
      }

      const layoutEl = document.querySelector('.layout');
      layoutEl.classList.remove('contact-active', 'projects-active', 'blog-active');
      layoutEl.classList.add('blog-active');
      layoutEl.setAttribute('data-section', 'blog');

      layoutRight.classList.remove('is-contact', 'is-projects');
      layoutRight.classList.add('is-blog');
      layoutRight.style.position = 'relative';
      layoutRight.style.width = '100%';
      layoutRight.style.height = 'calc(100vh - var(--nav-height))';
      layoutRight.style.display = 'flex';
      layoutRight.style.justifyContent = 'flex-start';
      layoutRight.style.alignItems = 'flex-start';
      layoutRight.style.zIndex = '30';
      layoutRight.style.pointerEvents = 'auto';
      layoutRight.style.overflowY = 'auto';

      const layoutLeft = document.querySelector('.layout-left');
      if (layoutLeft) layoutLeft.style.display = '';
      applyBlogContentStack();

      if (window.titleManager) window.titleManager.update('blog');

      const anchorEl = document.getElementById('blog-social-anchor');
      if (!anchorEl) {
        contactCard.remove();
        this.isAnimating = false;
        this.lastSection = 'blog';
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void anchorEl.offsetHeight;
          const anchorRect = anchorEl.getBoundingClientRect();
          const endRect = {
            left: anchorRect.left,
            top: anchorRect.bottom - 80,
            width: 250,
            height: 80
          };
          if (endRect.left < 0) endRect.left = 48;

          const clone = _makeClone(contactCard, startRect, true);

          const bigIcons = clone.querySelectorAll('.contact-icon-item-expanded, .contact-icon-wrapper-expanded, .contact-icon-svg-expanded, .contact-icon-text-expanded');
          bigIcons.forEach(el => {
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
          });
          const expandedContent = clone.querySelector('.contact-grid-expanded');
          if (expandedContent) {
            expandedContent.style.setProperty('opacity', '0', 'important');
          }

          const newBlogSocial = createNormalSocialCard();
          anchorEl.appendChild(newBlogSocial);
          newBlogSocial.style.opacity = '0';
          newBlogSocial.style.visibility = 'hidden';

          _animateClone(clone, startRect, endRect, this.CONFIG.ANIMATION_DURATION, () => {
            clone.remove();
            newBlogSocial.style.opacity = '1';
            newBlogSocial.style.visibility = 'visible';

            const content = newBlogSocial.querySelector('.social-card__content');
            if (content) {
              content.style.opacity = '0';
              content.style.transform = 'translateX(20px)';
              content.style.transition = 'none';
              void content.offsetWidth;
              content.style.transition = 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
              content.style.opacity = '1';
              content.style.transform = 'translateX(0)';

              const linksEl = content.querySelectorAll('a');
              linksEl.forEach((link, index) => {
                link.style.opacity = '0';
                link.style.transform = 'translateX(-15px)';
                link.style.transition = 'none';
                void link.offsetWidth;
                link.style.transition = 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
                link.style.opacity = '1';
                link.style.transform = 'translateX(0)';
                link.style.transitionDelay = `${0.05 + index * 0.05}s`;
              });

              const handle = content.querySelector('.social-card__handle');
              if (handle) {
                handle.style.opacity = '0';
                handle.style.transform = 'translateX(-15px)';
                handle.style.transition = 'none';
                void handle.offsetWidth;
                handle.style.transition = 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
                handle.style.opacity = '1';
                handle.style.transform = 'translateX(0)';
                handle.style.transitionDelay = `${0.05 + linksEl.length * 0.05}s`;
              }
            }

            if (contactCard && contactCard.parentNode) contactCard.remove();
            this.isAnimating = false;
            this.lastSection = 'blog';
          });
        });
      });
    };

    // ===========================
    // animateFromBlog (blog → deviannt/projects) – VERSIÓN SIMPLIFICADA PARA MÓVIL
    // ===========================
    const animateFromBlog = (targetSection) => {
      const blogSocial = document.querySelector('.blog-social-anchor .social-wrapper');

      if (isMobile()) {
        if (window.titleManager?._teardownBlogTwoColLayout) {
          window.titleManager._teardownBlogTwoColLayout();
        }
        restoreElementsInstantly(targetSection);
        applyPosition(targetSection, false);
        if (originalSocialWrapper) {
          originalSocialWrapper.style.opacity = '1';
          originalSocialWrapper.style.visibility = 'visible';
          originalSocialWrapper.style.pointerEvents = 'auto';
        }
        const layoutEl = document.querySelector('.layout');
        if (layoutEl) {
          layoutEl.setAttribute('data-section', targetSection);
          layoutEl.classList.remove('blog-active', 'projects-active', 'contact-active');
          if (targetSection === 'projects') layoutEl.classList.add('projects-active');
        }
        this.lastSection = targetSection;
        return;
      }

      if (!blogSocial || this.isAnimating) return;
      this.isAnimating = true;

      if (window.connectionLine) window.connectionLine.hideImmediately();

      const startRect = blogSocial.getBoundingClientRect();
      const clone = _makeClone(blogSocial, startRect, false);
      blogSocial.style.opacity = '0';
      blogSocial.style.visibility = 'hidden';

      const layoutEl = document.querySelector('.layout');
      if (layoutEl) {
        layoutEl.classList.remove('blog-active', 'projects-active', 'contact-active');
        if (targetSection === 'projects') layoutEl.classList.add('projects-active');
        layoutEl.setAttribute('data-section', targetSection);
      }

      restoreElementsInstantly(targetSection);
      applyPosition(targetSection, false);

      if (targetSection === 'deviannt' && !isMobile()) {
        const contentStack = $(".content-stack");
        const igPost = $(".ig-post");

        if (igPost) {
          igPost.style.transition = '';
          igPost.style.transform = '';
        }

        requestAnimationFrame(() => {
          if (contentStack) {
            contentStack.classList.remove('content-pre-animate');
            void contentStack.offsetHeight;
            contentStack.classList.add('content-pre-animate');
            void contentStack.offsetHeight;
            contentStack.classList.remove('content-pre-animate');
          }

          if (igPost) {
            igPost.style.display = 'block';
            igPost.classList.remove('ig-pre-animate', 'ig-animate-in');
            void igPost.offsetHeight;
            igPost.classList.add('ig-pre-animate');
            void igPost.offsetHeight;
            igPost.classList.remove('ig-pre-animate');
            igPost.classList.add('ig-animate-in');
          }
        });
      }

      void originalSocialWrapper.offsetHeight;
      const endRect = originalSocialWrapper.getBoundingClientRect();

      _animateClone(clone, startRect, endRect, this.CONFIG.BLOG_ANIMATION_DURATION, () => {
        clone.remove();
        if (blogSocial && blogSocial.parentNode) blogSocial.remove();

        originalSocialWrapper.style.removeProperty('opacity');
        originalSocialWrapper.style.removeProperty('visibility');
        originalSocialWrapper.style.opacity = '1';
        originalSocialWrapper.style.visibility = 'visible';
        originalSocialWrapper.style.animation = 'float-natural 6s ease-in-out infinite';
        originalSocialWrapper.style.pointerEvents = 'auto';

        if (targetSection === 'deviannt') {
          const faceBox = $(".face-bounding-box");
          if (faceBox) faceBox.style.opacity = '1';

          if (window.connectionLine) {
            void document.body.offsetHeight;
            setTimeout(() => {
              if ($(".ig-post") && $(".social-wrapper")) window.connectionLine.resetAnimation();
            }, 150);
          }
        }

        this.isAnimating = false;
        this.lastSection = targetSection;
      });
    };

    // ===========================
    // CAMBIAR ESTADO DE SECCIÓN
    // ===========================
    const setSectionState = (section) => {
      if (window.titleManager?.stopTyping) window.titleManager.stopTyping();

      if (this.isAnimating && section !== this.lastSection) return;

      if (section !== this.lastSection && window.connectionLine) window.connectionLine.hideImmediately();

      if (section === "contact") {
        if (this.lastSection !== "contact") {
          if (isMobile()) {
            animateToContactMobile.call(this);
          } else if (this.lastSection === "blog") {
            animateToContactFromBlog.call(this);
          } else {
            animateToContact.call(this);
          }
          if (window.titleManager) window.titleManager.update(section);
        }
        this.lastSection = section;
        const layout = document.querySelector('.layout');
        if (layout) {
          layout.setAttribute('data-section', section);
          layout.classList.remove('projects-active', 'blog-active');
          layout.classList.add('contact-active');
        }
        return;
      }

      if (this.lastSection === "contact" && section !== "contact") {
        if (isMobile()) {
          animateFromContactMobile.call(this, section);
        } else {
          if (section === 'blog') {
            animateToBlogFromContact.call(this);
          } else {
            animateFromContact.call(this, section);
          }
          setTimeout(() => {
            const layout = document.querySelector('.layout');
            if (layout) {
              layout.setAttribute('data-section', section);
              layout.classList.remove('projects-active', 'blog-active', 'contact-active');
              if (section === 'projects') layout.classList.add('projects-active');
              else if (section === 'blog') layout.classList.add('blog-active');
            }
          }, 50);
        }
        return;
      }

      if (this.lastSection === "blog" && section !== "blog") {
        animateFromBlog.call(this, section);
        setTimeout(() => {
          const layout = document.querySelector('.layout');
          if (layout) {
            layout.setAttribute('data-section', section);
            layout.classList.remove('projects-active', 'blog-active', 'contact-active');
            if (section === 'projects') layout.classList.add('projects-active');
          }
        }, 50);
        return;
      }

      const existingContactCard = $('#contact-expanded-card');
      if (existingContactCard) {
        existingContactCard.remove();
        if (originalSocialWrapper) {
          originalSocialWrapper.style.opacity = '1';
          originalSocialWrapper.style.pointerEvents = 'auto';
          originalSocialWrapper.style.display = '';
        }
      }

      const shouldAnimateSocial =
        (this.lastSection === "deviannt" && (section === "projects" || section === "blog")) ||
        ((this.lastSection === "projects" || this.lastSection === "blog") && section === "deviannt");

      const layout = document.querySelector('.layout');
      if (layout) {
        layout.setAttribute('data-section', section);
        layout.classList.remove('projects-active', 'blog-active', 'contact-active');
        if (section === 'projects') layout.classList.add('projects-active');
        else if (section === 'blog') layout.classList.add('blog-active');
        else if (section === 'contact') layout.classList.add('contact-active');
      }

      if (section === "deviannt") {
        layoutRight.classList.remove("is-projects", "is-contact", "is-blog");
        Object.assign(layoutRight.style, {
          width: "45%", height: "calc(100vh - var(--nav-height))", position: "relative",
          left: "auto", top: "auto", display: "flex", justifyContent: "center",
          alignItems: "flex-start",
          pointerEvents: "auto", zIndex: "30", overflowY: ""
        });

        const contentStack = $(".content-stack");
        if (contentStack) {
          contentStack.style.position = "relative";
          contentStack.style.transform = "";
          contentStack.style.alignItems = "center";
          const inner = contentStack.querySelector('.content-stack-inner');
          if (inner) {
            inner.style.alignItems = "center";
            inner.style.textAlign = "center";
            const titleSelect = inner.querySelector('.title-select');
            if (titleSelect) {
              titleSelect.style.justifyContent = "center";
              titleSelect.style.marginLeft = "auto";
              titleSelect.style.marginRight = "auto";
            }
          }
        }

        if ($(".face-bounding-box")) $(".face-bounding-box").style.opacity = "1";
        if ($(".projects-captcha")) $(".projects-captcha").style.display = "none";
        const igPost = $(".ig-post");
        if (igPost) {
          igPost.style.display = "block";
          igPost.style.transition = 'none';
          igPost.style.transform = 'translateX(-100px)';
          igPost.classList.remove("ig-animate-in");
          void igPost.offsetHeight;
          igPost.style.transition = 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
          igPost.classList.add("ig-animate-in");
        }

        if (this.animationTimeout) clearTimeout(this.animationTimeout);
        applyPosition("deviannt", shouldAnimateSocial);
        if (window.titleManager) window.titleManager.update(section);
        setTimeout(() => { if (window.connectionLine) window.connectionLine.resetAnimation(); }, 100);

        this.lastSection = section;
        return;
      }

      if (section === "projects") {
        layoutRight.classList.add("is-projects");
        layoutRight.classList.remove("is-contact", "is-blog");
        Object.assign(layoutRight.style, {
          width: "45%", height: "calc(100vh - var(--nav-height))", position: "relative",
          left: "auto", top: "auto", display: "flex", justifyContent: "flex-start",
          alignItems: "flex-start",
          pointerEvents: "auto", zIndex: "30", overflowY: ""
        });

        const contentStack = $(".content-stack");
        if (contentStack) {
          contentStack.style.transform = "translateX(-150px)";
          contentStack.style.alignItems = "flex-start";
          const inner = contentStack.querySelector('.content-stack-inner');
          if (inner) {
            inner.style.alignItems = "flex-start";
            inner.style.textAlign = "left";
            const titleSelect = inner.querySelector('.title-select');
            if (titleSelect) {
              titleSelect.style.justifyContent = "flex-start";
              titleSelect.style.marginLeft = "0";
            }
          }
        }

        if ($(".face-bounding-box")) $(".face-bounding-box").style.opacity = "0";
        if ($(".ig-post")) $(".ig-post").style.display = "none";
        if (window.connectionLine) window.connectionLine.hideImmediately();

        const captcha = $(".projects-captcha");
        const captchaCard = $(".captcha-card");
        if (captcha) {
          captcha.style.display = "flex";
          if (captchaCard) {
            captchaCard.style.transition = 'none';
            captchaCard.style.transform = 'translateX(100px)';
            captchaCard.classList.remove("captcha-animate-in");
            void captchaCard.offsetHeight;
            captchaCard.style.transition = 'transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
            captchaCard.classList.add("captcha-animate-in");
          }
        }

        if (this.animationTimeout) clearTimeout(this.animationTimeout);
        applyPosition("projects", shouldAnimateSocial);
        if (window.titleManager) window.titleManager.update(section);

        this.lastSection = section;
        return;
      }

      if (section === "blog") {
        if (this.lastSection === "contact") {
          animateToBlogFromContact.call(this);
        } else {
          animateToBlog.call(this);
        }
        setTimeout(() => {
          const layout = document.querySelector('.layout');
          if (layout) {
            layout.setAttribute('data-section', section);
            layout.classList.remove('projects-active', 'contact-active');
            layout.classList.add('blog-active');
          }
        }, 50);
        this.lastSection = section;
        return;
      }
    };

    const activeLink = $("a.active", navbar);
    if (activeLink) {
      links.forEach(l => l.removeAttribute('aria-current'));
      activeLink.setAttribute('aria-current', 'page');

      requestAnimationFrame(() => {
        moveSelector(activeLink);
        if (window.titleManager) window.titleManager.update(activeLink.dataset.title);
        setTimeout(() => applyPosition(activeLink.dataset.title, false), 100);
      });
    }

    links.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.isAnimating) return;
        links.forEach(l => {
          l.classList.remove("active");
          l.removeAttribute('aria-current');
        });
        link.classList.add("active");
        link.setAttribute('aria-current', 'page');
        moveSelector(link);
        setSectionState.call(this, link.dataset.title);
      });
    });

    window.addEventListener("resize", () => {
      if (this.isAnimating) return;
      const current = $("a.active", navbar);
      if (current) {
        moveSelector(current);
        if (current.dataset.title !== 'blog' && current.dataset.title !== 'contact') {
          setTimeout(() => applyPosition(current.dataset.title, false), 100);
        }
      }
    });

    window.addEventListener('load', () => {
      if (isMobile()) {
        const currentActive = $("a.active", navbar);
        if (currentActive) {
          setTimeout(() => moveSelector(currentActive), 50);
        }
      }
    });
  }
};

window.navigation = navigation;