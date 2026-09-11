// js/i18n.js - Sistema de internacionalización
const i18n = {
  currentLang: 'en',
  translations: {},
  listeners: [],

  init() {
    // 0. Prioridad MÁXIMA: la URL es explícita (/en/ o /es/). Si alguien
    // entra por /es/ a propósito (o vía un link compartido), eso debe
    // ganarle a un idioma guardado en localStorage de una visita anterior
    // si no, cambiar de idioma nunca "se pega" al refrescar /es/.
    if (window.LANG_FORCED_BY_URL && this.translations[window.DEFAULT_LANG]) {
      this.currentLang = window.DEFAULT_LANG;
      localStorage.setItem('lang', this.currentLang);
    }
    // 1. Si no, preferencia guardada en localStorage
    else {
      const saved = localStorage.getItem('lang');
      if (saved && this.translations[saved]) {
        this.currentLang = saved;
      }
      // 2. Si no, usar el idioma detectado por el servidor (geolocalización)
      else if (window.DEFAULT_LANG && this.translations[window.DEFAULT_LANG]) {
        this.currentLang = window.DEFAULT_LANG;
      }
      // 3. Fallback: idioma del navegador
      else {
        const browserLang = navigator.language.slice(0, 2);
        this.currentLang = (browserLang === 'es') ? 'es' : 'en';
      }
    }
    // Asegurar que solo sea 'es' o 'en'
    if (!['es', 'en'].includes(this.currentLang)) this.currentLang = 'en';

    this.apply();
    this.setupSelector();
    this.updateFlag();
    this.listeners.forEach(fn => fn(this.currentLang));
  },

  getText(key) {
    const trans = this.translations[this.currentLang];
    if (trans && trans[key] !== undefined) {
      return trans[key];
    }
    if (this.translations.en && this.translations.en[key] !== undefined) {
      return this.translations.en[key];
    }
    return key;
  },

  setLanguage(lang) {
    if (!this.translations[lang] || lang === this.currentLang) return;
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.apply();
    this.updateSelectorUI();
    this.updateFlag();
    this._syncUrl(lang);
    this.listeners.forEach(fn => fn(lang));
  },

  // ===================================================================================
  // Mantener la URL en /en/ o /es/ en sync con el toggle manual, sin recargar la página
  // ===================================================================================
  _syncUrl(lang) {
    if (!window.history?.replaceState) return;
    const path = window.location.pathname;
    const alreadyOnLangRoute = path === '/en/' || path === '/en' || path === '/es/' || path === '/es';
    if (!alreadyOnLangRoute && path !== '/') return; // no tocar rutas desconocidas
    const newPath = `/${lang}/`;
    if (path !== newPath) {
      window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
    }
  },

  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.getText(key);
      if (text !== undefined) {
        if (text.includes('<') || text.includes('>')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });
    document.documentElement.lang = this.currentLang;
  },

  // ============================================================
  // setupSelector con toggle en la bandera
  // ============================================================
  setupSelector() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang && this.translations[lang]) {
          this.setLanguage(lang);
        }
      });
    });

    // Bandera: toggle EN <-> ES (usada como selector único en mobile)
    const flagEl = document.getElementById('lang-flag');
    if (flagEl) {
      const toggleLang = () => {
        const next = this.currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(next);
      };
      flagEl.addEventListener('click', toggleLang);
      flagEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleLang();
        }
      });
    }

    this.updateSelectorUI();
  },

  // ============================================================
  // updateFlag con aria-label dinámico
  // ============================================================
  updateFlag() {
    const flagEl = document.getElementById('lang-flag');
    if (!flagEl) return;
    flagEl.textContent = this.currentLang === 'en' ? '🇬🇧' : '🇪🇸';
    flagEl.setAttribute('aria-label', this.currentLang === 'en' ? 'Switch to Spanish' : 'Switch to English');
  },

  updateSelectorUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  },

  onChange(fn) {
    this.listeners.push(fn);
  }
};

