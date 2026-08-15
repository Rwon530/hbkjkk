/**
 * Chat AI - UI Utilities & Markdown/Code Renderers
 */

export const UI = {
  // Toast notification
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
      success: 'linear-gradient(135deg, #059669, #10b981)',
      error: 'linear-gradient(135deg, #dc2626, #ef4444)',
      warning: 'linear-gradient(135deg, #d97706, #f59e0b)',
      info: 'linear-gradient(135deg, #2563eb, #3b82f6)'
    };

    toast.style.cssText = `
      background: ${bgColors[type] || bgColors.info};
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
      direction: ${document.documentElement.getAttribute('dir') || 'rtl'};
    `;

    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Parse Markdown & Code Blocks
  renderMarkdown(text) {
    if (!text) return '';

    if (window.marked) {
      try {
        const renderer = new window.marked.Renderer();
        renderer.code = function({ text, lang }) {
          const language = lang || 'text';
          const escapedCode = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          const isRunnable = ['html', 'javascript', 'js', 'css'].includes(language.toLowerCase());
          const runBtn = isRunnable 
            ? `<button class="code-btn run-code-btn" data-code="${encodeURIComponent(text)}" data-lang="${language}">
                <i data-lucide="play" style="width:14px;height:14px;"></i> تشغيل
               </button>`
            : '';

          return `
            <div class="code-block-container">
              <div class="code-header">
                <span class="code-lang">${language}</span>
                <div class="code-header-actions">
                  ${runBtn}
                  <button class="code-btn copy-code-btn" data-code="${encodeURIComponent(text)}">
                    <i data-lucide="copy" style="width:14px;height:14px;"></i> نسخ
                  </button>
                </div>
              </div>
              <pre><code class="language-${language}">${escapedCode}</code></pre>
            </div>
          `;
        };

        const rawHtml = window.marked.parse(text, { renderer, breaks: true, gfm: true });
        return window.DOMPurify ? window.DOMPurify.sanitize(rawHtml) : rawHtml;
      } catch (e) {
        console.error('Marked error', e);
      }
    }

    return text.replace(/\n/g, '<br/>');
  },

  // Refresh Lucide Icons
  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // Text To Speech
  speakText(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) {
      UI.showToast('المتصفح لا يدعم ميزة قراءة النصوص', 'warning');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~\[\]]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  // Confetti
  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }
};
