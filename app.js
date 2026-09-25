/**
 * Gaurav Ashok Salvi - Resume & Portfolio Application Logic
 * Handles interactive editing, theme switching, storage, PDF export & copy tools.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const htmlEl = document.documentElement;
  const toggleEditBtn = document.getElementById('toggleEditBtn');
  const themeBtn = document.getElementById('themeBtn');
  const themeMenu = document.getElementById('themeMenu');
  const toggleLayoutBtn = document.getElementById('toggleLayoutBtn');
  const layoutText = document.getElementById('layoutText');
  const printPdfBtn = document.getElementById('printPdfBtn');
  const resetDataBtn = document.getElementById('resetDataBtn');
  const copyBtns = document.querySelectorAll('.copy-btn');
  const editableEls = document.querySelectorAll('[data-editable]');

  const STORAGE_KEY_DATA = 'gaurav_resume_data_v8';
  const STORAGE_KEY_THEME = 'gaurav_resume_theme_v1';
  const STORAGE_KEY_LAYOUT = 'gaurav_resume_layout_v1';

  let isEditMode = false;

  // --------------------------------------------------------------------------
  // 1. Initial State Restoration (Theme, Layout, Edited Content)
  // --------------------------------------------------------------------------
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  applyTheme(savedTheme);

  const savedLayout = localStorage.getItem(STORAGE_KEY_LAYOUT) || 'modern';
  applyLayout(savedLayout);

  loadSavedContent();

  // --------------------------------------------------------------------------
  // 2. Edit Mode Toggle & Content Editable
  // --------------------------------------------------------------------------
  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      document.body.classList.toggle('edit-mode', isEditMode);
      toggleEditBtn.classList.toggle('active', isEditMode);

      editableEls.forEach(el => {
        el.setAttribute('contenteditable', isEditMode ? 'true' : 'false');
        if (isEditMode) {
          el.setAttribute('spellcheck', 'true');
        } else {
          el.removeAttribute('spellcheck');
        }
      });

      if (isEditMode) {
        toggleEditBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>Save & Lock</span>`;
      } else {
        toggleEditBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> <span>Edit Mode</span>`;
        saveAllContent();
      }
    });
  }

  // Auto-save on blur when editing
  editableEls.forEach(el => {
    el.addEventListener('blur', () => {
      if (isEditMode) {
        saveAllContent();
      }
    });
  });

  function saveAllContent() {
    const data = {};
    editableEls.forEach(el => {
      const key = el.getAttribute('data-editable');
      if (key) {
        data[key] = el.innerHTML;
      }
    });
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  }

  function loadSavedContent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DATA);
      if (raw) {
        const data = JSON.parse(raw);
        editableEls.forEach(el => {
          const key = el.getAttribute('data-editable');
          if (key && data[key] !== undefined) {
            el.innerHTML = data[key];
          }
        });
      }
    } catch (e) {
      console.warn('Could not load saved resume data from localStorage', e);
    }
  }

  // --------------------------------------------------------------------------
  // 3. Theme Selector
  // --------------------------------------------------------------------------
  if (themeBtn && themeMenu) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
        themeMenu.classList.remove('show');
      }
    });

    const themeItems = themeMenu.querySelectorAll('[data-set-theme]');
    themeItems.forEach(item => {
      item.addEventListener('click', () => {
        const theme = item.getAttribute('data-set-theme');
        applyTheme(theme);
        themeMenu.classList.remove('show');
      });
    });
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);

    // Update active dropdown item
    if (themeMenu) {
      themeMenu.querySelectorAll('.dropdown-item').forEach(btn => {
        if (btn.getAttribute('data-set-theme') === theme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Layout Selector (Two-Column vs Classic Single-Column)
  // --------------------------------------------------------------------------
  if (toggleLayoutBtn) {
    toggleLayoutBtn.addEventListener('click', () => {
      const currentLayout = htmlEl.getAttribute('data-layout') || 'modern';
      const nextLayout = currentLayout === 'modern' ? 'classic' : 'modern';
      applyLayout(nextLayout);
    });
  }

  function applyLayout(layout) {
    htmlEl.setAttribute('data-layout', layout);
    localStorage.setItem(STORAGE_KEY_LAYOUT, layout);

    if (layoutText) {
      layoutText.textContent = layout === 'modern' ? 'Classic Layout' : '2-Column Layout';
    }
  }

  // --------------------------------------------------------------------------
  // 5. PDF Export & Print
  // --------------------------------------------------------------------------
  if (printPdfBtn) {
    printPdfBtn.addEventListener('click', () => {
      // Disable edit mode before printing if active
      if (isEditMode && toggleEditBtn) {
        toggleEditBtn.click();
      }
      window.print();
    });
  }

  // --------------------------------------------------------------------------
  // 6. Quick Copy Handlers
  // --------------------------------------------------------------------------
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-copy');
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        const origHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check" style="color: #10b981;"></i>`;
        btn.title = 'Copied!';
        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.title = 'Copy';
        }, 1800);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 7. Reset Data Handler
  // --------------------------------------------------------------------------
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all modified fields back to original content?')) {
        localStorage.removeItem(STORAGE_KEY_DATA);
        window.location.reload();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. Reviews Modal Handlers
  // --------------------------------------------------------------------------
  const reviewsModal = document.getElementById('reviewsModal');
  const openReviewsBtn = document.getElementById('openReviewsBtn');
  const contactReviews = document.getElementById('contactReviews');
  const closeReviewsBtn = document.getElementById('closeReviewsBtn');
  const closeReviewsFooterBtn = document.getElementById('closeReviewsFooterBtn');

  function showReviews(e) {
    if (e) e.preventDefault();
    if (reviewsModal) reviewsModal.classList.add('show');
  }

  if (openReviewsBtn) openReviewsBtn.addEventListener('click', showReviews);
  if (contactReviews) contactReviews.addEventListener('click', showReviews);

  function hideReviews() {
    if (reviewsModal) reviewsModal.classList.remove('show');
  }

  if (closeReviewsBtn) closeReviewsBtn.addEventListener('click', hideReviews);
  if (closeReviewsFooterBtn) closeReviewsFooterBtn.addEventListener('click', hideReviews);
  if (reviewsModal) {
    reviewsModal.addEventListener('click', (e) => {
      if (e.target === reviewsModal) hideReviews();
    });
  }

  // --------------------------------------------------------------------------
  // 9. Quick Tips Modal
  // --------------------------------------------------------------------------
  const tipsModal = document.getElementById('tipsModal');
  const closeTipsBtn = document.getElementById('closeTipsBtn');
  const gotItBtn = document.getElementById('gotItBtn');

  // Show tips once for first-time visitors
  if (!localStorage.getItem('gaurav_resume_tips_seen')) {
    setTimeout(() => {
      if (tipsModal) tipsModal.classList.add('show');
    }, 1200);
  }

  function hideTips() {
    if (tipsModal) tipsModal.classList.remove('show');
    localStorage.setItem('gaurav_resume_tips_seen', 'true');
  }

  if (closeTipsBtn) closeTipsBtn.addEventListener('click', hideTips);
  if (gotItBtn) gotItBtn.addEventListener('click', hideTips);
  if (tipsModal) {
    tipsModal.addEventListener('click', (e) => {
      if (e.target === tipsModal) hideTips();
    });
  }
});