// Traducciones
i18n.translations = {
  en: {
    'navbar.about': 'about me',
    'navbar.projects': 'projects',
    'navbar.blog': 'blog',
    'navbar.contact': 'contact',
    'title.deviannt': 'DEVIANNT',
    'subtitle.deviannt': 'Offensive Security Engineer',
    'desc.deviannt': "I'm <span class='name'>Annais Molina Fuentes</span>, an Offensive Cybersecurity Engineer specialized in uncovering hidden vectors and hardening digital infrastructure.",
    // ─── TEASER PARA ABOUT ───
    'indented.about.services': 'available for: <span class="highlight">talks</span> · <span class="highlight">consulting</span> · <span class="highlight">mentoring</span>',
    // ─── Version anterior ───
    'indented.deviannt': 'This space brings together my work and vision',
    'title.projects': 'PROJECTS',
    'subtitle.projects': 'CVE-2026-00000',
    'desc.projects': 'Critical vulnerability in XYZ software with RCE capabilities',
    'title.blog': 'BLOG',
    'subtitle.blog': 'Security research & beyond',
    'desc.blog': 'CVE teardowns and exploit chains — documented from the first wrong turn to the working PoC',
    'title.contact': "LET'S GET IN TOUCH",
    'subtitle.contact': 'social media | contact',
    'social.label': 'social media',
    'captcha.subtitle': 'Select one project to inspect',
    'captcha.title': 'VERIFY PROJECT',
    'captcha.hint': "psst — it's not a real captcha, just click a project",
    'captcha.verify': 'VERIFY',
    // ─── Proyectos reales ───
    'project.react.title': 'CVE-2025-55182 — React2Shell',
    'project.react.desc': 'Critical RCE (CVSS 10.0) affecting React Server Components. Unauthenticated attackers can execute arbitrary code on the server via prototype pollution in the Flight protocol. This repository contains my Master\'s Thesis research, including a full exploit framework, interactive reverse shell, and a vulnerable laboratory for portfolio demonstration.',
    'project.react.link.github': 'github',
    'project.react.link.blog': 'blog',
    'project.react.link.cve': 'cve.org',
    'project.byovd.title': 'CVE-2024-51324 — BYOVD Kernel',
    'project.byovd.desc': 'BYOVD via BdApiUtil64.sys. Three undocumented kernel primitives reverse-engineered via Ghidra — including one capable of neutralizing an EDR without touching its process. CVSS 9.5 Critical.',
    'project.byovd.link.github': 'github',
    'project.byovd.link.blog': 'blog',
    'project.byovd.link.cve': 'cve.org',
    'project.dwm.title': 'CVE-2024-30051 — Windows DWM',
    'project.dwm.desc': 'Windows DWM heap overflow leading to SYSTEM-level code execution. Empirical heap spray analysis across 50 sessions: 12.9×–19× more deterministic than the theoretical model.',
    'project.dwm.link.github': 'github',
    'project.dwm.link.blog': 'blog',
    'project.dwm.link.cve': 'cve.org',
    'project.sbo.title': 'Stack Buffer Overflow — R 3.4.4',
    'project.sbo.desc': 'Full exploitation lab: fuzzing, EIP control, bad char analysis, JMP ESP, shellcode generation. Step-by-step with WinDBG. Complete reproducible methodology framework.',
    'project.sbo.link.github': 'github',
    // ─── BLOG ───
    'blog.feed.label': '// latest posts',
    'blog.feed.viewall': 'view full archive →',
    'blog.fallback.text': 'Posts are available on the blog.',
    'blog.fallback.btn': 'go to blog.deviannt.com →',
    'blog.live.indicator': 'loaded from <a class="blog-live-link" href="https://blog.deviannt.com" target="_blank" rel="noopener noreferrer">blog.deviannt.com</a>',
    'blog.cta': 'view all posts →',
    // ─── CONTACT ───
    'service.talks.name': 'Talks & training',
    'service.talks.desc': 'Straight, no corporate filler. Companies, universities and institutions.',
    'service.consulting.name': 'Technical consulting',
    'service.consulting.desc': 'Pentest and vulnerability research. Per-project, defined scope.',
    'service.mentoring.name': 'Mentoring / Academy',
    'service.mentoring.desc': 'Coming soon — follow along on Instagram or Telegram for now.',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.telegram': 'Telegram',
    'contact.email': 'Email',
    'contact.instagram': 'Instagram',
    // ─── TOAST ───
    'toast.copied': 'copied to clipboard!',
  },
  es: {
    'navbar.about': 'sobre mí',
    'navbar.projects': 'proyectos',
    'navbar.blog': 'blog',
    'navbar.contact': 'contacto',
    'title.deviannt': 'DEVIANNT',
    'subtitle.deviannt': 'Researcher de Seguridad Ofensiva',
    'desc.deviannt': "Soy <span class='name'>Annais Molina Fuentes</span>, Investigadora de Ciberseguridad Ofensiva especializada en descubrir vectores ocultos y fortalecer infraestructuras digitales.",
    // ─── TEASER PARA ABOUT (ES) ───
    'indented.about.services': 'disponible para: <span class="highlight">charlas</span> · <span class="highlight">consultoría</span> · <span class="highlight">mentoría</span>',
    // ─── Version anterior ───
    'indented.deviannt': 'Este espacio reúne mi trabajo y visión',
    'title.projects': 'PROYECTOS',
    'subtitle.projects': 'CVE-2026-00000',
    'desc.projects': 'Vulnerabilidad crítica en software XYZ con capacidades RCE',
    'title.blog': 'BLOG',
    'subtitle.blog': 'Investigación en seguridad',
    'desc.blog': 'Análisis de CVEs y cadenas de exploit — documentado desde el primer error hasta el PoC funcional',
    'title.contact': 'HABLEMOS',
    'subtitle.contact': 'redes sociales | contacto',
    'social.label': 'redes sociales',
    'captcha.subtitle': 'Selecciona un proyecto para inspeccionar',
    'captcha.title': 'VERIFICAR PROYECTO',
    'captcha.hint': 'psst — no es un captcha real, solo elige un proyecto',
    'captcha.verify': 'VERIFICAR',
    // ─── Proyectos reales ───
    'project.react.title': 'CVE-2025-55182 — React2Shell',
    'project.react.desc': 'RCE crítica (CVSS 10.0) que afecta a React Server Components. Atacantes no autenticados pueden ejecutar código arbitrario en el servidor mediante contaminación de prototipos en el protocolo Flight. Este repositorio contiene mi investigación de Tesis de Máster, incluyendo un framework de exploit completo, shell inversa interactiva y un laboratorio vulnerable para demostración en el portafolio.',
    'project.react.link.github': 'github',
    'project.react.link.blog': 'blog',
    'project.react.link.cve': 'cve.org',
    'project.byovd.title': 'CVE-2024-51324 — Kernel BYOVD',
    'project.byovd.desc': 'BYOVD a través de BdApiUtil64.sys. Tres primitivas de kernel no documentadas, reverse-engineered con Ghidra — incluyendo una capaz de neutralizar un EDR sin tocar su proceso. CVSS 9.5 Crítico.',
    'project.byovd.link.github': 'github',
    'project.byovd.link.blog': 'blog',
    'project.byovd.link.cve': 'cve.org',
    'project.dwm.title': 'CVE-2024-30051 — Windows DWM',
    'project.dwm.desc': 'Desbordamiento de heap en Windows DWM que permite ejecución de código a nivel SYSTEM. Análisis empírico de heap spray en 50 sesiones: 12.9×–19× más determinista que el modelo teórico.',
    'project.dwm.link.github': 'github',
    'project.dwm.link.blog': 'blog',
    'project.dwm.link.cve': 'cve.org',
    'project.sbo.title': 'Stack Buffer Overflow — R 3.4.4',
    'project.sbo.desc': 'Laboratorio completo de explotación: fuzzing, control de EIP, análisis de bad chars, JMP ESP, generación de shellcode. Paso a paso con WinDBG. Marco metodológico reproducible.',
    'project.sbo.link.github': 'github',
    // ─── BLOG ───
    'blog.feed.label': '// últimos posts',
    'blog.feed.viewall': 'ver archivo completo →',
    'blog.fallback.text': 'Los posts están disponibles en el blog.',
    'blog.fallback.btn': 'ir a blog.deviannt.com →',
    'blog.live.indicator': 'cargado desde <a class="blog-live-link" href="https://blog.deviannt.com" target="_blank" rel="noopener noreferrer">blog.deviannt.com</a>',
    'blog.cta': 'ver todos los posts →',
    // ─── CONTACT ───
    'service.talks.name': 'Charlas & capacitaciones',
    'service.talks.desc': 'Directas, sin relleno corporativo. Empresas, universidades e instituciones.',
    'service.consulting.name': 'Consultoría técnica',
    'service.consulting.desc': 'Pentest e investigación de vulnerabilidades. Por proyecto, alcance definido.',
    'service.mentoring.name': 'Mentoría / Aula',
    'service.mentoring.desc': 'Próximamente — por ahora, sígueme en Instagram o Telegram.',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.telegram': 'Telegram',
    'contact.email': 'Correo',
    'contact.instagram': 'Instagram',
    // ─── TOAST ───
    'toast.copied': '¡copiado al portapapeles!',
  }
};

document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

window.i18n = i18n;