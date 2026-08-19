/**
 * Chat AI - Main Application Controller
 */

import { Storage, DEFAULT_SETTINGS } from './storage.js';
import { AIService, PERSONAS, IMAGE_STYLES, ASPECT_RATIOS } from './ai.js';
import { UI } from './ui.js';

class ChatAIApp {
  constructor() {
    this.settings = Storage.getSettings();
    this.sessions = Storage.getSessions();
    this.activeSessionId = Storage.getActiveSessionId();
    this.gallery = Storage.getGallery();
    
    this.activeView = 'chat';
    this.activeCategory = 'all';
    this.isGenerating = false;
    this.abortController = null;
    this.uploadedImages = [];
    this.selectedImageStyle = 'realistic';
    this.selectedAspectRatio = '1:1';
    
    this.recognition = null;
    this.isListening = false;

    this.init();
  }

  init() {
    this.applyTheme(this.settings.theme || 'dark');
    this.applyLanguage(this.settings.lang || 'ar');
    this.initSessions();
    this.setupEventListeners();
    this.setupSpeechRecognition();
    this.renderSidebarHistory();
    this.renderCurrentView();
    this.renderGallery();
    this.updateApiStatusBadge();
    UI.refreshIcons();
  }

  applyTheme(theme) {
    this.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' 
        ? '<i data-lucide="sun" style="width:18px;height:18px;"></i>' 
        : '<i data-lucide="moon" style="width:18px;height:18px;"></i>';
    }
    Storage.saveSettings(this.settings);
    UI.refreshIcons();
  }

  applyLanguage(lang) {
    this.settings.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';
    }
    Storage.saveSettings(this.settings);
  }

  initSessions() {
    if (this.sessions.length === 0) {
      this.createNewSession('general', 'محادثة جديدة');
    } else if (!this.activeSessionId || !this.sessions.find(s => s.id === this.activeSessionId)) {
      this.activeSessionId = this.sessions[0].id;
      Storage.setActiveSessionId(this.activeSessionId);
    }
  }

  getActiveSession() {
    return this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0];
  }

  createNewSession(category = 'general', title = 'محادثة جديدة') {
    const newSession = {
      id: 'session_' + Date.now(),
      title,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    this.sessions.unshift(newSession);
    this.activeSessionId = newSession.id;
    Storage.saveSessions(this.sessions);
    Storage.setActiveSessionId(this.activeSessionId);
    this.renderSidebarHistory();
    this.renderMessages();
    this.switchView('chat');
  }

  deleteSession(id, e) {
    if (e) e.stopPropagation();
    this.sessions = this.sessions.filter(s => s.id !== id);
    if (this.sessions.length === 0) {
      this.createNewSession();
    } else if (this.activeSessionId === id) {
      this.activeSessionId = this.sessions[0].id;
      Storage.setActiveSessionId(this.activeSessionId);
    }
    Storage.saveSessions(this.sessions);
    this.renderSidebarHistory();
    this.renderMessages();
    UI.showToast('تم حذف المحادثة', 'info');
  }

  selectSession(id) {
    this.activeSessionId = id;
    Storage.setActiveSessionId(id);
    this.renderSidebarHistory();
    this.renderMessages();
    this.switchView('chat');

    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
  }

  switchView(viewName) {
    this.activeView = viewName;
    document.querySelectorAll('.studio-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    UI.refreshIcons();
  }

  renderCurrentView() {
    this.switchView(this.activeView);
    if (this.activeView === 'chat') this.renderMessages();
  }

  renderMessages() {
    const scrollContainer = document.getElementById('messages-scroll');
    const welcomeScreen = document.getElementById('welcome-screen');
    if (!scrollContainer) return;

    const session = this.getActiveSession();
    if (!session || session.messages.length === 0) {
      if (welcomeScreen) welcomeScreen.style.display = 'flex';
      scrollContainer.innerHTML = '';
      if (welcomeScreen) scrollContainer.appendChild(welcomeScreen);
      return;
    }

    if (welcomeScreen) welcomeScreen.style.display = 'none';
    scrollContainer.innerHTML = '';

    session.messages.forEach((msg) => {
      const row = document.createElement('div');
      row.className = `message-row ${msg.role}`;

      const avatar = document.createElement('div');
      avatar.className = `message-avatar ${msg.role}`;
      avatar.innerHTML = msg.role === 'user' 
        ? '<i data-lucide="user" style="width:20px;height:20px;"></i>' 
        : '<img src="./logo.jpg" alt="علواني" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />';

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'message-content-wrapper';

      if (msg.images && msg.images.length > 0) {
        const attContainer = document.createElement('div');
        attContainer.className = 'message-attachments';
        msg.images.forEach(img => {
          const imgEl = document.createElement('img');
          imgEl.src = img.base64;
          imgEl.className = 'attachment-img';
          attContainer.appendChild(imgEl);
        });
        contentWrapper.appendChild(attContainer);
      }

      const bubble = document.createElement('div');
      bubble.className = 'message-bubble markdown-body';
      bubble.innerHTML = UI.renderMarkdown(msg.content);
      contentWrapper.appendChild(bubble);

      if (msg.role === 'ai') {
        const toolbar = document.createElement('div');
        toolbar.className = 'message-toolbar';
        toolbar.innerHTML = `
          <button class="msg-tool-btn copy-msg-btn" data-text="${encodeURIComponent(msg.content)}">
            <i data-lucide="copy" style="width:14px;height:14px;"></i> نسخ
          </button>
          <button class="msg-tool-btn speak-msg-btn" data-text="${encodeURIComponent(msg.content)}">
            <i data-lucide="volume-2" style="width:14px;height:14px;"></i> قراءة
          </button>
        `;
        contentWrapper.appendChild(toolbar);
      }

      row.appendChild(avatar);
      row.appendChild(contentWrapper);
      scrollContainer.appendChild(row);
    });

    this.scrollToBottom();
    UI.refreshIcons();
    this.attachMessageEventListeners();
  }

  scrollToBottom() {
    const scrollContainer = document.getElementById('messages-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  attachMessageEventListeners() {
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.onclick = () => {
        const code = decodeURIComponent(btn.dataset.code);
        navigator.clipboard.writeText(code);
        UI.showToast('تم نسخ الكود للحافظة!', 'success');
      };
    });

    document.querySelectorAll('.run-code-btn').forEach(btn => {
      btn.onclick = () => {
        const code = decodeURIComponent(btn.dataset.code);
        const lang = btn.dataset.lang;
        this.openPlaygroundWithCode(code, lang);
      };
    });

    document.querySelectorAll('.copy-msg-btn').forEach(btn => {
      btn.onclick = () => {
        const text = decodeURIComponent(btn.dataset.text);
        navigator.clipboard.writeText(text);
        UI.showToast('تم نسخ الرد بالكامل!', 'success');
      };
    });

    document.querySelectorAll('.speak-msg-btn').forEach(btn => {
      btn.onclick = () => {
        const text = decodeURIComponent(btn.dataset.text);
        UI.speakText(text, this.settings.lang === 'ar' ? 'ar-SA' : 'en-US');
      };
    });
  }

  async handleSendMessage() {
    const input = document.getElementById('chat-input');
    const text = input ? input.value.trim() : '';

    if (!text && this.uploadedImages.length === 0) return;
    if (this.isGenerating) return;

    const session = this.getActiveSession();
    
    const userMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      images: [...this.uploadedImages],
      timestamp: Date.now()
    };

    session.messages.push(userMessage);

    if (session.messages.length === 1 && text) {
      session.title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }
    session.updatedAt = Date.now();
    Storage.saveSessions(this.sessions);

    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }
    this.uploadedImages = [];
    this.renderInputAttachments();
    this.renderSidebarHistory();
    this.renderMessages();

    const aiMessage = {
      id: 'msg_' + (Date.now() + 1),
      role: 'ai',
      content: '',
      timestamp: Date.now()
    };
    session.messages.push(aiMessage);

    this.isGenerating = true;
    this.updateSendButtonState(true);
    this.abortController = new AbortController();

    try {
      await AIService.sendMessage({
        messages: session.messages.slice(0, -1),
        settings: this.settings,
        signal: this.abortController.signal,
        onChunk: (accumulated) => {
          aiMessage.content = accumulated;
          this.renderMessages();
        }
      }).then(finalText => {
        aiMessage.content = finalText || aiMessage.content;
      });

      Storage.saveSessions(this.sessions);
      this.renderMessages();

      if (this.settings.autoSpeak && aiMessage.content) {
        UI.speakText(aiMessage.content, this.settings.lang === 'ar' ? 'ar-SA' : 'en-US');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        aiMessage.content = `⚠️ **حدث خطأ**: ${err.message || 'تعذر استلام الرد'}`;
        UI.showToast(err.message || 'حدث خطأ في الاتصال', 'error');
        this.renderMessages();
      }
    } finally {
      this.isGenerating = false;
      this.abortController = null;
      this.updateSendButtonState(false);
      Storage.saveSessions(this.sessions);
    }
  }

  stopGeneration() {
    if (this.abortController) {
      this.abortController.abort();
      this.isGenerating = false;
      this.updateSendButtonState(false);
      UI.showToast('تم إيقاف التوليد', 'info');
    }
  }

  updateSendButtonState(generating) {
    const sendBtn = document.getElementById('send-btn');
    if (!sendBtn) return;

    if (generating) {
      sendBtn.innerHTML = '<i data-lucide="square" style="width:18px;height:18px;"></i>';
      sendBtn.classList.add('stop-btn');
      sendBtn.title = 'إيقاف التوليد';
    } else {
      sendBtn.innerHTML = '<i data-lucide="arrow-up" style="width:20px;height:20px;"></i>';
      sendBtn.classList.remove('stop-btn');
      sendBtn.title = 'إرسال';
    }
    UI.refreshIcons();
  }

  handleFileUpload(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        UI.showToast('يرجى رفع صور فقط حالياً للتحليل البصري', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push({
          name: file.name,
          type: file.type,
          base64: e.target.result
        });
        this.renderInputAttachments();
      };
      reader.readAsDataURL(file);
    });
  }

  renderInputAttachments() {
    const previewContainer = document.getElementById('input-attachments-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';
    if (this.uploadedImages.length === 0) {
      previewContainer.style.display = 'none';
      return;
    }

    previewContainer.style.display = 'flex';
    this.uploadedImages.forEach((img, idx) => {
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.innerHTML = `
        <img src="${img.base64}" alt="${img.name}" />
        <button class="remove-attachment-btn" data-index="${idx}">×</button>
      `;
      previewContainer.appendChild(chip);
    });

    previewContainer.querySelectorAll('.remove-attachment-btn').forEach(btn => {
      btn.onclick = () => {
        const i = parseInt(btn.dataset.index);
        this.uploadedImages.splice(i, 1);
        this.renderInputAttachments();
      };
    });
  }

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.settings.lang === 'ar' ? 'ar-SA' : 'en-US';

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = transcript;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      const micBtn = document.getElementById('mic-btn');
      if (micBtn) micBtn.style.color = '';
    };

    this.recognition.onerror = () => {
      this.isListening = false;
      const micBtn = document.getElementById('mic-btn');
      if (micBtn) micBtn.style.color = '';
    };
  }

  toggleSpeechInput() {
    if (!this.recognition) {
      UI.showToast('المتصفح لا يدعم ميزة التعرف الصوتي', 'warning');
      return;
    }

    const micBtn = document.getElementById('mic-btn');
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      if (micBtn) micBtn.style.color = '';
    } else {
      this.recognition.lang = this.settings.lang === 'ar' ? 'ar-SA' : 'en-US';
      this.recognition.start();
      this.isListening = true;
      if (micBtn) micBtn.style.color = 'var(--danger)';
      UI.showToast('تحدث الآن...', 'info', 2000);
    }
  }

  renderSidebarHistory() {
    const container = document.getElementById('sidebar-history');
    if (!container) return;

    const searchTerm = (document.getElementById('sidebar-search-input')?.value || '').toLowerCase();

    const filtered = this.sessions.filter(s => {
      const matchCat = this.activeCategory === 'all' || s.category === this.activeCategory;
      const matchSearch = !searchTerm || s.title.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--text-dim);font-size:0.85rem;padding:20px;">لا توجد محادثات</div>`;
      return;
    }

    filtered.forEach(session => {
      const item = document.createElement('div');
      item.className = `history-item ${session.id === this.activeSessionId ? 'active' : ''}`;
      item.onclick = () => this.selectSession(session.id);

      const iconName = session.category === 'coding' ? 'code-2' : session.category === 'image' ? 'image' : session.category === 'article' ? 'file-text' : 'message-square';

      item.innerHTML = `
        <div class="history-item-content">
          <i data-lucide="${iconName}" style="width:16px;height:16px;flex-shrink:0;"></i>
          <span class="history-item-title">${session.title || 'محادثة'}</span>
        </div>
        <div class="history-actions">
          <button class="history-btn delete" data-id="${session.id}" title="حذف">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
          </button>
        </div>
      `;

      const delBtn = item.querySelector('.delete');
      if (delBtn) {
        delBtn.onclick = (e) => this.deleteSession(session.id, e);
      }

      container.appendChild(item);
    });

    UI.refreshIcons();
  }

  initCodeStudio() {
    const editor = document.getElementById('code-studio-editor');
    const runBtn = document.getElementById('run-code-btn');
    const previewFrame = document.getElementById('code-preview-frame');

    if (runBtn && editor && previewFrame) {
      runBtn.onclick = () => {
        const code = editor.value;
        const blob = new Blob([code], { type: 'text/html' });
        previewFrame.src = URL.createObjectURL(blob);
        UI.showToast('تم تشغيل وتحديث المعاينة بنجاح!', 'success');
        UI.triggerConfetti();
      };
    }

    document.querySelectorAll('.code-action-chip').forEach(chip => {
      chip.onclick = async () => {
        const action = chip.dataset.action;
        const code = editor?.value || '';
        if (!code.trim()) {
          UI.showToast('يرجى كتابة كود في المحرر أولاً', 'warning');
          return;
        }

        let prompt = '';
        if (action === 'explain') prompt = `اشرح هذا الكود بالتفصيل، وما هي وظيفته وخوارزميته:\n\`\`\`\n${code}\n\`\`\``;
        else if (action === 'fix') prompt = `افحص هذا الكود، واكتشف أي أخطاء أو ثغرات أمنية، وقدم النسخة المصححة مع الشرح:\n\`\`\`\n${code}\n\`\`\``;
        else if (action === 'optimize') prompt = `قم بتحسين أداء هذا الكود وجعله أسرع وأكثر نظافة (Refactor & Clean Code):\n\`\`\`\n${code}\n\`\`\``;
        else if (action === 'convert') prompt = `حول هذا الكود إلى لغة Python مع التوثيق الكامل:\n\`\`\`\n${code}\n\`\`\``;

        this.createNewSession('coding', `برمجة: ${action}`);
        const chatInput = document.getElementById('chat-input');
        if (chatInput) chatInput.value = prompt;
        this.handleSendMessage();
      };
    });
  }

  openPlaygroundWithCode(code, lang) {
    this.switchView('code');
    const editor = document.getElementById('code-studio-editor');
    if (editor) {
      if (lang === 'html' || code.includes('<html') || code.includes('<div')) {
        editor.value = code;
      } else if (lang === 'css') {
        editor.value = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${code}\n</style>\n</head>\n<body>\n  <div style="padding:20px;text-align:center;">معاينة تأثيرات CSS</div>\n</body>\n</html>`;
      } else if (lang === 'js' || lang === 'javascript') {
        editor.value = `<!DOCTYPE html>\n<html>\n<body>\n  <h2>معاينة كود JavaScript</h2>\n  <div id="output" style="padding:15px;background:#eee;font-family:monospace;"></div>\n  <script>\n    const log = (...args) => document.getElementById('output').innerHTML += args.join(' ') + '<br/>';\n    console.log = log;\n    try {\n${code}\n    } catch(e) { log('Error: ' + e.message); }\n  </script>\n</body>\n</html>`;
      } else {
        editor.value = code;
      }

      const runBtn = document.getElementById('run-code-btn');
      if (runBtn) runBtn.click();
    }
  }

  initArticleStudio() {
    const generateBtn = document.getElementById('generate-article-btn');
    const outputArea = document.getElementById('article-output-body');
    const copyBtn = document.getElementById('copy-article-btn');
    const downloadBtn = document.getElementById('download-article-btn');
    const expandBtn = document.getElementById('expand-article-btn');
    const wordCountBadge = document.getElementById('article-word-count');

    this.currentArticleText = '';

    const updateArticleUI = (text) => {
      this.currentArticleText = text;
      if (outputArea) {
        outputArea.innerHTML = UI.renderMarkdown(text);
      }
      if (wordCountBadge && text) {
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        wordCountBadge.style.display = 'inline-block';
        wordCountBadge.textContent = `${words} كلمة • حوالي ${Math.ceil(words / 200)} دقيقة قراءة`;
      }
      if (expandBtn && text) {
        expandBtn.style.display = 'inline-flex';
      }
      UI.refreshIcons();
    };

    // Copy Article Button
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (!this.currentArticleText) {
          UI.showToast('لا يوجد مقال لنسخه حالياً', 'warning');
          return;
        }
        navigator.clipboard.writeText(this.currentArticleText);
        UI.showToast('تم نسخ المقال كاملاً إلى الحافظة! 📋', 'success');
      };
    }

    // Download Article Button
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        if (!this.currentArticleText) {
          UI.showToast('قم بإنشاء المقال أولاً لتنزيله', 'warning');
          return;
        }
        const topic = document.getElementById('article-topic')?.value?.trim() || 'مقال-ذكاء-اصطناعي';
        const blob = new Blob([this.currentArticleText], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UI.showToast('تم تنزيل المقال بنجاح! 📥', 'success');
      };
    }

    // Expand / Write More Button
    if (expandBtn) {
      expandBtn.onclick = async () => {
        if (!this.currentArticleText) return;
        const topic = document.getElementById('article-topic')?.value?.trim() || '';
        
        expandBtn.disabled = true;
        expandBtn.innerHTML = '<i data-lucide="loader" class="animate-spin" style="width:14px;height:14px;"></i> جاري كتابة المزيد...';
        UI.refreshIcons();

        const expandPrompt = `تابع وأكمل كتابة هذا المقال حول "${topic}". أضف فقرات تحليلية جديدة، دراسات حالة وأمثلة واقعية، إحصائيات، وقسم نصائح عملية ختامية. تابع مباشرة بدون تكرار ما سبق:\n\nسياق المقال الحالي:\n${this.currentArticleText.slice(-1500)}`;

        try {
          const addition = await AIService.sendMessage({
            messages: [{ role: 'user', content: expandPrompt }],
            settings: { ...this.settings, systemPersona: 'writer' }
          });

          const fullUpdated = this.currentArticleText + '\n\n' + addition;
          updateArticleUI(fullUpdated);
          UI.triggerConfetti();
          UI.showToast('تمت إضافة وتوسيع المقال بفقرات جديدة! ✨', 'success');
        } catch (e) {
          UI.showToast('فشل توسيع المقال: ' + e.message, 'error');
        } finally {
          expandBtn.disabled = false;
          expandBtn.innerHTML = '<i data-lucide="plus-circle" style="width:14px;height:14px;"></i> كتابة المزيد';
          UI.refreshIcons();
        }
      };
    }

    if (generateBtn) {
      generateBtn.onclick = async () => {
        const topic = document.getElementById('article-topic')?.value?.trim();
        if (!topic) {
          UI.showToast('يرجى كتابة موضوع المقال', 'warning');
          return;
        }

        const tone = document.getElementById('article-tone')?.value || 'احترافي';
        const length = document.getElementById('article-length')?.value || 'شامل ومفصل';
        const keywords = document.getElementById('article-keywords')?.value?.trim() || '';

        const prompt = `اكتب مقالاً احترافياً كاملاً متوافقاً مع معايير الـ SEO حول:\nالموضوع: "${topic}"\nالنبرة: ${tone}\nالطول: ${length}\nالكلمات المفتاحية: ${keywords || 'اختر الأفضل'}\n\nيجب أن يتضمن المقال:\n1. عنوان SEO جذاب.\n2. مقدمة تجذب القارئ.\n3. جدول المحتويات.\n4. فقرات مفصلة بعناوين H2 و H3.\n5. جدول مقارنة أو إحصائيات.\n6. قسم الأسئلة الشائعة (FAQ).\n7. خاتمة ودعوة لاتخاذ إجراء (CTA).`;

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader" class="animate-spin" style="width:16px;height:16px;"></i> جاري كتابة المقال...';
        UI.refreshIcons();

        if (outputArea) {
          outputArea.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><p>جاري صياغة مقالك بأعلى درجات الاحترافية...</p></div>';
        }

        try {
          const articleContent = await AIService.sendMessage({
            messages: [{ role: 'user', content: prompt }],
            settings: { ...this.settings, systemPersona: 'writer' }
          });

          updateArticleUI(articleContent);
          UI.triggerConfetti();
          UI.showToast('تم إنشاء المقال بنجاح!', 'success');
        } catch (e) {
          UI.showToast(e.message || 'فشل توليد المقال', 'error');
          if (outputArea) outputArea.innerHTML = `<p style="color:var(--danger)">فشل التوليد: ${e.message}</p>`;
        } finally {
          generateBtn.disabled = false;
          generateBtn.innerHTML = '<i data-lucide="pen-tool" style="width:18px;height:18px;"></i> إنشاء المقال بالذكاء الاصطناعي';
          UI.refreshIcons();
        }
      };
    }
  }

  initImageStudio() {
    document.querySelectorAll('.style-card-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.style-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedImageStyle = btn.dataset.style;
      };
    });

    document.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedAspectRatio = btn.dataset.ratio;
      };
    });

    const enhanceBtn = document.getElementById('enhance-prompt-btn');
    const promptInput = document.getElementById('image-prompt-input');

    if (enhanceBtn && promptInput) {
      enhanceBtn.onclick = async () => {
        const text = promptInput.value.trim();
        if (!text) {
          UI.showToast('اكتب وصفاً بسيطاً أولاً لتحسينه', 'warning');
          return;
        }

        enhanceBtn.disabled = true;
        enhanceBtn.innerHTML = 'جاري التحسين...';

        try {
          const enhanced = await AIService.enhanceImagePrompt(text, this.selectedImageStyle);
          promptInput.value = enhanced;
          UI.showToast('تم تحسين البرومبت بنجاح! 🚀', 'success');
        } catch (e) {
          UI.showToast('فشل تحسين البرومبت', 'error');
        } finally {
          enhanceBtn.disabled = false;
          enhanceBtn.innerHTML = '<i data-lucide="wand-2" style="width:14px;height:14px;"></i> تحسين البرومبت بالـ AI';
          UI.refreshIcons();
        }
      };
    }

    const generateImgBtn = document.getElementById('generate-image-btn');
    if (generateImgBtn) {
      generateImgBtn.onclick = () => this.handleGenerateImage();
    }
  }

  async handleGenerateImage() {
    const promptInput = document.getElementById('image-prompt-input');
    const prompt = promptInput?.value?.trim();
    if (!prompt) {
      UI.showToast('يرجى كتابة وصف الصورة أولاً', 'warning');
      return;
    }

    const previewContainer = document.getElementById('image-preview-wrapper');
    const generateImgBtn = document.getElementById('generate-image-btn');

    if (generateImgBtn) {
      generateImgBtn.disabled = true;
      generateImgBtn.innerHTML = 'جاري التصميم والتوليد...';
    }

    if (previewContainer) {
      previewContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:360px;width:100%;background:rgba(0,0,0,0.2);border-radius:16px;">
          <p style="font-weight:700;margin-bottom:4px;">جاري رسم وتوليد الصورة بدقة 8K...</p>
          <p style="color:var(--text-muted);font-size:0.85rem;">يتم استخدام محرك FLUX الفائق</p>
        </div>
      `;
    }

    const imageUrl = AIService.buildImageUrl({
      prompt,
      style: this.selectedImageStyle,
      aspectRatio: this.selectedAspectRatio,
      seed: Math.floor(Math.random() * 9999999)
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const imageItem = {
        id: 'img_' + Date.now(),
        url: imageUrl,
        prompt,
        style: this.selectedImageStyle,
        aspectRatio: this.selectedAspectRatio,
        createdAt: Date.now()
      };

      this.gallery.unshift(imageItem);
      Storage.saveGallery(this.gallery);

      if (previewContainer) {
        previewContainer.innerHTML = `
          <img src="${imageUrl}" alt="${prompt}" />
          <div style="position:absolute;bottom:16px;display:flex;gap:10px;">
            <a href="${imageUrl}" target="_blank" download="chat-ai-image.jpg" class="gradient-btn" style="padding:8px 18px;border-radius:8px;text-decoration:none;display:flex;align-items:center;gap:6px;font-size:0.9rem;">
              <i data-lucide="download" style="width:16px;height:16px;"></i> تحميل بدقة HD
            </a>
          </div>
        `;
      }

      this.renderGallery();
      UI.triggerConfetti();
      UI.showToast('تم تصميم وتوليد الصورة بنجاح! 🎨', 'success');

      if (generateImgBtn) {
        generateImgBtn.disabled = false;
        generateImgBtn.innerHTML = '<i data-lucide="sparkles" style="width:18px;height:18px;"></i> تصميم وتوليد الصورة';
        UI.refreshIcons();
      }
    };

    img.onerror = () => {
      UI.showToast('حدث خطأ في تحميل الصورة، يرجى المحاولة ثانية', 'error');
      if (generateImgBtn) {
        generateImgBtn.disabled = false;
        generateImgBtn.innerHTML = '<i data-lucide="sparkles" style="width:18px;height:18px;"></i> تصميم وتوليد الصورة';
        UI.refreshIcons();
      }
    };
  }

  renderGallery() {
    const galleryGrid = document.getElementById('image-gallery-grid');
    if (!galleryGrid) return;

    if (this.gallery.length === 0) {
      galleryGrid.innerHTML = '<div style="color:var(--text-dim);font-size:0.85rem;grid-column:1/-1;text-align:center;padding:20px;">معرض الصور فارغ، ابدأ بتوليد أول صورة!</div>';
      return;
    }

    galleryGrid.innerHTML = '';
    this.gallery.forEach(item => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      el.innerHTML = `
        <img src="${item.url}" alt="${item.prompt}" loading="lazy" />
        <div class="gallery-overlay">
          <p style="color:white;font-size:0.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.prompt}</p>
        </div>
      `;
      el.onclick = () => {
        const previewContainer = document.getElementById('image-preview-wrapper');
        if (previewContainer) {
          previewContainer.innerHTML = `
            <img src="${item.url}" alt="${item.prompt}" />
            <div style="position:absolute;bottom:16px;display:flex;gap:10px;">
              <a href="${item.url}" target="_blank" download="chat-ai-image.jpg" class="gradient-btn" style="padding:8px 18px;border-radius:8px;text-decoration:none;display:flex;align-items:center;gap:6px;font-size:0.9rem;">
                <i data-lucide="download" style="width:16px;height:16px;"></i> تحميل بدقة HD
              </a>
            </div>
          `;
          UI.refreshIcons();
        }
      };
      galleryGrid.appendChild(el);
    });
  }

  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings-btn');
    const sidebarOpenBtn = document.getElementById('sidebar-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const testBtn = document.getElementById('test-api-btn');

    const openModal = () => {
      this.populateSettingsForm();
      if (modal) modal.classList.add('show');
      UI.refreshIcons();
    };

    const closeModal = () => {
      if (modal) modal.classList.remove('show');
    };

    if (openBtn) openBtn.onclick = openModal;
    if (sidebarOpenBtn) sidebarOpenBtn.onclick = openModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    if (saveBtn) {
      saveBtn.onclick = () => {
        this.saveSettingsForm();
        closeModal();
        UI.showToast('تم حفظ الإعدادات بنجاح', 'success');
        this.updateApiStatusBadge();
      };
    }

    if (testBtn) {
      testBtn.onclick = async () => {
        const currentFormSettings = this.readSettingsForm();
        testBtn.disabled = true;
        testBtn.innerHTML = 'فحص الاتصال...';

        const res = await AIService.testConnection(currentFormSettings);
        if (res.success) {
          this.saveSettingsForm();
          this.updateApiStatusBadge();
          UI.showToast(res.message + ' (تم حفظ الإعدادات تلقائياً ✅)', 'success');
        } else {
          UI.showToast(res.message, 'error');
        }

        testBtn.disabled = false;
        testBtn.innerHTML = '<i data-lucide="activity" style="width:16px;height:16px;"></i> فحص واختبار الاتصال';
        UI.refreshIcons();
      };
    }

    // Auto-save on every field change
    ['setting-provider', 'setting-gemini-key', 'setting-gemini-model', 'setting-openai-key', 'setting-openai-model', 'setting-openrouter-key', 'setting-persona', 'setting-custom-prompt', 'setting-temp'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.saveSettingsForm());
        el.addEventListener('change', () => this.saveSettingsForm());
      }
    });
  }

  populateSettingsForm() {
    const pSelect = document.getElementById('setting-provider');
    if (pSelect) pSelect.value = this.settings.provider || 'default';

    const gKey = document.getElementById('setting-gemini-key');
    if (gKey) gKey.value = this.settings.geminiApiKey || '';

    const gModel = document.getElementById('setting-gemini-model');
    if (gModel) gModel.value = this.settings.geminiModel || 'gemini-3.6-flash';

    const oKey = document.getElementById('setting-openai-key');
    if (oKey) oKey.value = this.settings.openaiApiKey || '';

    const oModel = document.getElementById('setting-openai-model');
    if (oModel) oModel.value = this.settings.openaiModel || 'gpt-4o-mini';

    const rKey = document.getElementById('setting-openrouter-key');
    if (rKey) rKey.value = this.settings.openrouterApiKey || '';

    const persona = document.getElementById('setting-persona');
    if (persona) persona.value = this.settings.systemPersona || 'general';

    const prompt = document.getElementById('setting-custom-prompt');
    if (prompt) prompt.value = this.settings.customSystemPrompt || '';

    const temp = document.getElementById('setting-temp');
    const tempVal = document.getElementById('setting-temp-val');
    if (temp) {
      temp.value = this.settings.temperature ?? 0.7;
      if (tempVal) tempVal.textContent = temp.value;
      temp.oninput = () => { if (tempVal) tempVal.textContent = temp.value; };
    }

    this.toggleProviderFields(this.settings.provider || 'default');
  }

  toggleProviderFields(provider) {
    const geminiGroup = document.getElementById('gemini-settings-group');
    const openaiGroup = document.getElementById('openai-settings-group');
    const openrouterGroup = document.getElementById('openrouter-settings-group');

    if (geminiGroup) geminiGroup.style.display = provider === 'gemini' ? 'block' : 'none';
    if (openaiGroup) openaiGroup.style.display = provider === 'openai' ? 'block' : 'none';
    if (openrouterGroup) openrouterGroup.style.display = provider === 'openrouter' ? 'block' : 'none';
  }

  readSettingsForm() {
    return {
      provider: document.getElementById('setting-provider')?.value || 'default',
      geminiApiKey: document.getElementById('setting-gemini-key')?.value || '',
      geminiModel: document.getElementById('setting-gemini-model')?.value || 'gemini-3.6-flash',
      openaiApiKey: document.getElementById('setting-openai-key')?.value || '',
      openaiModel: document.getElementById('setting-openai-model')?.value || 'gpt-4o-mini',
      openrouterApiKey: document.getElementById('setting-openrouter-key')?.value || '',
      openrouterModel: 'deepseek/deepseek-r1',
      systemPersona: document.getElementById('setting-persona')?.value || 'general',
      customSystemPrompt: document.getElementById('setting-custom-prompt')?.value || '',
      temperature: parseFloat(document.getElementById('setting-temp')?.value || '0.7')
    };
  }

  saveSettingsForm() {
    const formData = this.readSettingsForm();
    this.settings = { ...this.settings, ...formData };
    Storage.saveSettings(this.settings);
    this.updateApiStatusBadge();
  }

  updateApiStatusBadge() {
    const badgeText = document.getElementById('api-provider-name');
    if (!badgeText) return;

    const names = {
      default: 'محرك مجاني فائق',
      gemini: `Gemini (${this.settings.geminiModel || '1.5 Flash'})`,
      openai: `OpenAI (${this.settings.openaiModel || 'GPT-4o'})`,
      openrouter: 'OpenRouter / DeepSeek'
    };
    badgeText.textContent = names[this.settings.provider] || 'نشط ومتصل';
  }

  setupEventListeners() {
    document.getElementById('new-chat-btn')?.addEventListener('click', () => {
      this.createNewSession('general', 'محادثة جديدة');
    });

    document.querySelectorAll('.studio-tab').forEach(tab => {
      tab.onclick = () => this.switchView(tab.dataset.view);
    });

    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeSidebarBtn = document.getElementById('mobile-sidebar-close');

    const openSidebar = () => {
      sidebar?.classList.add('open');
      backdrop?.classList.add('show');
    };

    const closeSidebar = () => {
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('show');
    };

    document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
      if (sidebar?.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    closeSidebarBtn?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      const nextTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
    });

    document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
      const nextLang = this.settings.lang === 'ar' ? 'en' : 'ar';
      this.applyLanguage(nextLang);
    });

    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.dataset.cat;
        this.renderSidebarHistory();
      };
    });

    document.getElementById('sidebar-search-input')?.addEventListener('input', () => {
      this.renderSidebarHistory();
    });

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
      });

      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    document.getElementById('send-btn')?.addEventListener('click', () => {
      if (this.isGenerating) {
        this.stopGeneration();
      } else {
        this.handleSendMessage();
      }
    });

    const fileInput = document.getElementById('file-upload-input');
    document.getElementById('upload-file-btn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files?.length) {
          this.handleFileUpload(e.target.files);
          fileInput.value = '';
        }
      });
    }

    document.getElementById('mic-btn')?.addEventListener('click', () => {
      this.toggleSpeechInput();
    });

    document.getElementById('setting-provider')?.addEventListener('change', (e) => {
      this.toggleProviderFields(e.target.value);
    });

    document.querySelectorAll('.quick-prompt-card').forEach(card => {
      card.onclick = () => {
        const p = card.dataset.prompt;
        if (p && chatInput) {
          chatInput.value = p;
          this.handleSendMessage();
        }
      };
    });

    this.initCodeStudio();
    this.initArticleStudio();
    this.initImageStudio();
    this.initSettingsModal();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new ChatAIApp();
});
