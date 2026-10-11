// ===========================
// MAIN.JS - Inicialización principal
//  App controller con mejor manejo de errores
// + accesibilidad de teclado en el captcha (tabindex/role/aria + Enter/Space)
// + i18n para proyectos
// ===========================

const App = {
  modules: ['navigation', 'tiltEffect', 'captcha', 'waves', 'hamburgerMenu'],
  isInitialized: false,
  
  init() {
    if (this.isInitialized) {
      return;
    }
    
    if (window.photoManager) {
      window.photoManager.init();
    }
    
    this.modules.forEach(module => {
      this.initModule(module);
    });
    
    this.initContentUpdater();
    
    this.isInitialized = true;
  },
  
  initModule(moduleName) {
    const module = window[moduleName];
    if (!module || typeof module.init !== 'function') return false;
    try { module.init(); return true; } catch (e) { return false; }
  },

  initContentUpdater() {
    const captchaCells = $$(".captcha-cell");
    const subtitleEl = $(".subtitle .typed-text");
    const descriptionEl = $(".description");
    const indentedDescriptionEl = $(".description--indented");
    
    if (!subtitleEl || !descriptionEl || !captchaCells.length || !indentedDescriptionEl) {
      return;
    }
    
    const TARGET_HEIGHT = 60;
    
    let currentSelectedIndex = 0;
    let isUpdating = false;
    
    const TOTAL_PROJECTS = 4;
    
    // ── PROYECTOS ──
    const PROJECTS_KEYS = [
      {
        titleKey: 'project.react.title',
        descKey: 'project.react.desc',
        type: 'icon',
        content: '/assets/icons/projects-src/react.svg',
        cellText: '2025-55182',
        links: [
          { textKey: 'project.react.link.github', url: 'https://github.com/devianntsec/CVE-2025-55182', icon: '/assets/icons/github-circle.svg' },
          { textKey: 'project.react.link.blog', url: 'https://blog.deviannt.com/cve-2025-55182-react2shell-rce-in-react-server-components-via-prototype-pollution/', icon: '/assets/icons/document.svg' },
          { textKey: 'project.react.link.cve', url: 'https://www.cve.org/CVERecord?id=CVE-2025-55182', icon: '/assets/icons/search.svg' }
        ]
      },
      {
        titleKey: 'project.byovd.title',
        descKey: 'project.byovd.desc',
        type: 'icon',
        content: '/assets/icons/cve.svg',
        cellText: '2024-51324',
        links: [
          { textKey: 'project.byovd.link.github', url: 'https://github.com/devianntsec/CVE-2024-51324', icon: '/assets/icons/github-circle.svg' },
          { textKey: 'project.byovd.link.blog', url: 'https://blog.deviannt.com/cve-2024-51324-byovd-three-undocumented-kernel-primitives-in-bdapiutil64.sys/', icon: '/assets/icons/document.svg' },
          { textKey: 'project.byovd.link.cve', url: 'https://www.cve.org/CVERecord?id=CVE-2024-51324', icon: '/assets/icons/search.svg' }
        ]
      },
      {
        titleKey: 'project.dwm.title',
        descKey: 'project.dwm.desc',
        type: 'icon',
        content: '/assets/icons/cve.svg',
        cellText: '2024-30051',
        links: [
          { textKey: 'project.dwm.link.github', url: 'https://github.com/devianntsec/CVE-2024-30051', icon: '/assets/icons/github-circle.svg' },
          { textKey: 'project.dwm.link.blog', url: 'https://blog.deviannt.com/cve-2024-30051-heap-overflow-in-windows-dwm-from-an-integer-division-bug-to-system/', icon: '/assets/icons/document.svg' },
          { textKey: 'project.dwm.link.cve', url: 'https://www.cve.org/CVERecord?id=CVE-2024-30051', icon: '/assets/icons/search.svg' }
        ]
      },
      {
        titleKey: 'project.sbo.title',
        descKey: 'project.sbo.desc',
        type: 'icon',
        content: '/assets/icons/cve.svg',
        cellText: 'stack-bof',
        links: [
          { textKey: 'project.sbo.link.github', url: 'https://github.com/devianntsec/Analisis-de-Vulnerabilidad-Stack-Buffer-Overflow', icon: '/assets/icons/github-circle.svg' }
        ]
      }
    ];
    
    const projectsData = PROJECTS_KEYS.slice(0, TOTAL_PROJECTS);
    
    function getProjectData(index) {
      const p = projectsData[index];
      if (!p) return null;
      return {
        title: i18n.getText(p.titleKey),
        description: i18n.getText(p.descKey),
        type: p.type,
        content: p.content,
        cellText: p.cellText,
        links: p.links.map(link => ({
          text: i18n.getText(link.textKey),
          url: link.url,
          icon: link.icon
        }))
      };
    }
    
    function getCurrentProjectData() {
      return getProjectData(currentSelectedIndex);
    }
    
    function restoreOriginalIndentedText() {
      if (isUpdating) return;
      isUpdating = true;
      // Se re-renderiza desde la traducción actual (antes se guardaba el texto del
      // primer idioma y, tras cambiar EN<->ES, volvía en el idioma equivocado).
      i18n.setHTML(indentedDescriptionEl, i18n.getText('indented.about.services'));
      indentedDescriptionEl.style.display = 'block';
      indentedDescriptionEl.classList.remove('projects-links-mode');
      indentedDescriptionEl.style.minHeight = indentedDescriptionEl.style.height = indentedDescriptionEl.style.padding = indentedDescriptionEl.style.margin = '';
      isUpdating = false;
    }
    
    function updateProjectLinks(links) {
      if (!links || links.length === 0) {
        indentedDescriptionEl.style.display = 'none';
        indentedDescriptionEl.innerHTML = '';
        indentedDescriptionEl.classList.remove('projects-links-mode');
        indentedDescriptionEl.style.minHeight = indentedDescriptionEl.style.height = indentedDescriptionEl.style.padding = indentedDescriptionEl.style.margin = '0';
        return;
      }
      
      indentedDescriptionEl.style.display = 'flex';
      indentedDescriptionEl.classList.add('projects-links-mode');
      indentedDescriptionEl.style.minHeight = TARGET_HEIGHT + 'px';
      indentedDescriptionEl.style.height = 'auto';
      indentedDescriptionEl.style.padding = indentedDescriptionEl.style.margin = '';
      indentedDescriptionEl.innerHTML = '';
      
      const container = document.createElement('div');
      container.className = 'projects-links-wrapper';
      indentedDescriptionEl.appendChild(container);
      
      links.forEach((link, index) => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.className = 'project-link';
        
        if (link.icon) {
          if (link.icon.startsWith('/assets/')) {
            const iconImg = document.createElement('img');
            iconImg.src = link.icon;
            iconImg.alt = link.text;
            iconImg.className = 'project-link-icon project-link-icon--local';
            linkElement.appendChild(iconImg);
          } else {
            const iconElement = document.createElement('i');
            iconElement.className = link.icon;
            linkElement.appendChild(iconElement);
          }
        }
        
        linkElement.appendChild(document.createTextNode(link.text));
        container.appendChild(linkElement);
        
        if (index < links.length - 1) {
          const separator = document.createElement('span');
          separator.className = 'project-link-separator';
          separator.textContent = '·';
          container.appendChild(separator);
        }
      });
    }
    
    function updateProjectInfo(index, skipTitleManagerUpdate = false) {
      if (isUpdating) return;
      isUpdating = true;
      
      if (index < projectsData.length) {
        const data = getProjectData(index);
        subtitleEl.textContent = data.title;
        descriptionEl.textContent = data.description;
        
        if (window.titleManager && !skipTitleManagerUpdate) {
          window.titleManager._projectData = data;
        }
        
        updateProjectLinks(data.links);
        currentSelectedIndex = index;
      }
      isUpdating = false;
    }
    
    function createCellContent(cell, data, index) {
      cell.innerHTML = '';
      cell.classList.remove('captcha-cell--empty');
      
      if (index >= projectsData.length) {
        cell.classList.add('captcha-cell--empty');
        // Mostrar "SOON" en las celdas vacías (el CSS lo hará con ::after)
        return;
      }
      
      const type = data.type || (data.icon ? "icon" : data.content ? "image" : "text");
      
      switch(type) {
        case "image":
          const imageContainer = document.createElement('div');
          imageContainer.className = 'captcha-cell-image';
          const img = document.createElement('img');
          img.src = data.content || data.icon;
          img.alt = data.title;
          img.className = 'captcha-cell-img';
          imageContainer.appendChild(img);
          cell.appendChild(imageContainer);
          if (data.cellText) {
            const textContainer = document.createElement('div');
            textContainer.className = 'captcha-cell-text';
            textContainer.textContent = data.cellText;
            cell.appendChild(textContainer);
          }
          break;
        case "icon":
          const iconContainer = document.createElement('div');
          iconContainer.className = 'captcha-cell-icon';
          const iconImg = document.createElement('img');
          iconImg.src = data.content || data.icon;
          iconImg.alt = data.title;
          iconImg.className = 'captcha-cell-svg';
          iconContainer.appendChild(iconImg);
          cell.appendChild(iconContainer);
          if (data.cellText) {
            const textContainer = document.createElement('div');
            textContainer.className = 'captcha-cell-text';
            textContainer.textContent = data.cellText;
            cell.appendChild(textContainer);
          }
          break;
        default:
          if (data.cellText) {
            const textContainer = document.createElement('div');
            textContainer.className = 'captcha-cell-text';
            textContainer.textContent = data.cellText;
            cell.appendChild(textContainer);
          }
          break;
      }
    }
    
    const freshCaptchaCells = $$(".captcha-cell");

    freshCaptchaCells.forEach((cell, index) => {
      const data = index < projectsData.length ? projectsData[index] : null;
      const translatedData = data ? getProjectData(index) : null;
      createCellContent(cell, translatedData, index);
      cell.dataset.projectIndex = index < projectsData.length ? String(index) : '';

      if (index < projectsData.length) {
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        const label = (projectsData[index].cellText || getProjectData(index).title || 'proyecto');
        cell.setAttribute('aria-label', `Ver proyecto: ${label}`);
        cell.style.cursor = 'pointer';
      } else {
        cell.removeAttribute('tabindex');
        cell.removeAttribute('role');
        cell.removeAttribute('aria-pressed');
        cell.removeAttribute('aria-label');
        cell.style.cursor = 'default';
      }
    });

    const captchaGridEl = $(".captcha-grid");
    if (captchaGridEl) {
      captchaGridEl.addEventListener("click", (e) => {
        const cell = e.target.closest(".captcha-cell");
        if (!cell || !captchaGridEl.contains(cell)) return;
        const idxAttr = cell.dataset.projectIndex;
        if (idxAttr === undefined || idxAttr === '') return;
        freshCaptchaCells.forEach(c => {
          c.classList.remove("selected");
          if (c.hasAttribute('role')) c.setAttribute('aria-pressed', 'false');
        });
        cell.classList.add("selected");
        if (cell.hasAttribute('role')) cell.setAttribute('aria-pressed', 'true');
        updateProjectInfo(Number(idxAttr));
      });

      captchaGridEl.addEventListener("keydown", (e) => {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        const cell = e.target.closest(".captcha-cell");
        if (!cell || !captchaGridEl.contains(cell)) return;
        e.preventDefault();
        cell.click();
      });
    }
    
    function selectFirstProject() {
      if (freshCaptchaCells.length && projectsData.length) {
        freshCaptchaCells.forEach(c => {
          c.classList.remove("selected");
          if (c.hasAttribute('role')) c.setAttribute('aria-pressed', 'false');
        });
        freshCaptchaCells[0].classList.add("selected");
        if (freshCaptchaCells[0].hasAttribute('role')) freshCaptchaCells[0].setAttribute('aria-pressed', 'true');
        updateProjectInfo(0);
      }
    }
    
    function forceUpdate() {
      let selectedIndex = 0;
      const selectedCell = $(".captcha-cell.selected");
      if (selectedCell) {
        freshCaptchaCells.forEach((cell, idx) => { if (cell === selectedCell) selectedIndex = idx; });
      } else if (window.titleManager?._projectData) {
        const savedTitle = window.titleManager._projectData.title;
        const foundIndex = projectsData.findIndex((p, i) => getProjectData(i).title === savedTitle);
        if (foundIndex !== -1) selectedIndex = foundIndex;
      }
      
      updateProjectInfo(selectedIndex, true);
      freshCaptchaCells.forEach((cell, idx) => {
        if (idx === selectedIndex) {
          cell.classList.add("selected");
          if (cell.hasAttribute('role')) cell.setAttribute('aria-pressed', 'true');
        } else {
          cell.classList.remove("selected");
          if (cell.hasAttribute('role')) cell.setAttribute('aria-pressed', 'false');
        }
      });
    }
    
    const layoutRight = $(".layout-right");
    if (layoutRight) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            if (layoutRight.classList.contains("is-projects")) {
              forceUpdate();
            } else if (!layoutRight.classList.contains("is-contact") && !layoutRight.classList.contains("is-blog")) {
              restoreOriginalIndentedText();
            }
          }
        });
      });
      observer.observe(layoutRight, { attributes: true, attributeFilter: ["class"] });
    }
    
    if (window.titleManager) {
      const originalUpdate = window.titleManager.update;
      window.titleManager.update = function(section) {
        originalUpdate.call(this, section);
        if (section === 'projects') {
          forceUpdate();
        }
      };
    }
    
    const activeLink = $(".navbar a.active");
    const currentSection = activeLink ? activeLink.dataset.title : "deviannt";
    
    if (currentSection === "projects") {
      forceUpdate();
      selectFirstProject();
    } else {
      restoreOriginalIndentedText();
    }
    
    window.projectSelector = {
      selectFirst: selectFirstProject,
      forceUpdate: forceUpdate,
      getCurrentIndex: () => currentSelectedIndex,
      getProjectsData: () => projectsData,
      getCurrentProjectData: getCurrentProjectData
    };

    if (window.i18n) {
      window.i18n.onChange(() => {
        if (layoutRight.classList.contains("is-projects")) {
          forceUpdate();
        }
      });
    }
  }
};

// ===========================
// Hover links (se mantiene igual)
// ===========================
setTimeout(() => {
  const linksWrapper = $('.projects-links-wrapper');
  const captchaContainer = $('#captcha-container');
  if (linksWrapper && captchaContainer) {
    linksWrapper.addEventListener('mouseenter', () => {
      if ($('.layout-right.is-projects')) {
        captchaContainer.style.pointerEvents = 'none';
        captchaContainer.style.opacity = '0.5';
      }
    });
    linksWrapper.addEventListener('mouseleave', () => {
      if ($('.layout-right.is-projects')) {
        captchaContainer.style.pointerEvents = 'auto';
        captchaContainer.style.opacity = '1';
      }
    });
  }
}, 500);

// ===========================
// Inicialización
// ===========================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

window.addEventListener('beforeunload', () => {
  if (window.waves?.destroy) {
    window.waves.destroy();
  }
});